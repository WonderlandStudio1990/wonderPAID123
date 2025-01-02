import { MoniteService } from '../lib/monite/service';
import {
    MoniteEntityCreate,
    MoniteRole,
    MoniteBankAccount,
    MoniteWorkflow,
    MonitePayableCreate,
    MoniteReceivableCreate,
    MoniteVatId,
    MoniteEntitySettings,
    MoniteProjectSettings
} from '../lib/monite/types';
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
                if (signUpError.code === 'user_already_exists') {
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

        // Test entity creation
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

        // Test role creation
        console.log('Creating test role...');
        const testRole: MoniteRole = {
            name: 'Test Role',
            permissions: ['read:entities', 'write:entities']
        };
        const createdRole = await moniteService.createRole(testRole);
        console.log('Created role:', createdRole);

        // Test project settings
        console.log('Getting project settings...');
        const projectSettings = await moniteService.getProjectSettings();
        console.log('Project settings:', projectSettings);

        console.log('Updating project settings...');
        const updatedProjectSettings: MoniteProjectSettings = {
            default_currency: 'USD',
            available_currencies: ['USD', 'EUR'],
            vat_id_required: false
        };
        const updatedSettings = await moniteService.updateProjectSettings(updatedProjectSettings);
        console.log('Updated project settings:', updatedSettings);

        // Test bank account creation
        console.log('Creating test bank account...');
        const testBankAccount: MoniteBankAccount = {
            iban: 'DE89370400440532013000',
            bic: 'DEUTDEFF',
            bank_name: 'Test Bank',
            account_holder_name: 'Test Organization'
        };
        const createdBankAccount = await moniteService.createBankAccount(testBankAccount);
        console.log('Created bank account:', createdBankAccount);

        // Test workflow creation
        console.log('Creating test workflow...');
        const testWorkflow: MoniteWorkflow = {
            name: 'Test Workflow',
            steps: [
                {
                    type: 'approval',
                    config: {
                        approvers: [moniteService.session.user.id]
                    }
                }
            ]
        };
        const createdWorkflow = await moniteService.createWorkflow(testWorkflow);
        console.log('Created workflow:', createdWorkflow);

        // Test payable creation
        console.log('Creating test payable...');
        const testPayable: MonitePayableCreate = {
            amount: {
                currency: 'USD',
                value: 100
            },
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            counterpart_id: createdEntity.id,
            description: 'Test payable'
        };
        const createdPayable = await moniteService.createPayable(testPayable);
        console.log('Created payable:', createdPayable);

        // Test receivable creation
        console.log('Creating test receivable...');
        const testReceivable: MoniteReceivableCreate = {
            amount: {
                currency: 'USD',
                value: 200
            },
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            counterpart_id: createdEntity.id,
            description: 'Test receivable'
        };
        const createdReceivable = await moniteService.createReceivable(testReceivable);
        console.log('Created receivable:', createdReceivable);

        // Test VAT ID creation
        console.log('Creating test VAT ID...');
        const testVatId: MoniteVatId = {
            country_code: 'DE',
            value: 'DE123456789'
        };
        const createdVatId = await moniteService.createVatId(testVatId);
        console.log('Created VAT ID:', createdVatId);

        // Test entity settings
        console.log('Getting entity settings...');
        const entitySettings = await moniteService.getEntitySettings();
        console.log('Entity settings:', entitySettings);

        console.log('Updating entity settings...');
        const newEntitySettings: MoniteEntitySettings = {
            default_currency: 'USD',
            vat_id_required: true,
            approval_required: true
        };
        const updatedEntitySettings = await moniteService.updateEntitySettings(newEntitySettings);
        console.log('Updated entity settings:', updatedEntitySettings);

        // Test listing all resources
        console.log('Listing all resources...');

        const roles = await moniteService.listRoles();
        console.log('Roles:', roles);

        const bankAccounts = await moniteService.listBankAccounts();
        console.log('Bank accounts:', bankAccounts);

        const workflows = await moniteService.listWorkflows();
        console.log('Workflows:', workflows);

        const payables = await moniteService.listPayables();
        console.log('Payables:', payables);

        const receivables = await moniteService.listReceivables();
        console.log('Receivables:', receivables);

        const vatIds = await moniteService.listVatIds();
        console.log('VAT IDs:', vatIds);

        console.log('Test completed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

main(); 