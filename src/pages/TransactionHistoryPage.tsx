import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUserProfile, fetchTransactions, fetchTransactionReceipt, downloadTransactionReceipt } from '@/features/wallet/api';
import { TransactionReceipt, Transaction } from '@/features/wallet/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ArrowUpCircle, ArrowDownCircle, ShoppingCart, Wallet, ChevronLeft, ChevronRight, Search, Receipt, X, CheckCircle2, Clock, XCircle, AlertCircle, Download } from 'lucide-react';
import { formatDateTime } from '@/utils/dateUtils';

export default function TransactionHistoryPage() {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [receiptData, setReceiptData] = useState<TransactionReceipt | null>(null);
    const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);

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

    // Helper to infer or get type
    const getTransactionType = (t: Transaction) => {
        if (t.type) return t.type;
        const desc = (t.description || '').toLowerCase();
        if (desc.includes('nạp') || desc.includes('đền bù') || desc.includes('trả lại')) return 'DEPOSIT';
        return 'PURCHASE';
    };

    // Filter transactions based on search query and type filter
    const filteredTransactions = transactions.filter(transaction => {
        const type = getTransactionType(transaction);
        // Type filter
        const matchesType = typeFilter === 'ALL' || type === typeFilter;

        // Search query filter
        const matchesSearch = !searchQuery ||
            transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.paymentMethod?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.gatewayTransactionId?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesType && matchesSearch;
    });

    // Handle transaction click to show receipt
    const handleTransactionClick = async (transaction: Transaction) => {
        if (transaction.status !== 'COMPLETED') return;

        setSelectedTransaction(transaction);
        setIsReceiptModalOpen(true);
        setIsLoadingReceipt(true);

        try {
            const receipt = await fetchTransactionReceipt(transaction.transactionId);
            setReceiptData(receipt);
        } catch (error) {
            console.error('Failed to fetch receipt:', error);
            setReceiptData(null);
        } finally {
            setIsLoadingReceipt(false);
        }
    };

    // Close receipt modal
    const handleCloseReceipt = () => {
        setIsReceiptModalOpen(false);
    };

    // Transaction type icons
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'DEPOSIT': return <ArrowDownCircle className="h-5 w-5 text-green-500" />;
            case 'PURCHASE': return <ShoppingCart className="h-5 w-5 text-blue-500" />;
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

    // Status icon for receipt
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'PENDING': return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'CANCELED': return <XCircle className="h-5 w-5 text-gray-500" />;
            case 'FAILED': return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: return null;
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + 'đ';
    };

    // Format date for receipt
    const formatReceiptDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle receipt download
    const handleDownloadReceipt = async () => {
        if (!selectedTransaction || !receiptData) return;

        try {
            const blob = await downloadTransactionReceipt(selectedTransaction.transactionId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `HoaDon_${selectedTransaction.transactionId}_${new Date().getTime()}.pdf`; // Generate a filename
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to download receipt:', error);
            // Optional: Show error toast/alert
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-white">Giao dịch đã hoàn thành</CardTitle>
                            <CardDescription className="text-slate-400">
                                {transactionData?.totalItems
                                    ? `Tổng ${transactionData.totalItems} giao dịch`
                                    : 'Chưa có giao dịch nào'}
                            </CardDescription>
                        </div>
                        {/* Filter Controls */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            {/* Type Filter */}
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full sm:w-40 bg-slate-800 border-slate-700 text-white">
                                    <SelectValue placeholder="Loại giao dịch" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="ALL" className="text-white hover:bg-slate-700">Tất cả</SelectItem>
                                    <SelectItem value="DEPOSIT" className="text-white hover:bg-slate-700">Nạp tiền</SelectItem>
                                    <SelectItem value="PURCHASE" className="text-white hover:bg-slate-700">Mua dịch vụ</SelectItem>
                                </SelectContent>
                            </Select>
                            {/* Search Bar */}
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Tìm kiếm giao dịch..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loadingTransactions ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : filteredTransactions.length > 0 ? (
                        <>
                            <div className="space-y-4 mb-6">
                                {filteredTransactions.map(transaction => {
                                    const type = getTransactionType(transaction);
                                    return (
                                        <div
                                            key={transaction.transactionId}
                                            onClick={() => handleTransactionClick(transaction)}
                                            className={`flex items-center justify-between border-b border-slate-700 pb-4 last:border-b-0 p-2 rounded transition-colors ${transaction.status === 'COMPLETED'
                                                ? 'hover:bg-slate-800 cursor-pointer'
                                                : 'opacity-75'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                {getTypeIcon(type)}
                                                <div>
                                                    <p className="font-medium text-white">{transaction.description}</p>
                                                    <div className="flex gap-2">
                                                        <p className="text-sm text-slate-400">
                                                            {formatDateTime(transaction.paymentDate)}
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
                                                    {transaction.status === 'COMPLETED' && (
                                                        <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                                                            <Receipt className="h-3 w-3" />
                                                            Nhấn để xem hóa đơn
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-semibold text-lg ${type === 'DEPOSIT' ? 'text-green-400' : 'text-red-400'}`}>
                                                    {type === 'DEPOSIT' ? '+' : '-'}₫{transaction.amount.toLocaleString('vi-VN')}
                                                </p>
                                                <Badge className={`${getStatusColor(transaction.status)} mt-1`}>
                                                    {getStatusText(transaction.status)}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                <div className="text-sm text-slate-400">
                                    Trang {page} / {totalPages}
                                    {searchQuery && (
                                        <span className="ml-2">
                                            ({filteredTransactions.length} kết quả tìm kiếm)
                                        </span>
                                    )}
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
                            <p className="text-slate-400">
                                {searchQuery ? 'Không tìm thấy giao dịch phù hợp' : 'Chưa có giao dịch nào'}
                            </p>
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchQuery('')}
                                    className="mt-2 text-blue-400 hover:text-blue-300"
                                >
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Receipt Modal */}
            <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Receipt className="h-6 w-6 text-blue-500" />
                            Hóa đơn giao dịch
                        </DialogTitle>
                    </DialogHeader>

                    {isLoadingReceipt ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                            <p className="text-slate-400">Đang tải hóa đơn...</p>
                        </div>
                    ) : receiptData ? (
                        <div className="space-y-6">
                            {/* Transaction Info */}
                            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Mã giao dịch</span>
                                    <span className="font-mono text-sm">{receiptData.transactionCode}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Trạng thái</span>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(receiptData.status)}
                                        <span className={receiptData.status === 'COMPLETED' ? 'text-green-400' : 'text-yellow-400'}>
                                            {getStatusText(receiptData.status)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Ngày thanh toán</span>
                                    <span>{formatReceiptDate(receiptData.paymentDate)}</span>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="border-t border-slate-700 pt-4">
                                <h4 className="text-sm font-semibold text-slate-400 uppercase mb-3">Thông tin khách hàng</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Họ tên</span>
                                        <span>{receiptData.payerName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Email</span>
                                        <span className="text-blue-400">{receiptData.payerEmail}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Details */}
                            <div className="border-t border-slate-700 pt-4">
                                <h4 className="text-sm font-semibold text-slate-400 uppercase mb-3">Chi tiết giao dịch</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Dịch vụ</span>
                                        <span>{receiptData.serviceName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Mô tả</span>
                                        <span className="text-right max-w-[60%]">{receiptData.description}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Phương thức</span>
                                        <span>{receiptData.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Ngân hàng</span>
                                        <span>{receiptData.bankName}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Amount Summary */}
                            <div className="border-t border-slate-700 pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Thành tiền</span>
                                        <span>{formatCurrency(receiptData.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">VAT ({receiptData.vatRate}%)</span>
                                        <span>{formatCurrency(receiptData.vatAmount)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-slate-600">
                                        <span className="font-semibold text-lg">Tổng cộng</span>
                                        <span className="font-bold text-xl text-green-400">
                                            {formatCurrency(receiptData.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Close Button & Download */}
                            <div className="pt-2 flex gap-3">
                                <Button
                                    onClick={handleCloseReceipt}
                                    variant="outline"
                                    className="flex-1 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                >
                                    Đóng
                                </Button>
                                <Button
                                    onClick={handleDownloadReceipt}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Tải hóa đơn
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                            <p className="text-slate-400 text-center">
                                Không thể tải hóa đơn. Vui lòng thử lại sau.
                            </p>
                            <Button
                                onClick={handleCloseReceipt}
                                variant="outline"
                                className="mt-4 border-slate-600 text-slate-300 hover:bg-slate-800"
                            >
                                Đóng
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
