// Reusable metric card component

import { TrendingUp, TrendingDown } from "lucide-react";
import { getScoreColor } from "../utils/helpers";
import type { MetricKey } from "../utils/constants";

interface MetricCardProps {
    metricKey: MetricKey;
    metricName: string;
    value: number;
    unit?: string;
    change?: number;
    changeLabel?: (change: number) => string;
}

export const MetricCard = ({
    metricKey,
    metricName,
    value,
    unit = '',
    change,
    changeLabel
}: MetricCardProps) => {
    const displayValue = metricKey === 'CLS' ? value.toFixed(3) : Math.round(value);
    const colorClass = getScoreColor(metricKey, value);

    const getChangeColor = () => {
        if (!change || change === 0) return 'text-gray-400';

        // For Performance Score, positive change is good
        if (metricKey === 'PerformanceScore') {
            return change > 0 ? 'text-green-500' : 'text-red-500';
        }

        // For other metrics (lower is better), negative change is good
        return change < 0 ? 'text-green-500' : 'text-red-500';
    };

    const getChangeIcon = () => {
        if (!change || change === 0) return null;

        // For Performance Score, positive change shows up arrow
        if (metricKey === 'PerformanceScore') {
            return change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
        }

        // For other metrics, negative change shows down arrow (improvement)
        return change < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />;
    };

    const getDefaultChangeLabel = (change: number): string => {
        if (metricKey === 'PerformanceScore') {
            return change > 0
                ? `+${change.toFixed(0)} điểm so với lần trước`
                : `${change.toFixed(0)} điểm so với lần trước`;
        }

        if (metricKey === 'CLS') {
            return change < 0
                ? `${Math.abs(change).toFixed(3)} ổn định hơn`
                : `+${change.toFixed(3)} kém ổn định hơn`;
        }

        // For time-based metrics
        return change < 0
            ? `${Math.abs(change).toFixed(0)}ms nhanh hơn`
            : `+${change.toFixed(0)}ms chậm hơn`;
    };

    return (
        <div className="flex flex-col gap-2 rounded-xl p-6 border border-border bg-card">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${colorClass.replace('text-', 'bg-')}`}></div>
                <p className="text-sm font-medium text-muted-foreground">{metricName}</p>
            </div>

            <p className="text-4xl font-bold">
                {displayValue}
                {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
            </p>

            {change !== undefined && change !== 0 && (
                <div className={`flex items-center gap-1 ${getChangeColor()}`}>
                    {getChangeIcon()}
                    <p className="text-sm font-medium">
                        {changeLabel ? changeLabel(change) : getDefaultChangeLabel(change)}
                    </p>
                </div>
            )}
        </div>
    );
};
