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
import { RateLimiter } from '@/lib/utils/rate-limiter';

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
  private readonly rateLimiter: RateLimiter;

  private constructor() {
    try {
      this.validateConfig();

      // Initialize rate limiter
      this.rateLimiter = new RateLimiter({
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000 // 15 minutes
      });

      // Initialize Monite API client
      this.moniteApiClient = new MoniteApiClient({
        baseURL: process.env.MONITE_API_URL || 'https://api.sandbox.monite.com',
        clientId: process.env.MONITE_CLIENT_ID!,
        clientSecret: process.env.MONITE_CLIENT_SECRET!,
        timeout: 10000,
        maxRetries: 3
      });

      // Initialize Monite service
      this.moniteService = new MoniteService(
        process.env.MONITE_API_URL || 'https://api.sandbox.monite.com',
        process.env.MONITE_CLIENT_ID!,
        process.env.MONITE_CLIENT_SECRET!
      );

      // Initialize Supabase client with appropriate key based on environment
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NODE_ENV === 'development' 
        ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 
        : process.env.SUPABASE_SERVICE_ROLE_KEY!;

      this.supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
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
      { key: 'NEXT_PUBLIC_SUPABASE_URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL },
      { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
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

  private async checkRateLimit(identifier: string): Promise<void> {
    const isLimited = await this.rateLimiter.isRateLimited(identifier);
    if (isLimited) {
      const error = new Error('Too many attempts. Please try again later.') as AuthError;
      error.status = 429;
      throw error;
    }
  }

  async signUp(email: string, password: string, name?: string): Promise<AuthSignUpResponse> {
    try {
      await this.checkRateLimit(`signup:${email}`);

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
            type: 'individual',
            status: 'active',
            metadata: {
              user_id: data.user.id,
              email: data.user.email || null,
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
          if (process.env.NODE_ENV === 'development') {
            await this.supabaseClient.auth.admin.deleteUser(data.user.id);
          }
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
      await this.checkRateLimit(`signin:${email}`);

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
      await this.checkRateLimit(`reset:${email}`);

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
        try {
          // Refresh Monite API token when getting current session
          await this.moniteApiClient.forceTokenRefresh();
        } catch (error) {
          console.error('Failed to refresh Monite token:', error);
          // Don't throw here, just log the error
        }
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

  private handleAuthError(error: unknown): AuthError {
    if (error instanceof AuthError) {
      return error;
    }

    const authError = new Error(error instanceof Error ? error.message : 'An unknown error occurred') as AuthError;
    authError.status = 500;
    return authError;
  }

  // Public getters for services
  public getSupabaseClient(): SupabaseClient {
    return this.supabaseClient;
  }

  public getMoniteService(): MoniteService {
    return this.moniteService;
  }

  public getMoniteApiClient(): MoniteApiClient {
    return this.moniteApiClient;
  }
}