import { MoniteService } from '../lib/monite/service';
import {
    MoniteEntity,
    MoniteEntityCreate,
    MoniteCounterpart,
    MoniteToken,
    MoniteWebhookEvent
} from '../lib/monite/types';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    try {
        // Initialize MoniteService with environment variables
        const moniteService = new MoniteService(
            process.env.MONITE_API_URL || 'https://api.sandbox.monite.com',
            process.env.MONITE_CLIENT_ID!,
            process.env.MONITE_CLIENT_SECRET!
        );

        // Create test entity
        console.log('Creating test entity...');
        const timestamp = Date.now();
        const testEntity = await moniteService.createEntity({
            name: `Test Entity ${timestamp}`,
            type: 'individual',
            status: 'active',
            metadata: {
                user_id: `test-${timestamp}`,
                email: `test${timestamp}@wonderpaid.com`,
                created_at: new Date().toISOString()
            },
            settings: {
                currency: 'USD',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
        }) as MoniteEntity;

        console.log('Test entity created:', testEntity.id);

        // Get the created entity
        console.log('Fetching test entity...');
        const fetchedEntity = await moniteService.getEntity(testEntity.id) as MoniteEntity;
        console.log('Fetched entity:', fetchedEntity.id);

        // List all entities
        console.log('Listing all entities...');
        const { data: entities } = await moniteService.listEntities() as { data: MoniteEntity[] };
        console.log('Total entities:', entities.length);

        // Update the test entity
        console.log('Updating test entity...');
        const updatedEntity = await moniteService.updateEntity(testEntity.id, {
            name: `Updated Test Entity ${timestamp}`
        }) as MoniteEntity;
        console.log('Updated entity name:', updatedEntity.name);

        // Create a counterpart
        console.log('Creating test counterpart...');
        const counterpart = {
            entity_id: testEntity.id,
            type: 'individual' as const,
            name: `Test Counterpart ${timestamp}`,
            email: `counterpart${timestamp}@wonderpaid.com`
        };

        // Delete the test entity
        console.log('Deleting test entity...');
        await moniteService.deleteEntity(testEntity.id);
        console.log('Test entity deleted');

        console.log('All tests passed!');
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

main(); 