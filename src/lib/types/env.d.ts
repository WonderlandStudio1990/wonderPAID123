declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    MONITE_API_URL: string;
    MONITE_CLIENT_ID: string;
    MONITE_CLIENT_SECRET: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}