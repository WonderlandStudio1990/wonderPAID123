import { NextResponse } from 'next/server';
import { APIClient } from '@/lib/api/client';
import { MoniteCustomConfig } from '@/lib/monite/api/types';

export async function POST() {
  try {
    const moniteConfig: MoniteCustomConfig = {
      baseUrl: process.env.NEXT_PUBLIC_MONITE_API_URL!,
      clientId: process.env.NEXT_PUBLIC_MONITE_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_MONITE_CLIENT_SECRET!,
      apiVersion: process.env.PUBLIC_MONITE_VERSION!,
    };

    const apiClient = new APIClient(
      moniteConfig,
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await apiClient.getSupabase().auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 