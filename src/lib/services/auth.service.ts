import { 
  AuthError, 
  Session, 
  User, 
  WeakPassword,
  SupabaseClient,
  createClient
} from '@supabase/supabase-js';
import { MoniteService } from '@/lib/monite/service';
import { MoniteApiClient } from '@/lib/monite/api/client';

// Define proper response types
interface AuthSignUpResponse {
  user: User | null;
  session: Session | null;
}

interface AuthSignInResponse {
  user: User;
  session: Session;
  weakPassword?: WeakPassword | null;
}

interface AuthTokenResponse {
  session: Session | null;
  user: User | null;
}

interface ConfigValidationError extends Error {
  code: string;
  missingVars?: string[];
  cause?: unknown;
}

export class AuthService {
  private static instance: AuthService | null = null;
  private readonly moniteService: MoniteService;
  private readonly moniteApiClient: MoniteApiClient;
  private readonly supabaseClient: SupabaseClient;

  private constructor() {
    try {
      this.validateConfig();

      // Initialize Monite API client
      this.moniteApiClient = new MoniteApiClient(
        process.env.MONITE_API_URL || 'https://api.sandbox.monite.com',
        process.env.MONITE_CLIENT_ID!,
        process.env.MONITE_CLIENT_SECRET!
      );

      // Initialize Monite service
      this.moniteService = new MoniteService(
        process.env.MONITE_API_URL || 'https://api.sandbox.monite.com',
        process.env.MONITE_CLIENT_ID!,
        process.env.MONITE_CLIENT_SECRET!
      );

      // Initialize Supabase client
      this.supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    } catch (error) {
      const configError = new Error('Failed to initialize AuthService') as ConfigValidationError;
      configError.code = 'CONFIG_ERROR';
      configError.cause = error;
      throw configError;
    }
  }

  private validateConfig(): void {
    const requiredVars = [
      { key: 'MONITE_API_URL', value: process.env.MONITE_API_URL },
      { key: 'MONITE_CLIENT_ID', value: process.env.MONITE_CLIENT_ID },
      { key: 'MONITE_CLIENT_SECRET', value: process.env.MONITE_CLIENT_SECRET },
      { key: 'NEXT_PUBLIC_SUPABASE_LOCAL_URL', value: process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL },
      { key: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY }
    ];

    const missingVars = requiredVars.filter(({ value }) => !value).map(({ key }) => key);
    if (missingVars.length > 0) {
      const error = new Error(`Missing required configuration: ${missingVars.join(', ')}`) as ConfigValidationError;
      error.code = 'INVALID_CONFIG';
      error.missingVars = missingVars;
      throw error;
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signUp(email: string, password: string, name?: string): Promise<AuthSignUpResponse> {
    try {
      const { data, error } = await this.supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
          data: {
            name: name || email.split('@')[0]
          }
        },
      });

      if (error) {
        throw this.handleAuthError(error);
      }

      if (data.user) {
        try {
          // Create a Monite entity for the user
          await this.moniteService.createEntity({
            name: name || email.split('@')[0],
            status: 'active',
            metadata: {
              user_id: data.user.id,
              email: data.user.email,
              created_at: new Date().toISOString()
            },
            settings: {
              currency: 'USD',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
          });

          // Ensure we have a valid Monite API token
          await this.moniteApiClient.forceTokenRefresh();
        } catch (entityError) {
          // If entity creation fails, delete the user and throw
          await this.supabaseClient.auth.admin.deleteUser(data.user.id);
          throw entityError;
        }
      }

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signIn(email: string, password: string): Promise<AuthSignInResponse> {
    try {
      const { data, error } = await this.supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw this.handleAuthError(error);
      }

      // Refresh Monite API token on successful sign in
      await this.moniteApiClient.forceTokenRefresh();

      return {
        user: data.user,
        session: data.session,
        weakPassword: null,
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabaseClient.auth.signOut();

      if (error) {
        throw this.handleAuthError(error);
      }
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await this.supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined,
      });

      if (error) {
        throw this.handleAuthError(error);
      }
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await this.supabaseClient.auth.getSession();

      if (error) {
        throw this.handleAuthError(error);
      }

      if (session) {
        // Refresh Monite API token when getting current session
        await this.moniteApiClient.forceTokenRefresh();
      }

      return session;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await this.supabaseClient.auth.getUser();

      if (error) {
        throw this.handleAuthError(error);
      }

      return user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async refreshSession(): Promise<AuthTokenResponse> {
    try {
      const { data, error } = await this.supabaseClient.auth.refreshSession();

      if (error) {
        throw this.handleAuthError(error);
      }

      if (data.session) {
        // Refresh Monite API token when refreshing session
        await this.moniteApiClient.forceTokenRefresh();
      }

      return {
        session: data.session,
        user: data.user
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  private handleAuthError(error: unknown): Error {
    if (error instanceof AuthError) {
      return error;
    } else if (error instanceof Error) {
      return error;
    } else {
      return new Error('An unknown error occurred during authentication');
    }
  }

  getMoniteService(): MoniteService {
    return this.moniteService;
  }

  getMoniteApiClient(): MoniteApiClient {
    return this.moniteApiClient;
  }

  getSupabaseClient(): SupabaseClient {
    return this.supabaseClient;
  }
}