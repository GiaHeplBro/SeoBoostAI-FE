import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { XCircle, Home, RotateCcw } from 'lucide-react';

export default function PaymentFailedPage() {
    const [countdown, setCountdown] = useState(5);

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
                {/* Failed Icon */}
                <div className="flex justify-center mb-6">
                    <div className="p-5 bg-red-500/20 rounded-full">
                        <XCircle className="w-20 h-20 text-red-500" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white mb-3">
                    Thanh toán thất bại!
                </h1>

                {/* Description */}
                <p className="text-slate-400 mb-6">
                    Giao dịch đã bị hủy hoặc xảy ra lỗi. Vui lòng thử lại.
                </p>

                {/* Countdown */}
                <div className="bg-slate-800 rounded-lg p-4 mb-6">
                    <p className="text-slate-400 text-sm">
                        Tự động chuyển về trang chủ sau
                    </p>
                    <p className="text-4xl font-bold text-red-500 mt-2">
                        {countdown}s
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <Link href="/deposit" className="flex-1">
                        <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                            <RotateCcw className="h-5 w-5" />
                            Thử lại
                        </button>
                    </Link>
                    <Link href="/dashboard" className="flex-1">
                        <button className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                            <Home className="h-5 w-5" />
                            Trang chủ
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
