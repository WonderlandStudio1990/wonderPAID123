import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { MoniteEntity, MoniteEntityCreate } from '@/lib/monite/types';

export class EntityService {
    constructor(private supabaseClient: SupabaseClient) {}

    async createEntity(data: MoniteEntityCreate): Promise<MoniteEntity> {
        try {
            const { data: entity, error } = await this.supabaseClient
                .from('monite_entities')
                .insert({
                    name: data.name,
                    status: data.status || 'active',
                    metadata: data.metadata || {},
                    settings: data.settings || {},
                    monite_entity_id: `ent_${Math.random().toString(36).substr(2, 9)}`
                })
                .select()
                .single();

            if (error) throw error;
            return entity;
        } catch (error) {
            console.error('Failed to create entity:', error);
            throw error;
        }
    }

    async getEntity(id: string): Promise<MoniteEntity | null> {
        try {
            const { data: entity, error } = await this.supabaseClient
                .from('monite_entities')
                .select()
                .eq('id', id);

            if (error) throw error;
            return entity.length > 0 ? entity[0] : null;
        } catch (error) {
            if ((error as PostgrestError)?.code === 'PGRST116') {
                return null;
            }
            console.error('Failed to get entity:', error);
            throw error;
        }
    }

    async listEntities(): Promise<MoniteEntity[]> {
        try {
            const { data: entities, error } = await this.supabaseClient
                .from('monite_entities')
                .select();

            if (error) throw error;
            return entities;
        } catch (error) {
            console.error('Failed to list entities:', error);
            throw error;
        }
    }

    async updateEntity(id: string, data: Partial<MoniteEntityCreate>): Promise<MoniteEntity> {
        try {
            const { data: entity, error } = await this.supabaseClient
                .from('monite_entities')
                .update({
                    name: data.name,
                    status: data.status,
                    metadata: data.metadata,
                    settings: data.settings
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return entity;
        } catch (error) {
            console.error('Failed to update entity:', error);
            throw error;
        }
    }

    async deleteEntity(id: string): Promise<void> {
        try {
            const { error } = await this.supabaseClient
                .from('monite_entities')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Failed to delete entity:', error);
            throw error;
        }
    }
} 