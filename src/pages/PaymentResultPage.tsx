import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Home, RotateCcw, Wallet } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function PaymentResultPage() {
    const [location] = useLocation();
    const [status, setStatus] = useState<'success' | 'failed' | 'pending' | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        // Parse current URL
        const currentUrl = new URL(window.location.href);
        const path = currentUrl.pathname;
        const searchParams = currentUrl.searchParams;

        // Determine status based on path or params
        // Backend logic mentioned: /payment/failed or /payment/success
        if (path.includes('/payment/success')) {
            setStatus('success');
            // Refresh wallet data
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        } else if (path.includes('/payment/failed')) {
            setStatus('failed');
        } else {
            // Fallback: check query params if they exist (e.g. status=CANCELLED)
            const paramStatus = searchParams.get('status');
            if (paramStatus === 'CANCELLED') {
                setStatus('failed');
            } else if (paramStatus === 'PAID') {
                setStatus('success');
                queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            }
        }

        // Clean up URL parameters to hide technical details
        // Only keep the clean path
        const cleanPath = path;
        window.history.replaceState({}, '', cleanPath);

    }, [location, queryClient]);

    return (
        <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        {status === 'success' ? (
                            <div className="p-4 bg-green-500/10 rounded-full">
                                <CheckCircle2 className="w-16 h-16 text-green-500 animate-in zoom-in duration-300" />
                            </div>
                        ) : status === 'failed' ? (
                            <div className="p-4 bg-red-500/10 rounded-full">
                                <XCircle className="w-16 h-16 text-red-500 animate-in zoom-in duration-300" />
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-800 rounded-full">
                                <RotateCcw className="w-16 h-16 text-slate-400 animate-spin" />
                            </div>
                        )}
                    </div>
                    <CardTitle className="text-2xl text-white">
                        {status === 'success' ? 'Thanh toán thành công!' : status === 'failed' ? 'Thanh toán thất bại / Đã hủy' : 'Đang xử lý...'}
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <p className="text-slate-400">
                        {status === 'success'
                            ? 'Số tiền đã được cộng vào ví của bạn. Bạn có thể kiểm tra số dư ngay bây giờ.'
                            : status === 'failed'
                                ? 'Giao dịch đã bị hủy hoặc xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.'
                                : 'Vui lòng chờ trong giây lát...'}
                    </p>
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                    {status === 'failed' && (
                        <Link href="/deposit" className="w-full">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                <RotateCcw className="mr-2 h-4 w-4" /> Thử lại
                            </Button>
                        </Link>
                    )}

                    <div className="flex gap-3 w-full">
                        <Link href="/dashboard" className="flex-1">
                            <Button variant="outline" className="w-full bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white">
                                <Home className="mr-2 h-4 w-4" /> Trang chủ
                            </Button>
                        </Link>
                        <Link href="/transaction-history" className="flex-1">
                            <Button variant="outline" className="w-full bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white">
                                <Wallet className="mr-2 h-4 w-4" /> Lịch sử ví
                            </Button>
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
