import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { CheckCircle2, Home, Wallet } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function PaymentSuccessPage() {
    const [countdown, setCountdown] = useState(5);
    const queryClient = useQueryClient();

    // Refresh wallet data on mount
    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }, [queryClient]);

    // Simple countdown
    useEffect(() => {
        if (countdown <= 0) {
            window.location.href = '/dashboard';
            return;
        }
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    return (
        <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 text-center shadow-2xl">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="p-5 bg-green-500/20 rounded-full">
                        <CheckCircle2 className="w-20 h-20 text-green-500" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white mb-3">
                    Thanh toán thành công!
                </h1>

                {/* Description */}
                <p className="text-slate-400 mb-6">
                    Số tiền đã được cộng vào ví của bạn thành công.
                </p>

                {/* Countdown */}
                <div className="bg-slate-800 rounded-lg p-4 mb-6">
                    <p className="text-slate-400 text-sm">
                        Tự động chuyển về trang chủ sau
                    </p>
                    <p className="text-4xl font-bold text-green-500 mt-2">
                        {countdown}s
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <Link href="/dashboard" className="flex-1">
                        <button className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                            <Home className="h-5 w-5" />
                            Trang chủ
                        </button>
                    </Link>
                    <Link href="/transaction-history" className="flex-1">
                        <button className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Lịch sử ví
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
