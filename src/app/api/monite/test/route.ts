import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MoniteService } from '@/lib/monite/service';
import { headers } from 'next/headers';

export async function GET() {
  try {
    // Get authorization header
    const headersList = headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
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

    // Verify the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(authorization.replace('Bearer ', ''));

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authorization token' },
        { status: 401 }
      );
    }

    // Initialize Monite service
    const moniteService = new MoniteService(
      process.env.MONITE_API_URL || 'https://api.sandbox.monite.com',
      process.env.MONITE_CLIENT_ID!,
      process.env.MONITE_CLIENT_SECRET!
    );

    // Create a test entity
    const testEntity = await moniteService.createEntity({
      name: `Test Entity - ${user.email}`,
      status: 'active',
      metadata: {
        user_id: user.id,
        email: user.email,
        test: true,
        created_at: new Date().toISOString()
      },
      settings: {
        currency: 'USD',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });

    // Get all entities for the user
    const entities = await moniteService.listEntities();

    return NextResponse.json({
      message: 'Monite API test successful',
      testEntity,
      existingEntities: entities,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Monite API test error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to test Monite API',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 