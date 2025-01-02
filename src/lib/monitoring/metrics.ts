export class Metrics {
    private apiCalls: Map<string, number>;
    private apiLatencies: Map<string, number[]>;

    constructor() {
        this.apiCalls = new Map();
        this.apiLatencies = new Map();
    }

    private getKey(path: string, method: string, status?: number): string {
        return `${method}:${path}${status ? `:${status}` : ''}`;
    }

    incrementApiCalls(path: string, method: string, status: number): void {
        const key = this.getKey(path, method, status);
        const currentCount = this.apiCalls.get(key) || 0;
        this.apiCalls.set(key, currentCount + 1);
    }

    recordApiLatency(path: string, method: string, duration: number): void {
        const key = this.getKey(path, method);
        const latencies = this.apiLatencies.get(key) || [];
        latencies.push(duration);
        this.apiLatencies.set(key, latencies);
    }

    getApiCallCount(path: string, method: string, status?: number): number {
        const key = this.getKey(path, method, status);
        return this.apiCalls.get(key) || 0;
    }

    getApiLatencies(path: string, method: string): number[] {
        const key = this.getKey(path, method);
        return this.apiLatencies.get(key) || [];
    }

    getAverageLatency(path: string, method: string): number {
        const latencies = this.getApiLatencies(path, method);
        if (latencies.length === 0) return 0;
        const sum = latencies.reduce((acc, val) => acc + val, 0);
        return sum / latencies.length;
    }

    reset(): void {
        this.apiCalls.clear();
        this.apiLatencies.clear();
    }
} 