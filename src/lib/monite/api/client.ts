import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface MoniteToken {
    access_token: string;
    expires_in: number;
    token_type: string;
}

interface MoniteApiError extends Error {
    code: string;
    status?: number;
    details?: unknown;
}

export class MoniteApiClient {
    private axiosInstance: AxiosInstance;
    private accessToken: string | null = null;
    private tokenExpiry: number | null = null;

    constructor(
        private readonly baseURL: string,
        private readonly clientId: string,
        private readonly clientSecret: string,
        private readonly apiVersion: string = '2024-01-31'
    ) {
        this.axiosInstance = axios.create({
            baseURL,
            headers: {
                'x-monite-version': apiVersion,
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor for auth token
        this.axiosInstance.interceptors.request.use(
            async (config) => {
                try {
                    if (this.shouldRefreshToken()) {
                        await this.refreshToken();
                    }
                    if (this.accessToken) {
                        config.headers.Authorization = `Bearer ${this.accessToken}`;
                    }
                    return config;
                } catch (error) {
                    return Promise.reject(this.handleError(error));
                }
            },
            (error) => Promise.reject(this.handleError(error))
        );

        // Add response interceptor for error handling
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => Promise.reject(this.handleError(error))
        );
    }

    private shouldRefreshToken(): boolean {
        if (!this.accessToken || !this.tokenExpiry) return true;
        // Refresh if token expires in less than 5 minutes
        return Date.now() >= (this.tokenExpiry - 5 * 60 * 1000);
    }

    private async refreshToken(): Promise<void> {
        try {
            const response = await this.axiosInstance.post<MoniteToken>('/v1/auth/token', {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'client_credentials',
            });

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
        } catch (error) {
            const authError = this.handleError(error);
            authError.code = 'AUTH_REFRESH_ERROR';
            throw authError;
        }
    }

    private handleError(error: unknown): MoniteApiError {
        if (axios.isAxiosError(error)) {
            const apiError = new Error(error.response?.data?.message || error.message) as MoniteApiError;
            apiError.code = error.response?.data?.code || 'API_ERROR';
            apiError.status = error.response?.status;
            apiError.details = error.response?.data;
            return apiError;
        }

        if (error instanceof Error) {
            const apiError = error as MoniteApiError;
            apiError.code = 'UNKNOWN_ERROR';
            return apiError;
        }

        const apiError = new Error('An unknown error occurred') as MoniteApiError;
        apiError.code = 'UNKNOWN_ERROR';
        return apiError;
    }

    // Helper method for custom requests
    public async request<T>(config: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.axiosInstance.request<T>(config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get the current access token
    public getAccessToken(): string | null {
        return this.accessToken;
    }

    // Get the token expiry timestamp
    public getTokenExpiry(): number | null {
        return this.tokenExpiry;
    }

    // Force token refresh
    public async forceTokenRefresh(): Promise<void> {
        await this.refreshToken();
    }

    // Get the axios instance for direct use
    public getAxiosInstance(): AxiosInstance {
        return this.axiosInstance;
    }
}