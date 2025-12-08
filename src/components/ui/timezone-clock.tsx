import React, { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export const TimezoneClock = () => {
    const [time, setTime] = useState(new Date());
    const [timezone, setTimezone] = useState('');

    useEffect(() => {
        // Get the browser's resolved timezone
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setTimezone(tz);

        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-help transition-colors hover:bg-slate-200 dark:hover:bg-slate-700">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            <span className="tabular-nums">
                                {time.toLocaleTimeString('vi-VN', { hour12: false })}
                            </span>
                        </div>
                        <div className="h-3 w-px bg-slate-300 dark:bg-slate-600" />
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            <span className="max-w-[100px] truncate">{timezone}</span>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Giờ hiện tại của bạn ({timezone})</p>
                    <p className="text-[10px] text-slate-400">Hệ thống tự động chuyển đổi giờ theo vị trí của bạn</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
