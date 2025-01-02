import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';
import { Metrics } from '../monitoring/metrics';
import { ErrorTracker } from '../monitoring/error-tracker';

interface MoniteToken {
    access_token: string;
    expires_in: number;
    token_type: string;
}

interface MoniteErrorResponse {
    message: string;
    code: string;
    details?: unknown;
}

interface MoniteApiError extends Error {
    code: string;
    status?: number;
    details?: unknown;
    retryCount?: number;
}

interface MoniteApiClientConfig {
    baseURL: string;
    clientId: string;
    clientSecret: string;
    apiVersion?: string;
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
}

export class MoniteApiClient {
    private axiosInstance: AxiosInstance;
    private accessToken: string | null = null;
    private tokenExpiry: number | null = null;
    private readonly config: Required<MoniteApiClientConfig>;
    private metrics: Metrics;
    private errorTracker: ErrorTracker;

    constructor(config: MoniteApiClientConfig) {
        this.config = {
            apiVersion: '2024-01-31',
            timeout: 30000,
            maxRetries: 3,
            retryDelay: 1000,
            ...config
        };

        this.axiosInstance = axios.create({
            baseURL: this.config.baseURL,
            timeout: this.config.timeout,
            headers: {
                'x-monite-version': this.config.apiVersion,
                'Content-Type': 'application/json',
            },
        });

        // Configure retry behavior
        axiosRetry(this.axiosInstance, {
            retries: this.config.maxRetries,
            retryDelay: (retryNumber: number) => {
                return retryNumber * this.config.retryDelay;
            },
            retryCondition: (error: AxiosError) => {
                // Retry on network errors or 5xx server errors
                return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
                       (error.response?.status ? error.response.status >= 500 : false);
            }
        });

        // Add request interceptor for auth token
        this.axiosInstance.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
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
            (error: AxiosError) => Promise.reject(this.handleError(error))
        );

        // Add response interceptor for error handling
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => response,
            (error: AxiosError) => Promise.reject(this.handleError(error))
        );

        this.metrics = new Metrics();
        this.errorTracker = new ErrorTracker();

        // Add response interceptor for monitoring
        this.axiosInstance.interceptors.response.use(
            (response) => {
                const duration = Date.now() - response.config.metadata.startTime;
                this.metrics.recordApiLatency(
                    response.config.url!,
                    response.config.method!,
                    duration / 1000
                );
                return response;
            },
            (error) => {
                this.errorTracker.trackError(error, {
                    url: error.config?.url,
                    method: error.config?.method
                });
                return Promise.reject(error);
            }
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
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                grant_type: 'client_credentials',
            }, {
                // Don't retry token refresh requests
                'axios-retry': {
                    retries: 0
                }
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
            const axiosError = error as AxiosError<MoniteErrorResponse>;
            const retryCount = axiosError.config?.['axios-retry']?.retryCount as number || 0;
            const errorResponse = axiosError.response?.data;
            
            const apiError = new Error(
                errorResponse?.message || axiosError.message
            ) as MoniteApiError;
            
            apiError.code = errorResponse?.code || 'API_ERROR';
            apiError.status = axiosError.response?.status;
            apiError.details = errorResponse?.details;
            apiError.retryCount = retryCount;
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

    public async request<T>(config: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.axiosInstance.request<T>(config);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public getAccessToken(): string | null {
        return this.accessToken;
    }

    public getTokenExpiry(): number | null {
        return this.tokenExpiry;
    }

    public async forceTokenRefresh(): Promise<void> {
        await this.refreshToken();
    }

    public getAxiosInstance(): AxiosInstance {
        return this.axiosInstance;
    }
}