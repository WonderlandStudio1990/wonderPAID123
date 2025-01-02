import { AuthService } from '@/lib/services/auth.service';
import { MoniteEntity, MoniteEntityCreate } from '@/lib/monite/types';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables first
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Map environment variables correctly for local development
if (process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY;
}
if (process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL;
}

// Debug environment variables
console.log('Environment check:');
console.log('MONITE_API_URL:', process.env.MONITE_API_URL ? '✓' : '✗');
console.log('MONITE_CLIENT_ID:', process.env.MONITE_CLIENT_ID ? '✓' : '✗');
console.log('MONITE_CLIENT_SECRET:', process.env.MONITE_CLIENT_SECRET ? '✓' : '✗');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');

async function setupMoniteOrganization() {
  try {
    const authService = AuthService.getInstance();
    const timestamp = Date.now();
    const email = `test${timestamp}@wonderpaid.com`;

    console.log('Creating user:', email);
    const { user, session } = await authService.signUp(email, 'Test123!@#');
    if (!user) throw new Error('Failed to create user');

    console.log('Creating entity...');
    const entity = await authService.getMoniteService().createEntity({
      name: `WonderPAID Test Org ${timestamp}`,
      type: 'individual',
      status: 'active',
      metadata: {
        user_id: user.id,
        email: email,
        created_at: new Date().toISOString()
      },
      settings: {
        currency: 'USD',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }) as MoniteEntity;

    if (!entity) throw new Error('Failed to create entity');

    console.log('Storing entity...');
    const { error } = await authService.getSupabaseClient()
      .from('monite_user_entities')
      .insert([{ 
        user_id: user.id, 
        entity_id: entity.id, 
        entity_data: entity, 
        is_active: true 
      }]);
    
    if (error) {
      throw error;
    }

    console.log('Setup completed successfully!');
    console.log('User ID:', user.id);
    console.log('Entity ID:', entity.id);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupMoniteOrganization();