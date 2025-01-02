import { useState, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { MoniteService } from '../service';
import { MoniteEntity, MoniteEntityCreate } from '../types';

export function useEntity() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const supabase = useSupabaseClient();

    // Initialize Monite service
    const moniteService = new MoniteService(
        process.env.NEXT_PUBLIC_MONITE_API_URL || 'https://api.sandbox.monite.com',
        process.env.NEXT_PUBLIC_MONITE_CLIENT_ID!,
        process.env.NEXT_PUBLIC_MONITE_CLIENT_SECRET!
    );

    const createEntity = useCallback(async (data: Omit<MoniteEntityCreate, 'status'> & { status?: 'active' | 'inactive' }): Promise<MoniteEntity | null> => {
        setLoading(true);
        setError(null);
        try {
            const entityData = {
                ...data,
                status: data.status || 'active'
            };
            const entity = await moniteService.createEntity(entityData) as MoniteEntity;
            return entity;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to create entity'));
            return null;
        } finally {
            setLoading(false);
        }
    }, [moniteService]);

    const getEntity = useCallback(async (id: string): Promise<MoniteEntity | null> => {
        setLoading(true);
        setError(null);
        try {
            const entity = await moniteService.getEntity(id) as MoniteEntity;
            return entity;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to get entity'));
            return null;
        } finally {
            setLoading(false);
        }
    }, [moniteService]);

    const listEntities = useCallback(async (): Promise<MoniteEntity[]> => {
        setLoading(true);
        setError(null);
        try {
            const { data: entities } = await moniteService.listEntities() as { data: MoniteEntity[] };
            return entities;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to list entities'));
            return [];
        } finally {
            setLoading(false);
        }
    }, [moniteService]);

    const updateEntity = useCallback(async (id: string, data: Partial<MoniteEntityCreate>): Promise<MoniteEntity | null> => {
        setLoading(true);
        setError(null);
        try {
            const entity = await moniteService.updateEntity(id, data) as MoniteEntity;
            return entity;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to update entity'));
            return null;
        } finally {
            setLoading(false);
        }
    }, [moniteService]);

    const deleteEntity = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await moniteService.deleteEntity(id);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to delete entity'));
            return false;
        } finally {
            setLoading(false);
        }
    }, [moniteService]);

    return {
        loading,
        error,
        createEntity,
        getEntity,
        listEntities,
        updateEntity,
        deleteEntity
    };
} 