export interface MoniteEntityCreate {
    name: string;
    type: 'individual' | 'organization';
    status?: 'active' | 'inactive';
    metadata?: {
        user_id: string;
        email: string | null;
        created_at: string;
    };
    settings?: {
        currency: string;
        timezone: string;
    };
}

export interface MoniteEntity extends Omit<MoniteEntityCreate, 'status'> {
    id: string;
    monite_entity_id: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

export interface MoniteToken {
    id: string;
    entity_id: string;
    access_token: string;
    refresh_token?: string;
    token_type: 'bearer';
    expires_at: string;
    created_at: string;
    updated_at: string;
    is_valid: boolean;
}

export interface MoniteCounterpart {
    id: string;
    entity_id: string;
    monite_counterpart_id: string;
    type: 'individual' | 'organization';
    name: string;
    email?: string;
    phone?: string;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, any>;
}

export interface MoniteWebhookEvent {
    id: string;
    event_type: string;
    entity_id: string;
    payload: any;
    processed: boolean;
    created_at: string;
    processed_at?: string;
}

export interface MoniteApiError extends Error {
    code: string;
    status?: number;
    details?: unknown;
}

export type CreateEntityParams = MoniteEntityCreate; 