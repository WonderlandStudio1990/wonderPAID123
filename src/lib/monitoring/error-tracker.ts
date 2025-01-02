import { moniteLogger } from './logger';

export class ErrorTracker {
  private static readonly ERROR_THRESHOLD = 5;
  private errorCounts: Map<string, number> = new Map();

  trackError(error: Error, context: Record<string, any> = {}): void {
    const errorKey = `${error.name}:${error.message}`;
    const currentCount = (this.errorCounts.get(errorKey) || 0) + 1;
    this.errorCounts.set(errorKey, currentCount);

    moniteLogger.error('API Error:', {
      error: errorKey,
      count: currentCount,
      context
    });

    if (currentCount >= ErrorTracker.ERROR_THRESHOLD) {
      this.triggerAlert(errorKey, currentCount, context);
    }
  }

  private triggerAlert(errorKey: string, count: number, context: Record<string, any>): void {
    moniteLogger.warn('Error threshold exceeded', {
      error: errorKey,
      count,
      threshold: ErrorTracker.ERROR_THRESHOLD,
      context
    });
    // Add alert integration here
  }
} 