// Admin Transaction Management Component
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search, ChevronLeft, ChevronRight, Eye, DollarSign, ArrowDownCircle, ShoppingCart,
    X, Users, Receipt, CheckCircle, Clock
} from 'lucide-react';
import { getTransactionsPaginated, getTransactionById, adminDeposit, getUsersFilter } from '../api';
import type { Transaction, TransactionListResponse, User, UserFilterResponse } from '../types';

// ==================== UI Components ====================

const Badge = ({ variant = 'default', children }: { variant?: string; children: React.ReactNode }) => {
    const variants: Record<string, string> = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        destructive: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        deposit: 'bg-green-100 text-green-700',
        purchase: 'bg-blue-100 text-blue-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant] || variants.default}`}>{children}</span>;
};

const Button = ({ variant = 'default', size = 'default', className = '', disabled = false, children, ...props }: any) => {
    const variants: Record<string, string> = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
        success: 'bg-green-600 text-white hover:bg-green-700',
    };
    const sizes: Record<string, string> = {
        default: 'px-4 py-2',
        sm: 'px-2 py-1 text-sm',
        icon: 'p-2',
    };
    return (
        <button
            className={`rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

const Dialog = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};

// ==================== Main Component ====================

type ViewMode = 'transactions' | 'users';

export function TransactionManagement() {
    const queryClient = useQueryClient();

    // View mode
    const [viewMode, setViewMode] = useState<ViewMode>('users');

    // Pagination
    const [txCurrentPage, setTxCurrentPage] = useState(1);
    const [userCurrentPage, setUserCurrentPage] = useState(1);
    const pageSize = 10;

    // Selected user for viewing transactions
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Dialog states
    const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; transactionId: number | null }>({ open: false, transactionId: null });
    const [depositDialog, setDepositDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
    const [depositForm, setDepositForm] = useState({ money: 0, description: '' });

    // Search and sort states
    const [searchQuery, setSearchQuery] = useState('');
    const [sortByBalance, setSortByBalance] = useState(false);

    // Fetch all transactions
    const { data: txData, isLoading: loadingTx } = useQuery<TransactionListResponse>({
        queryKey: ['admin-transactions', txCurrentPage],
        queryFn: () => getTransactionsPaginated(txCurrentPage, pageSize),
        enabled: viewMode === 'transactions' || !!selectedUser,
    });

    // Fetch users
    const { data: usersData, isLoading: loadingUsers } = useQuery<UserFilterResponse>({
        queryKey: ['admin-tx-users', userCurrentPage],
        queryFn: () => getUsersFilter({ CurrentPage: userCurrentPage, PageSize: pageSize }),
        enabled: viewMode === 'users',
    });

    // Fetch transaction details
    const { data: txDetails, isLoading: loadingDetails } = useQuery<Transaction>({
        queryKey: ['admin-transaction-details', detailsDialog.transactionId],
        queryFn: () => getTransactionById(detailsDialog.transactionId!),
        enabled: !!detailsDialog.transactionId,
    });

    // Admin deposit mutation
    const depositMutation = useMutation({
        mutationFn: adminDeposit,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['admin-tx-users'] });
            setDepositDialog({ open: false, user: null });
            setDepositForm({ money: 0, description: '' });
            alert(`${data.message} Số dư mới: ${formatCurrency(data.newBalance)}`);
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi nạp tiền');
        },
    });

    // Filter out Admin users, apply search and sort
    const rawUsers = (usersData?.data?.items || []).filter(u => u.role !== 'Admin');
    const searchedUsers = rawUsers.filter(u =>
        searchQuery === '' ||
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const users = sortByBalance
        ? [...searchedUsers].sort((a, b) => b.currency - a.currency)
        : searchedUsers;

    const transactions = txData?.items || [];
    const userTransactions = selectedUser
        ? transactions.filter(tx => tx.userID === selectedUser.userID)
        : transactions;

    const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' đ';
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString('vi-VN');

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'DEPOSIT': return <Badge variant="deposit"><ArrowDownCircle className="h-3 w-3 inline mr-1" />Nạp tiền</Badge>;
            case 'PURCHASE': return <Badge variant="purchase"><ShoppingCart className="h-3 w-3 inline mr-1" />Mua gói</Badge>;
            default: return <Badge>{type}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <Badge variant="success"><CheckCircle className="h-3 w-3 inline mr-1" />Hoàn thành</Badge>;
            case 'PENDING': return <Badge variant="warning"><Clock className="h-3 w-3 inline mr-1" />Chờ xử lý</Badge>;
            case 'FAILED': return <Badge variant="destructive">Thất bại</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const handleDeposit = () => {
        if (!depositDialog.user || depositForm.money <= 0 || !depositForm.description.trim()) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        depositMutation.mutate({
            userId: depositDialog.user.userID,
            money: depositForm.money,
            description: depositForm.description,
        });
    };

    const renderTransactionsTable = (txList: Transaction[], loading: boolean) => {
        if (loading) {
            return (
                <div className="bg-white rounded-xl border flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            );
        }
        return (
            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">ID</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Loại</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Số tiền</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Phương thức</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Thời gian</th>
                            <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {txList.map((tx) => (
                            <tr key={tx.transactionID} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono text-sm text-gray-600">#{tx.transactionID}</td>
                                <td className="px-6 py-4">{getTypeBadge(tx.type)}</td>
                                <td className="px-6 py-4">
                                    <span className={`font-mono font-medium ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-blue-600'}`}>
                                        {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.money)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{tx.paymentMethod}</td>
                                <td className="px-6 py-4">{getStatusBadge(tx.status)}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(tx.requestTime)}</td>
                                <td className="px-6 py-4 text-center">
                                    <Button variant="ghost" size="icon" title="Xem chi tiết" onClick={() => setDetailsDialog({ open: true, transactionId: tx.transactionID })}>
                                        <Eye className="h-4 w-4 text-blue-600" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {txList.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Không có giao dịch nào</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Quản lý giao dịch</h2>
                    <p className="text-gray-500 mt-1">Xem và quản lý các giao dịch</p>
                </div>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => { setViewMode('users'); setSelectedUser(null); }}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
                        <Users className="h-4 w-4 inline mr-2" />Theo người dùng
                    </button>
                    <button onClick={() => { setViewMode('transactions'); setSelectedUser(null); }}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'transactions' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
                        <Receipt className="h-4 w-4 inline mr-2" />Tất cả giao dịch
                    </button>
                </div>
            </div>

            {/* Users View */}
            {viewMode === 'users' && !selectedUser && (
                <div className="space-y-4">
                    {/* Search and Sort Controls */}
                    <div className="bg-white rounded-xl border p-4">
                        <div className="flex gap-4 flex-wrap items-center">
                            <div className="flex-1 min-w-[250px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Tìm kiếm theo tên hoặc email..."
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={sortByBalance} onChange={(e) => setSortByBalance(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm text-gray-600"><DollarSign className="h-4 w-4 inline mr-1" />Sắp xếp theo số dư cao nhất</span>
                            </label>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-xl border overflow-hidden">
                        {loadingUsers ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <>
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Người dùng</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Email</th>
                                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Số dư</th>
                                            <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {users.map((user) => (
                                            <tr key={user.userID} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                                <span className="text-blue-600 font-medium">{user.fullName?.[0] || 'U'}</span>
                                                            </div>
                                                        )}
                                                        <span className="font-medium">{user.fullName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                                <td className="px-6 py-4 font-mono text-green-600">{formatCurrency(user.currency)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button variant="ghost" size="sm" title="Xem giao dịch" onClick={() => setSelectedUser(user)}>
                                                            <Receipt className="h-4 w-4 mr-1" />Xem GD
                                                        </Button>
                                                        <Button variant="success" size="sm" title="Nạp tiền" onClick={() => setDepositDialog({ open: true, user })}>
                                                            <DollarSign className="h-4 w-4 mr-1" />Nạp tiền
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {users.length === 0 && <div className="text-center py-12 text-gray-500">Không có người dùng nào</div>}
                                {(usersData?.data?.totalPages || 0) > 1 && (
                                    <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                                        <div className="text-sm text-gray-500">Trang {userCurrentPage} / {usersData?.data?.totalPages}</div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" disabled={userCurrentPage <= 1} onClick={() => setUserCurrentPage(p => p - 1)}>
                                                <ChevronLeft className="h-4 w-4" /> Trước
                                            </Button>
                                            <Button variant="outline" size="sm" disabled={userCurrentPage >= (usersData?.data?.totalPages || 1)} onClick={() => setUserCurrentPage(p => p + 1)}>
                                                Sau <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Selected User Transactions */}
            {viewMode === 'users' && selectedUser && (
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                            <ChevronLeft className="h-4 w-4" /> Quay lại
                        </Button>
                        <div className="flex items-center gap-3">
                            {selectedUser.avatar ? (
                                <img src={selectedUser.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-xl text-blue-600 font-medium">{selectedUser.fullName?.[0] || 'U'}</span>
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold text-gray-800">{selectedUser.fullName}</h3>
                                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                            </div>
                        </div>
                        <div className="ml-auto">
                            <Button variant="success" size="sm" onClick={() => setDepositDialog({ open: true, user: selectedUser })}>
                                <DollarSign className="h-4 w-4 mr-1" /> Nạp tiền
                            </Button>
                        </div>
                    </div>
                    {renderTransactionsTable(userTransactions, loadingTx)}
                </div>
            )}

            {/* All Transactions View */}
            {viewMode === 'transactions' && (
                <div className="space-y-4">
                    {renderTransactionsTable(transactions, loadingTx)}
                    {(txData?.totalPages || 0) > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 bg-white rounded-xl border">
                            <div className="text-sm text-gray-500">Trang {txCurrentPage} / {txData?.totalPages} ({txData?.totalItems} giao dịch)</div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled={txCurrentPage <= 1} onClick={() => setTxCurrentPage(p => p - 1)}>
                                    <ChevronLeft className="h-4 w-4" /> Trước
                                </Button>
                                <Button variant="outline" size="sm" disabled={txCurrentPage >= (txData?.totalPages || 1)} onClick={() => setTxCurrentPage(p => p + 1)}>
                                    Sau <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Transaction Details Dialog */}
            <Dialog open={detailsDialog.open} onClose={() => setDetailsDialog({ open: false, transactionId: null })} title="Chi tiết giao dịch">
                {loadingDetails ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                ) : txDetails ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Mã giao dịch</span>
                            <span className="font-mono font-medium">#{txDetails.transactionID}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Loại</span>
                            {getTypeBadge(txDetails.type)}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Số tiền</span>
                            <span className={`font-mono font-bold ${txDetails.type === 'DEPOSIT' ? 'text-green-600' : 'text-blue-600'}`}>
                                {txDetails.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(txDetails.money)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Trạng thái</span>
                            {getStatusBadge(txDetails.status)}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Phương thức</span>
                            <span>{txDetails.paymentMethod}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Số dư sau GD</span>
                            <span className="font-mono">{formatCurrency(txDetails.balanceAfter)}</span>
                        </div>
                        <div className="pt-4 border-t">
                            <span className="text-sm text-gray-500">Mô tả</span>
                            <p className="mt-1 text-gray-700">{txDetails.description || 'Không có mô tả'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
                            <div>
                                <span className="text-gray-500">Thời gian tạo</span>
                                <p>{formatDate(txDetails.requestTime)}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Hoàn thành</span>
                                <p>{txDetails.completedTime ? formatDate(txDetails.completedTime) : 'N/A'}</p>
                            </div>
                        </div>
                        {txDetails.gatewayTransactionId && (
                            <div className="pt-4 border-t">
                                <span className="text-sm text-gray-500">Gateway Transaction ID</span>
                                <p className="font-mono text-xs mt-1 break-all">{txDetails.gatewayTransactionId}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500">Không thể tải thông tin giao dịch</p>
                )}
            </Dialog>

            {/* Admin Deposit Dialog */}
            <Dialog open={depositDialog.open} onClose={() => { setDepositDialog({ open: false, user: null }); setDepositForm({ money: 0, description: '' }); }} title="Nạp tiền cho người dùng">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {depositDialog.user?.avatar ? (
                            <img src={depositDialog.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium">{depositDialog.user?.fullName?.[0] || 'U'}</span>
                            </div>
                        )}
                        <div>
                            <p className="font-medium">{depositDialog.user?.fullName}</p>
                            <p className="text-sm text-gray-500">{depositDialog.user?.email}</p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (VNĐ)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input type="number" value={depositForm.money} onChange={(e) => setDepositForm({ ...depositForm, money: parseInt(e.target.value) || 0 })}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Nhập số tiền..." />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả / Lý do</label>
                        <textarea value={depositForm.description} onChange={(e) => setDepositForm({ ...depositForm, description: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Nhập lý do nạp tiền..." />
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            <strong>Lưu ý:</strong> Bạn có chắc chắn muốn nạp <strong>{formatCurrency(depositForm.money)}</strong> vào tài khoản của <strong>{depositDialog.user?.fullName}</strong>?
                        </p>
                    </div>
                    <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button variant="outline" onClick={() => { setDepositDialog({ open: false, user: null }); setDepositForm({ money: 0, description: '' }); }}>Hủy</Button>
                        <Button variant="success" onClick={handleDeposit} disabled={depositMutation.isPending || depositForm.money <= 0 || !depositForm.description.trim()}>
                            {depositMutation.isPending ? 'Đang xử lý...' : 'Xác nhận nạp tiền'}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
