import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MoniteService } from '@/lib/monite/service';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Initialize Monite service
    const moniteService = new MoniteService(
      process.env.MONITE_API_URL || 'https://api.sandbox.monite.com',
      process.env.MONITE_CLIENT_ID!,
      process.env.MONITE_CLIENT_SECRET!
    );

    // Sign up the user with email verification
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        data: {
          name: name || email.split('@')[0]
        }
      }
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      );
    }

    try {
      // Create a Monite entity for the user
      const entity = await moniteService.createEntity({
        name: name || email.split('@')[0],
        type: 'individual',
        status: 'active',
        metadata: {
          user_id: authData.user.id,
          email: authData.user.email || null,
          created_at: new Date().toISOString()
        },
        settings: {
          currency: 'USD',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });

      return NextResponse.json({
        user: authData.user,
        entity
      });
    } catch (error) {
      // If entity creation fails, delete the user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw error;
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
} 