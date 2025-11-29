// Comparison Score Card Component
// Displays original vs optimized scores with delta

import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
        <Card className="p-4">
            <div className="space-y-3">
                {/* Title */}
                <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>

                {/* Score Comparison */}
                <div className="flex items-center justify-between gap-4">
                    {/* Original Score */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex-1 text-center p-3 border rounded-lg bg-muted/50">
                                    <p className="text-xs text-muted-foreground mb-1">Original</p>
                                    <p className={`text-2xl font-bold ${getScoreColor(originalScore)}`}>
                                        {originalScore}
                                    </p>
                                </div>
                            </TooltipTrigger>
                            {originalJustification && (
                                <TooltipContent side="bottom" className="max-w-xs">
                                    <p className="text-xs">{originalJustification}</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>

                    {/* Delta Arrow */}
                    <div className={`flex flex-col items-center ${getDeltaColor()}`}>
                        {getDeltaIcon()}
                        <span className="text-xs font-semibold">{formatScoreDelta(delta)}</span>
                    </div>

                    {/* Optimized Score */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex-1 text-center p-3 border rounded-lg bg-primary/5">
                                    <p className="text-xs text-muted-foreground mb-1">Optimized</p>
                                    <p className={`text-2xl font-bold ${getScoreColor(optimizedScore)}`}>
                                        {optimizedScore}
                                    </p>
                                </div>
                            </TooltipTrigger>
                            {optimizedJustification && (
                                <TooltipContent side="bottom" className="max-w-xs">
                                    <p className="text-xs">{optimizedJustification}</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </Card>
    );
};
