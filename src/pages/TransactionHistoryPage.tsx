import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUserProfile, fetchTransactions } from '@/features/wallet/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Loader2, ArrowUpCircle, ArrowDownCircle, ShoppingCart, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateTime } from '@/utils/dateUtils';

export default function TransactionHistoryPage() {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    const { data: user, isLoading: loadingUser } = useQuery({
        queryKey: ['userProfile'],
        queryFn: fetchUserProfile,
    });

    const { data: transactionData, isLoading: loadingTransactions } = useQuery({
        queryKey: ['transactions', page, pageSize],
        queryFn: () => fetchTransactions(page, pageSize),
        placeholderData: (previousData) => previousData,
    });

    const isLoading = loadingUser || loadingTransactions;
    const transactions = transactionData?.items || [];
    const totalPages = transactionData?.totalPages || 1;

    // Transaction type icons
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'DEPOSIT': return <ArrowDownCircle className="h-5 w-5 text-green-500" />;
            case 'PURCHASE': return <ShoppingCart className="h-5 w-5 text-blue-500" />;
            case 'WITHDRAWAL': return <ArrowUpCircle className="h-5 w-5 text-red-500" />;
            default: return <Wallet className="h-5 w-5 text-gray-500" />;
        }
    };

    // Status badge colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'CANCELED': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
            case 'FAILED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Status text in Vietnamese
    const getStatusText = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'Hoàn thành';
            case 'PENDING': return 'Đang xử lý';
            case 'CANCELED': return 'Đã hủy';
            case 'FAILED': return 'Thất bại';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold flex items-center text-white">
                    <Wallet className="mr-2 h-8 w-8 text-blue-500" />
                    Lịch sử giao dịch
                </h1>
                <p className="text-slate-400">Xem tất cả giao dịch đã hoàn thành của ví</p>
            </div>

            {/* Wallet Balance Card */}
            <Card className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-2 border-blue-800 mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center text-white">
                        <Wallet className="mr-2 h-5 w-5" />
                        Số dư hiện tại
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingUser ? (
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    ) : (
                        <p className="text-4xl font-bold text-white">
                            ₫{user?.currency?.toLocaleString('vi-VN') || '0'}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Transactions List */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Giao dịch đã hoàn thành</CardTitle>
                    <CardDescription className="text-slate-400">
                        {transactionData?.totalItems
                            ? `Tổng ${transactionData.totalItems} giao dịch`
                            : 'Chưa có giao dịch nào'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingTransactions ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : transactions.length > 0 ? (
                        <>
                            <div className="space-y-4 mb-6">
                                {transactions.map(transaction => (
                                    <div
                                        key={transaction.transactionID}
                                        className="flex items-center justify-between border-b border-slate-700 pb-4 last:border-b-0 hover:bg-slate-800 p-2 rounded transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            {getTypeIcon(transaction.type)}
                                            <div>
                                                <p className="font-medium text-white">{transaction.description}</p>
                                                <div className="flex gap-2">
                                                    <p className="text-sm text-slate-400">
                                                        {formatDateTime(transaction.requestTime)}
                                                    </p>
                                                    {transaction.balanceAfter !== null && (
                                                        <p className="text-sm text-slate-500">
                                                            | Số dư sau: ₫{transaction.balanceAfter.toLocaleString('vi-VN')}
                                                        </p>
                                                    )}
                                                </div>

                                                <p className="text-xs text-slate-500 mt-1">
                                                    <span className="font-medium">Phương thức:</span> {transaction.paymentMethod}
                                                </p>
                                                {transaction.gatewayTransactionId && (
                                                    <p className="text-xs text-slate-500">
                                                        <span className="font-medium">Mã GD:</span> {transaction.gatewayTransactionId.substring(0, 20)}...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-semibold text-lg ${transaction.type === 'DEPOSIT' ? 'text-green-400' : 'text-red-400'}`}>
                                                {transaction.type === 'DEPOSIT' ? '+' : '-'}₫{transaction.money.toLocaleString('vi-VN')}
                                            </p>
                                            <Badge className={`${getStatusColor(transaction.status)} mt-1`}>
                                                {getStatusText(transaction.status)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                <div className="text-sm text-slate-400">
                                    Trang {page} / {totalPages}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1 || loadingTransactions}
                                        className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Trước
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages || loadingTransactions}
                                        className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                                    >
                                        Tiếp
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Wallet className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">Chưa có giao dịch nào</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
