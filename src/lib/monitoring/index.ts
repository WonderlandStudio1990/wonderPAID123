import { Metrics } from './metrics';
import { Tracer } from './tracer';

export class Monitoring {
  private static instance: Monitoring;
  private metrics: Metrics;
  private tracer: Tracer;

  private constructor() {
    this.metrics = new Metrics();
    this.tracer = new Tracer();
  }

  static getInstance(): Monitoring {
    if (!Monitoring.instance) {
      Monitoring.instance = new Monitoring();
    }
    return Monitoring.instance;
  }

  recordApiCall(path: string, method: string, status: number, duration: number) {
    this.metrics.incrementApiCalls(path, method, status);
    this.metrics.recordApiLatency(path, method, duration);
  }

  startSpan(name: string) {
    return this.tracer.startSpan(name);
  }
}

export const monitoring = Monitoring.getInstance();