import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createPaymentLink } from '@/features/wallet/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Wallet, CreditCard, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DepositPage() {
    const [amount, setAmount] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const createPaymentMutation = useMutation({
        mutationFn: createPaymentLink,
        onSuccess: (data) => {
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                toast({
                    title: "Lỗi",
                    description: "Không nhận được link thanh toán từ hệ thống.",
                    variant: "destructive",
                });
            }
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi tạo giao dịch.";
            setError(errorMessage);
            toast({
                title: "Thất bại",
                description: errorMessage,
                variant: "destructive",
            });
        },
    });

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setAmount(value);
        setError(null);
    };

    const handleQuickSelect = (value: number) => {
        setAmount(value.toString());
        setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseInt(amount, 10);

        if (isNaN(numAmount)) {
            setError("Vui lòng nhập số tiền hợp lệ.");
            return;
        }

        if (numAmount < 10000) {
            setError("Số tiền nạp tối thiểu là 10.000 VNĐ.");
            return;
        }

        if (numAmount > 100000000) {
            setError("Số tiền nạp tối đa là 100.000.000 VNĐ.");
            return;
        }

        createPaymentMutation.mutate(numAmount);
    };

    const formatCurrency = (val: string) => {
        if (!val) return '0';
        return parseInt(val, 10).toLocaleString('vi-VN');
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
            <Card className="w-full max-w-lg bg-slate-900 border-slate-800">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-blue-500/10 rounded-full">
                            <Wallet className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl text-white">Nạp tiền vào ví</CardTitle>
                            <CardDescription className="text-slate-400">
                                Thanh toán an toàn qua cổng PayOS
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-slate-200">Số tiền muốn nạp (VNĐ)</Label>
                            <div className="relative">
                                <Input
                                    id="amount"
                                    type="text"
                                    placeholder="Nhập số tiền..."
                                    value={amount ? parseInt(amount).toLocaleString('vi-VN') : ''}
                                    onChange={handleAmountChange}
                                    className="pl-4 pr-12 text-lg font-semibold bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-blue-500"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                                    ₫
                                </span>
                            </div>
                            {amount && !isNaN(parseInt(amount)) && (
                                <p className="text-sm text-slate-400 text-right">
                                    Bằng chữ: {formatCurrency(amount)} đồng
                                </p>
                            )}
                        </div>

                        {/* Quick select buttons */}
                        <div className="grid grid-cols-3 gap-3">
                            {[50000, 100000, 200000, 500000, 1000000, 2000000].map((val) => (
                                <Button
                                    key={val}
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleQuickSelect(val)}
                                    className={`bg-slate-950 border-slate-700 hover:bg-slate-800 hover:text-white transition-all ${amount === val.toString() ? 'border-blue-500 text-blue-500 bg-blue-500/10' : 'text-slate-300'
                                        }`}
                                >
                                    {val.toLocaleString('vi-VN')}
                                </Button>
                            ))}
                        </div>

                        {error && (
                            <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-red-200">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Lỗi</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Alert className="bg-blue-900/20 border-blue-900/50 text-blue-200">
                            <Info className="h-4 w-4 text-blue-400" />
                            <AlertTitle className="text-blue-400">Lưu ý</AlertTitle>
                            <AlertDescription className="text-blue-200/80 text-sm mt-1">
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Số tiền nạp tối thiểu: 10.000 VNĐ</li>
                                    <li>Số tiền nạp tối đa: 100.000.000 VNĐ</li>
                                    <li>Giao dịch sẽ được xử lý tự động trong vài giây</li>
                                </ul>
                            </AlertDescription>
                        </Alert>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg shadow-lg shadow-blue-900/20"
                            disabled={createPaymentMutation.isPending}
                        >
                            {createPaymentMutation.isPending ? (
                                <>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    Tiếp tục thanh toán <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t border-slate-800 pt-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CreditCard className="w-4 h-4" />
                        <span>Hỗ trợ thanh toán qua QR Code</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
