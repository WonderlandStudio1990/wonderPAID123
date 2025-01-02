import { monitoringLogger } from './logger';
import { metricsCollector } from './metrics';

export interface ErrorEvent {
  error: Error;
  context?: Record<string, any>;
  severity: 'error' | 'warning' | 'info';
  timestamp: number;
}

class ErrorTracker {
  private errors: ErrorEvent[] = [];

  track(error: Error, severity: ErrorEvent['severity'] = 'error', context?: Record<string, any>) {
    const errorEvent: ErrorEvent = {
      error,
      context,
      severity,
      timestamp: Date.now()
    };

    this.errors.push(errorEvent);
    
    // Log the error
    monitoringLogger.error({
      error_message: error.message,
      error_stack: error.stack,
      error_context: context,
      error_severity: severity
    }, 'Error tracked');

    // Record error metric
    metricsCollector.record({
      name: 'error_count',
      value: 1,
      tags: {
        type: error.name,
        severity
      }
    });
  }

  getErrors(): ErrorEvent[] {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }
}

export const errorTracker = new ErrorTracker();
export default errorTracker; 