import { useQuery } from '@tanstack/react-query';
import { fetchWallet } from '@/features/wallet/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowUpCircle, ArrowDownCircle, ShoppingCart, Wallet } from 'lucide-react';

export default function TransactionHistoryPage() {
    const { data: wallet, isLoading } = useQuery({
        queryKey: ['wallet'],
        queryFn: fetchWallet,
    });

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
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center">
                    <Wallet className="mr-2 h-8 w-8 text-blue-600" />
                    Lịch sử giao dịch
                </h1>
                <p className="text-gray-500 dark:text-gray-400">Xem tất cả giao dịch của ví</p>
            </div>

            {/* Wallet Balance Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Wallet className="mr-2 h-5 w-5" />
                        Số dư hiện tại
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    ) : (
                        <p className="text-4xl font-bold text-blue-600">
                            ₫{wallet?.currency.toLocaleString('vi-VN') || '0'}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Transactions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Giao dịch gần đây</CardTitle>
                    <CardDescription>
                        {wallet?.transactions && wallet.transactions.filter(t => !t.isDeleted).length > 0
                            ? `Tổng ${wallet.transactions.filter(t => !t.isDeleted).length} giao dịch`
                            : 'Chưa có giao dịch nào'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : wallet?.transactions && wallet.transactions.length > 0 ? (
                        <div className="space-y-4">
                            {wallet.transactions
                                .filter(t => !t.isDeleted)
                                .sort((a, b) => new Date(b.requestTime).getTime() - new Date(a.requestTime).getTime())
                                .map(transaction => (
                                    <div
                                        key={transaction.transactionID}
                                        className="flex items-center justify-between border-b pb-4 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            {getTypeIcon(transaction.type)}
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.description}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(transaction.requestTime).toLocaleString('vi-VN')}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    <span className="font-medium">Phương thức:</span> {transaction.paymentMethod}
                                                </p>
                                                {transaction.gatewayTransactionId && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                                        <span className="font-medium">Mã GD:</span> {transaction.gatewayTransactionId.substring(0, 20)}...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-semibold text-lg ${transaction.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}`}>
                                                {transaction.type === 'DEPOSIT' ? '+' : '-'}₫{transaction.money.toLocaleString('vi-VN')}
                                            </p>
                                            <Badge className={`${getStatusColor(transaction.status)} mt-1`}>
                                                {getStatusText(transaction.status)}
                                            </Badge>
                                            {transaction.completedTime && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    {new Date(transaction.completedTime).toLocaleString('vi-VN')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Wallet className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Chưa có giao dịch nào</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                Lịch sử giao dịch của bạn sẽ hiển thị ở đây
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
