// Comparison Score Card Component
// Displays original vs optimized scores with delta and justifications inline

import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getScoreColor, getScoreDelta, formatScoreDelta } from "../utils/helpers";

interface ComparisonScoreCardProps {
    title: string;
    originalScore: number;
    optimizedScore: number;
    originalJustification?: string;
    optimizedJustification?: string;
}

export const ComparisonScoreCard = ({
    title,
    originalScore,
    optimizedScore,
    originalJustification,
    optimizedJustification
}: ComparisonScoreCardProps) => {
    const delta = getScoreDelta(originalScore, optimizedScore);
    const improvement = delta > 0;
    const noChange = delta === 0;

    const getDeltaIcon = () => {
        if (noChange) return <Minus className="h-4 w-4" />;
        return improvement ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const getDeltaColor = () => {
        if (noChange) return 'text-gray-500';
        return improvement ? 'text-green-500' : 'text-red-500';
    };

    return (
        <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="space-y-3">
                {/* Title */}
                <h3 className="text-sm font-semibold text-slate-400">{title}</h3>

                {/* Score Comparison */}
                <div className="flex items-start justify-between gap-4">
                    {/* Original Score */}
                    <div className="flex-1 text-center p-3 border border-slate-700 rounded-lg bg-slate-900">
                        <p className="text-xs text-slate-400 mb-1">Original</p>
                        <p className={`text-2xl font-bold ${getScoreColor(originalScore)}`}>
                            {originalScore}
                        </p>
                        {originalJustification && (
                            <p className="text-xs text-slate-400 mt-2 text-left leading-relaxed">
                                {originalJustification}
                            </p>
                        )}
                    </div>

                    {/* Delta Arrow */}
                    <div className={`flex flex-col items-center pt-6 ${getDeltaColor()}`}>
                        {getDeltaIcon()}
                        <span className="text-xs font-semibold">{formatScoreDelta(delta)}</span>
                    </div>

                    {/* Optimized Score */}
                    <div className="flex-1 text-center p-3 border border-slate-700 rounded-lg bg-slate-900">
                        <p className="text-xs text-slate-400 mb-1">Optimized</p>
                        <p className={`text-2xl font-bold ${getScoreColor(optimizedScore)}`}>
                            {optimizedScore}
                        </p>
                        {optimizedJustification && (
                            <p className="text-xs text-slate-400 mt-2 text-left leading-relaxed">
                                {optimizedJustification}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};
