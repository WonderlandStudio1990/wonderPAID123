interface Span {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    metadata?: Record<string, unknown>;
}

export class Tracer {
    private spans: Map<string, Span>;
    private activeSpans: Set<string>;

    constructor() {
        this.spans = new Map();
        this.activeSpans = new Set();
    }

    startSpan(name: string, metadata?: Record<string, unknown>): string {
        const spanId = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const span: Span = {
            name,
            startTime: Date.now(),
            metadata
        };
        this.spans.set(spanId, span);
        this.activeSpans.add(spanId);
        return spanId;
    }

    endSpan(spanId: string): void {
        const span = this.spans.get(spanId);
        if (!span) {
            console.warn(`Span ${spanId} not found`);
            return;
        }

        span.endTime = Date.now();
        span.duration = span.endTime - span.startTime;
        this.activeSpans.delete(spanId);
    }

    getSpan(spanId: string): Span | undefined {
        return this.spans.get(spanId);
    }

    getActiveSpans(): Span[] {
        return Array.from(this.activeSpans)
            .map(id => this.spans.get(id))
            .filter((span): span is Span => span !== undefined);
    }

    getAllSpans(): Span[] {
        return Array.from(this.spans.values());
    }

    clearSpans(): void {
        this.spans.clear();
        this.activeSpans.clear();
    }
} 