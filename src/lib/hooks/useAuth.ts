import { useState, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { APIClient } from '../api/client';
import { MoniteCustomConfig } from '../monite/api/types';

interface AuthError {
  message: string;
  status: number;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const supabase = useSupabaseClient();

  const getApiClient = useCallback(() => {
    const moniteConfig: MoniteCustomConfig = {
      baseUrl: process.env.NEXT_PUBLIC_MONITE_API_URL!,
      clientId: process.env.NEXT_PUBLIC_MONITE_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_MONITE_CLIENT_SECRET!,
      apiVersion: process.env.PUBLIC_MONITE_VERSION!,
    };

    return new APIClient(
      moniteConfig,
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      return data;
    } catch (err) {
      const error = {
        message: err instanceof Error ? err.message : 'Failed to sign up',
        status: 400,
      };
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      return data;
    } catch (err) {
      const error = {
        message: err instanceof Error ? err.message : 'Failed to sign in',
        status: 400,
      };
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw new Error(signOutError.message);
      }

      return true;
    } catch (err) {
      const error = {
        message: err instanceof Error ? err.message : 'Failed to sign out',
        status: 400,
      };
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);

      if (resetError) {
        throw new Error(resetError.message);
      }

      return true;
    } catch (err) {
      const error = {
        message: err instanceof Error ? err.message : 'Failed to reset password',
        status: 400,
      };
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return {
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
} 