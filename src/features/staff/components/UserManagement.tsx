// Staff User Management Component - Members only, no Promote function
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ChevronLeft, ChevronRight, Eye, Ban, CheckCircle,
    X, Users, UserX, Search
} from 'lucide-react';
import { getUsersFilter, getUserById, toggleBanUser } from '../api';
import type { User, UserFilterRequest, UserFilterResponse } from '../types';

// ==================== UI Components ====================

const Badge = ({ variant = 'default', children }: { variant?: string; children: React.ReactNode }) => {
    const variants: Record<string, string> = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        destructive: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant] || variants.default}`}>{children}</span>;
};

const Button = ({ variant = 'default', size = 'default', className = '', disabled = false, children, ...props }: any) => {
    const variants: Record<string, string> = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        success: 'bg-green-600 text-white hover:bg-green-700',
    };
    const sizes: Record<string, string> = {
        default: 'px-4 py-2',
        sm: 'px-2 py-1 text-sm',
        icon: 'p-2',
    };
    return (
        <button className={`rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled} {...props}>{children}</button>
    );
};

const Dialog = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};

// ==================== Main Component ====================

export function UserManagement() {
    const queryClient = useQueryClient();

    // Filter states - Staff only sees Members, no Role filter
    const [currentPage, setCurrentPage] = useState(1);
    const [bannedFilter, setBannedFilter] = useState<string>(''); // '' | 'true' | 'false'
    const [deletedFilter, setDeletedFilter] = useState<string>(''); // '' | 'true' | 'false'
    const [searchQuery, setSearchQuery] = useState('');
    const pageSize = 10;

    // Dialog states
    const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
    const [banDialog, setBanDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });

    // Build filter request
    const buildFilterRequest = (): UserFilterRequest => {
        const req: UserFilterRequest = {
            CurrentPage: currentPage,
            PageSize: pageSize,
            Role: 'Member', // Staff can only see Members
        };
        if (bannedFilter !== '') req.IsBanned = bannedFilter === 'true';
        if (deletedFilter !== '') req.IsDeleted = deletedFilter === 'true';
        return req;
    };

    // Fetch users with filters
    const { data: usersData, isLoading, isError } = useQuery<UserFilterResponse>({
        queryKey: ['staff-users', currentPage, bannedFilter, deletedFilter],
        queryFn: () => getUsersFilter(buildFilterRequest()),
    });

    // Fetch user details
    const { data: userDetails, isLoading: loadingDetails } = useQuery<User>({
        queryKey: ['staff-user-details', detailsDialog.user?.userID],
        queryFn: () => getUserById(detailsDialog.user!.userID),
        enabled: !!detailsDialog.user?.userID,
    });

    // Toggle ban/unban mutation
    const banMutation = useMutation({
        mutationFn: toggleBanUser,
        onSuccess: (updatedUser) => {
            queryClient.invalidateQueries({ queryKey: ['staff-users'] });
            setBanDialog({ open: false, user: null });
            alert(updatedUser.isBanned ? 'Đã khóa tài khoản người dùng!' : 'Đã mở khóa tài khoản người dùng!');
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        },
    });

    const users = usersData?.data?.items || [];
    const totalPages = usersData?.data?.totalPages || 1;
    const totalItems = usersData?.data?.totalItems || 0;

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN');
    const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' đ';

    const handleFilterChange = (setter: (val: string) => void, value: string) => {
        setter(value);
        setCurrentPage(1);
    };

    // Client-side search filtering
    const filteredUsers = users.filter(user => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return user.fullName?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query);
    });

    if (isError) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>Không thể tải danh sách người dùng</p>
                <p className="text-sm">Vui lòng thử lại sau</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
                <p className="text-gray-500 mt-1">{totalItems} người dùng (chỉ Members)</p>
            </div>

            {/* Filters - No Role filter for Staff */}
            <div className="bg-white rounded-xl border p-4">
                <div className="flex gap-4 flex-wrap">
                    {/* Search Input */}
                    <div className="flex-[2] min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Tìm kiếm</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm theo tên hoặc email..."
                                className="w-full pl-9 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Banned Filter */}
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Trạng thái khóa</label>
                        <select value={bannedFilter} onChange={(e) => handleFilterChange(setBannedFilter, e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="">Tất cả</option>
                            <option value="false">Hoạt động</option>
                            <option value="true">Đã khóa</option>
                        </select>
                    </div>

                    {/* Deleted Filter */}
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Trạng thái xóa</label>
                        <select value={deletedFilter} onChange={(e) => handleFilterChange(setDeletedFilter, e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="">Tất cả</option>
                            <option value="false">Chưa xóa</option>
                            <option value="true">Đã xóa</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Người dùng</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Số dư</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Ngày tạo</th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredUsers.map((user) => (
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
                                                <div>
                                                    <div className="font-medium text-gray-900">{user.fullName}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm">{formatCurrency(user.currency)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {user.isBanned ? (
                                                    <Badge variant="destructive"><Ban className="h-3 w-3 inline mr-1" />Đã khóa</Badge>
                                                ) : (
                                                    <Badge variant="success"><CheckCircle className="h-3 w-3 inline mr-1" />Hoạt động</Badge>
                                                )}
                                                {user.isDeleted && <Badge variant="warning"><X className="h-3 w-3 inline mr-1" />Đã xóa</Badge>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* View Details */}
                                                <Button variant="ghost" size="icon" title="Xem chi tiết" onClick={() => setDetailsDialog({ open: true, user })}>
                                                    <Eye className="h-4 w-4 text-blue-600" />
                                                </Button>

                                                {/* Ban/Unban */}
                                                <Button variant="ghost" size="icon" title={user.isBanned ? 'Mở khóa' : 'Khóa tài khoản'} onClick={() => setBanDialog({ open: true, user })}>
                                                    {user.isBanned ? (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <Ban className="h-4 w-4 text-red-500" />
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredUsers.length === 0 && searchQuery && (
                            <div className="text-center py-12 text-gray-500">
                                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>Không tìm thấy "{searchQuery}"</p>
                                <button onClick={() => setSearchQuery('')} className="text-blue-600 text-sm mt-2 hover:underline">
                                    Xóa tìm kiếm
                                </button>
                            </div>
                        )}

                        {filteredUsers.length === 0 && !searchQuery && (
                            <div className="text-center py-12 text-gray-500">
                                <UserX className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>Không tìm thấy người dùng nào</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                                <div className="text-sm text-gray-500">Trang {currentPage} / {totalPages} ({totalItems} người dùng)</div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
                                        <ChevronLeft className="h-4 w-4" />Trước
                                    </Button>
                                    <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                                        Sau<ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* User Details Dialog */}
            <Dialog open={detailsDialog.open} onClose={() => setDetailsDialog({ open: false, user: null })} title="Chi tiết người dùng">
                {loadingDetails ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                ) : userDetails ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            {userDetails.avatar ? (
                                <img src={userDetails.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-2xl text-blue-600 font-medium">{userDetails.fullName?.[0] || 'U'}</span>
                                </div>
                            )}
                            <div>
                                <h4 className="text-xl font-semibold">{userDetails.fullName}</h4>
                                <p className="text-gray-500">{userDetails.email}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <p className="text-sm text-gray-500">Vai trò</p>
                                <p className="font-medium"><Badge><Users className="h-3 w-3 inline mr-1" />Member</Badge></p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Số dư ví</p>
                                <p className="font-medium text-green-600">{formatCurrency(userDetails.currency)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Trạng thái</p>
                                <p className="font-medium">{userDetails.isBanned ? '🚫 Đã khóa' : '✅ Hoạt động'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Ngày tạo</p>
                                <p className="font-medium">{formatDate(userDetails.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">User ID</p>
                                <p className="font-mono text-sm">{userDetails.userID}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Google ID</p>
                                <p className="font-mono text-sm truncate">{userDetails.googleID || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">Không thể tải thông tin người dùng</p>
                )}
            </Dialog>

            {/* Ban/Unban Dialog */}
            <Dialog open={banDialog.open} onClose={() => setBanDialog({ open: false, user: null })} title={banDialog.user?.isBanned ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}>
                <div className="space-y-4">
                    {banDialog.user?.isBanned ? (
                        <>
                            <p className="text-gray-600">
                                Bạn có chắc chắn muốn <strong className="text-green-600">mở khóa</strong> tài khoản của <strong>{banDialog.user?.fullName}</strong>?
                            </p>
                            <p className="text-sm text-gray-500">
                                Sau khi mở khóa, người dùng này sẽ có thể đăng nhập và sử dụng hệ thống bình thường.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-gray-600">
                                Bạn có chắc chắn muốn <strong className="text-red-600">khóa</strong> tài khoản của <strong>{banDialog.user?.fullName}</strong>?
                            </p>
                            <p className="text-sm text-gray-500">
                                Sau khi khóa, người dùng này sẽ không thể đăng nhập vào hệ thống.
                            </p>
                        </>
                    )}
                    <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button variant="outline" onClick={() => setBanDialog({ open: false, user: null })}>Hủy</Button>
                        <Button variant={banDialog.user?.isBanned ? 'success' : 'destructive'}
                            onClick={() => banDialog.user && banMutation.mutate(banDialog.user.userID)}
                            disabled={banMutation.isPending}>
                            {banMutation.isPending ? 'Đang xử lý...' : banDialog.user?.isBanned ? 'Mở khóa' : 'Khóa tài khoản'}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
