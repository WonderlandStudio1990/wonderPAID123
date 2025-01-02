import { createClient } from '@supabase/supabase-js';
import { dbLogger } from './logger';

export class DatabaseMonitor {
  private supabase;
  private metrics: Metrics;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.metrics = new Metrics();
  }

  async trackQuery(query: string, params: any[]): Promise<void> {
    const startTime = Date.now();
    try {
      const result = await this.supabase.rpc('track_query_execution', {
        query_text: query,
        query_params: params
      });
      
      const duration = (Date.now() - startTime) / 1000;
      this.metrics.recordQueryLatency(query, duration);
      
      if (duration > 1.0) { // Alert on slow queries
        dbLogger.warn('Slow query detected', { query, duration, params });
      }
    } catch (error) {
      dbLogger.error('Query tracking failed', { error, query, params });
    }
  }
} 