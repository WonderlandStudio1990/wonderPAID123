import { AuthService } from './services/auth.service';

// Export the singleton instance of AuthService
export const authService = AuthService.getInstance();

// Export the Supabase client from the AuthService
export const supabase = authService.getSupabaseClient();

// Export the Monite service from the AuthService
export const moniteService = authService.getMoniteService();

// Export the Monite API client from the AuthService
export const moniteApiClient = authService.getMoniteApiClient();