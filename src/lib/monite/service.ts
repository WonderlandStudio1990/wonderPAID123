import { createClient } from '@supabase/supabase-js';
import { MoniteEntityCreate } from '@/lib/monite/types';
import { EntityService } from '@/lib/monite/services/entity.service';

export class MoniteService {
    private supabaseClient;
    private entityService: EntityService;

    constructor(
        private apiUrl: string,
        private clientId: string,
        private clientSecret: string
    ) {
        this.supabaseClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );
        this.entityService = new EntityService(this.supabaseClient);
    }

    setSession(session: { user: any }) {
        // Implement session management
        console.log('Setting session for user:', session.user.id);
    }

    async createEntity(data: MoniteEntityCreate) {
        return await this.entityService.createEntity(data);
    }

    async getEntity(id: string) {
        return await this.entityService.getEntity(id);
    }

    async listEntities() {
        return await this.entityService.listEntities();
    }

    async updateEntity(id: string, data: Partial<MoniteEntityCreate>) {
        return await this.entityService.updateEntity(id, data);
    }

    async deleteEntity(id: string) {
        return await this.entityService.deleteEntity(id);
    }
} 