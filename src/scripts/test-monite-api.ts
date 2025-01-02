import { MoniteService } from '../lib/monite/service';
import { MoniteEntityCreate } from '../lib/monite/types';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    try {
        // Initialize MoniteService with environment variables
        const moniteService = new MoniteService(
            process.env.MONITE_API_URL!,
            process.env.MONITE_CLIENT_ID!,
            process.env.MONITE_CLIENT_SECRET!,
            process.env.MONITE_API_VERSION!,
            process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL,
            process.env.NEXT_PUBLIC_SUPABASE_LOCAL_ANON_KEY
        );

        // Test user authentication
        console.log('Authenticating test user...');
        const testUser = {
            email: `test${Date.now()}@wonderpaid.com`,
            password: 'Test123!'
        };

        try {
            const data = await moniteService.signInUser(testUser.email, testUser.password);
            console.log('Signed in existing test user:', data.user?.id);
            moniteService.setSession(data);
        } catch (signInError) {
            console.log('Failed to sign in, creating new user...');
            try {
                const data = await moniteService.signUpUser(testUser.email, testUser.password);
                console.log('Created new test user:', data.user?.id);
                moniteService.setSession(data);
            } catch (signUpError: any) {
                if (signUpError?.code === 'user_already_exists') {
                    console.log('User already exists, trying to sign in again...');
                    const data = await moniteService.signInUser(testUser.email, testUser.password);
                    console.log('Signed in existing test user:', data.user?.id);
                    moniteService.setSession(data);
                } else {
                    throw signUpError;
                }
            }
        }

        if (!moniteService.session?.user?.id) {
            throw new Error('No user session available');
        }

        // Create test entity
        console.log('Creating test entity...');
        const testEntity: MoniteEntityCreate = {
            type: 'organization',
            email: testUser.email,
            address: {
                country: 'US',
                city: 'San Francisco',
                postal_code: '94105',
                line1: '123 Test St',
                state: 'CA'
            },
            organization: {
                legal_name: 'Test Organization',
                tax_id: '123456789'
            }
        };

        const createdEntity = await moniteService.createEntityForUser(
            moniteService.session.user.id,
            testEntity
        );
        console.log('Created entity:', createdEntity);

        // Get entity for user
        console.log('Retrieving entity for user...');
        const retrievedEntity = await moniteService.getEntityForUser(moniteService.session.user.id);
        console.log('Retrieved entity:', retrievedEntity);

        console.log('Test completed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

main(); 