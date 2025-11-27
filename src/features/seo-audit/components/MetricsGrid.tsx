// Grid layout for displaying all metrics

import { MetricCard } from "./MetricCard";
import type { PageSpeedScores, ComparisonModel } from "../types";

interface MetricsGridProps {
    scores: PageSpeedScores;
    comparisonData: ComparisonModel | null;
}

export const MetricsGrid = ({ scores, comparisonData }: MetricsGridProps) => {
    return (
        <>
            {/* Debug: Show comparison data status */}
            {comparisonData && (
                <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                    <p className="text-blue-600 dark:text-blue-400">✓ Dữ liệu so sánh đã tải</p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                    metricKey="PerformanceScore"
                    metricName="Performance Score"
                    value={scores.PerformanceScore}
                    change={comparisonData?.scoreChange}
                />

                <MetricCard
                    metricKey="LCP"
                    metricName="LCP (Largest Contentful Paint)"
                    value={scores.LCP}
                    unit="ms"
                    change={comparisonData?.lcpChange}
                />

                <MetricCard
                    metricKey="FCP"
                    metricName="FCP (First Contentful Paint)"
                    value={scores.FCP}
                    unit="ms"
                    change={comparisonData?.fcpChange}
                />

                <MetricCard
                    metricKey="CLS"
                    metricName="CLS (Cumulative Layout Shift)"
                    value={scores.CLS}
                    change={comparisonData?.clsChange}
                />

                <MetricCard
                    metricKey="TBT"
                    metricName="TBT (Total Blocking Time)"
                    value={scores.TBT}
                    unit="ms"
                    change={comparisonData?.tbtChange}
                />

                <MetricCard
                    metricKey="SI"
                    metricName="SI (Speed Index)"
                    value={scores.SpeedIndex}
                    unit="ms"
                    change={comparisonData?.siChange}
                />

                <MetricCard
                    metricKey="TTI"
                    metricName="TTI (Time to Interactive)"
                    value={scores.TimeToInteractive}
                    unit="ms"
                    change={comparisonData?.ttiChange}
                />
            </div>
        </>
    );
};
