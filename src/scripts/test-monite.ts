import { MoniteService } from '@/lib/monite/service';
import { MoniteEntity, MoniteEntityCreate } from '@/lib/monite/types';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    try {
        console.log('DEBUG: Loading environment variables...');
        console.log('NEXT_PUBLIC_SUPABASE_LOCAL_URL:', process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL);

        // Initialize MoniteService with environment variables
        console.log('DEBUG: Initializing MoniteService...');
        const moniteService = new MoniteService(
            process.env.MONITE_API_URL || 'https://api.sandbox.monite.com',
            process.env.MONITE_CLIENT_ID!,
            process.env.MONITE_CLIENT_SECRET!
        );

        // Initialize Supabase admin client
        console.log('DEBUG: Initializing Supabase admin client...');
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Test user authentication
        console.log('\nDEBUG: Starting user authentication...');
        const testUser = {
            email: 'test@wonderpaid.com',
            password: 'Test123!'
        };
        console.log('Test user:', testUser.email);

        // Try to sign in first
        console.log('DEBUG: Attempting to sign in...');
        const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
            email: testUser.email,
            password: testUser.password
        });

        let userId: string;

        if (signInError) {
            console.log('DEBUG: Sign in failed:', signInError.message);
            console.log('DEBUG: Creating new user...');
            const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: testUser.email,
                password: testUser.password,
                email_confirm: true
            });

            if (createError) {
                console.error('Failed to create user:', createError);
                process.exit(1);
            }

            console.log('DEBUG: Created test user:', newUserData.user.id);
            userId = newUserData.user.id;
        } else {
            console.log('DEBUG: Signed in successfully:', signInData.user.id);
            userId = signInData.user.id;
        }

        // Create test entity
        console.log('\nDEBUG: Creating test entity...');
        const entityData = {
            name: 'Test Organization',
            type: 'organization' as const,
            status: 'active' as const,
            metadata: {
                user_id: userId,
                email: testUser.email,
                created_at: new Date().toISOString()
            },
            settings: {
                currency: 'USD',
                timezone: 'America/Los_Angeles'
            }
        } satisfies MoniteEntityCreate;

        console.log('DEBUG: Entity data:', JSON.stringify(entityData, null, 2));

        console.log('DEBUG: Creating entity...');
        const createdEntity = await moniteService.createEntity(entityData) as MoniteEntity;
        console.log('DEBUG: Entity created successfully');
        console.log('Created entity:', JSON.stringify(createdEntity, null, 2));

        // Get entity
        console.log('\nDEBUG: Retrieving entity...');
        const retrievedEntity = await moniteService.getEntity(createdEntity.id) as MoniteEntity;
        console.log('DEBUG: Entity retrieved successfully');
        console.log('Retrieved entity:', JSON.stringify(retrievedEntity, null, 2));

        // List entities
        console.log('\nDEBUG: Listing entities...');
        const { data: entities } = await moniteService.listEntities() as { data: MoniteEntity[] };
        console.log('DEBUG: Entities retrieved successfully');
        console.log('Total entities:', entities.length);

        // Update entity
        console.log('\nDEBUG: Updating entity...');
        const updatedEntity = await moniteService.updateEntity(createdEntity.id, {
            name: 'Updated Test Organization'
        }) as MoniteEntity;
        console.log('DEBUG: Entity updated successfully');
        console.log('Updated entity:', JSON.stringify(updatedEntity, null, 2));

        // Delete entity
        console.log('\nDEBUG: Deleting entity...');
        await moniteService.deleteEntity(createdEntity.id);
        console.log('DEBUG: Entity deleted successfully');

        console.log('\nAll tests passed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

main(); 