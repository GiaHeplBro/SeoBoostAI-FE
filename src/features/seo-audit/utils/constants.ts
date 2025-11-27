// Constants and configuration for SEO Audit

export const METRIC_THRESHOLDS = {
    LCP: { good: 2500, needsImprovement: 4000 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
    TBT: { good: 200, needsImprovement: 600 },
    FCP: { good: 1800, needsImprovement: 3000 },
    SI: { good: 3400, needsImprovement: 5800 },
    TTI: { good: 3800, needsImprovement: 7300 },
    PerformanceScore: { good: 90, needsImprovement: 50 }
} as const;

export type MetricKey = keyof typeof METRIC_THRESHOLDS;
