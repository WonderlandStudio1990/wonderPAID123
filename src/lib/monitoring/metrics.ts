import { monitoringLogger } from './logger';

export interface Metric {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: number;
}

class MetricsCollector {
  private metrics: Metric[] = [];

  record(metric: Metric) {
    this.metrics.push({
      ...metric,
      timestamp: metric.timestamp || Date.now()
    });
    
    monitoringLogger.info({
      metric_name: metric.name,
      metric_value: metric.value,
      metric_tags: metric.tags
    }, 'Metric recorded');
  }

  getMetrics(): Metric[] {
    return this.metrics;
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export const metricsCollector = new MetricsCollector();
export default metricsCollector;