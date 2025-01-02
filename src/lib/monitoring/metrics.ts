import { Counter, Histogram } from 'prom-client';


export class Metrics {
    private apiCallCounter: Counter;
    private apiLatencyHistogram: Histogram;
    private queryLatencyHistogram: Histogram;

    constructor() {
        this.apiCallCounter = new Counter({
            name: 'monite_api_calls_total',
            help: 'Total number of Monite API calls',
            labelNames: ['path', 'method', 'status']
        });

        this.apiLatencyHistogram = new Histogram({
            name: 'monite_api_latency_seconds',
            help: 'Latency of Monite API calls',
            labelNames: ['path', 'method'],
            buckets: [0.1, 0.5, 1, 2, 5]
        });

        this.queryLatencyHistogram = new Histogram({
            name: 'monite_query_latency_seconds',
            help: 'Latency of database queries',
            labelNames: ['query'],
            buckets: [0.1, 0.5, 1, 2, 5]
        });
    }

    incrementApiCalls(path: string, method: string, status: number): void {
        this.apiCallCounter.labels(path, method, status.toString()).inc();
    }

    recordApiLatency(path: string, method: string, duration: number): void {
        this.apiLatencyHistogram.labels(path, method).observe(duration);
    }

    recordQueryLatency(query: string, duration: number): void {
        this.queryLatencyHistogram.labels(query).observe(duration);
    }
}
