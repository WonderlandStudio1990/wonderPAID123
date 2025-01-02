// Re-export types from generated API
export * from './generated';

// Additional custom types
export interface MoniteHeaders {
    'Content-Type': string;
    'x-monite-version': string;
    'Authorization'?: string;
}

// Add any additional custom types that aren't covered by the generated API
export interface MoniteCustomConfig {
    baseUrl: string;
    clientId: string;
    clientSecret: string;
    apiVersion?: string;
}

export interface MoniteEntity {
    id: string;
    type: 'individual' | 'organization';
    created_at: string;
    updated_at: string;
    status?: string;
    metadata?: Record<string, any>;
}

export interface CreateEntityRequest {
    type: 'individual' | 'organization';
    created_at: string;
    updated_at: string;
    metadata?: Record<string, any>;
} 