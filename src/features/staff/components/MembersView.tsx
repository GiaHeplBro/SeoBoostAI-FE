// Staff Members View Component
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronDown, ChevronUp, Ban, CheckCircle, DollarSign, ShoppingCart, Activity, X } from 'lucide-react';
import { getAllMembers, getUserDetails, banUser, unbanUser } from '../api';
import type { User, UserDetails } from '../types';

const Badge = ({ variant = 'default', children }: { variant?: string; children: React.ReactNode }) => {
    const variants: Record<string, string> = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        destructive: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant] || variants.default}`}>{children}</span>;
};

const Button = ({ variant = 'default', size = 'default', className = '', children, ...props }: any) => {
    const variants: Record<string, string> = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
    };
    const sizes: Record<string, string> = {
        default: 'px-4 py-2',
        sm: 'px-2 py-1 text-sm',
        icon: 'p-2',
    };
    return (
        <button className={`rounded-lg font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

const Dialog = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

function UserDetailsPanel({ userId }: { userId: number }) {
    const { data: details, isLoading } = useQuery<UserDetails>({
        queryKey: ['user-details', userId],
        queryFn: () => getUserDetails(userId),
    });

    if (isLoading) {
        return (
            <div className="p-4 text-center text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
        );
    }

    if (!details) {
        return <div className="p-4 text-center text-gray-400">Không thể tải thông tin chi tiết</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {/* Deposits */}
            <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">Lịch sử nạp tiền</h4>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {details.deposits?.map((d) => (
                        <div key={d.id} className="text-sm bg-white p-2 rounded">
                            <div className="font-medium text-green-700">+{d.amount.toLocaleString()} đ</div>
                            <div className="text-gray-500 text-xs">{d.method} • {new Date(d.time).toLocaleDateString('vi-VN')}</div>
                        </div>
                    ))}
                    {(!details.deposits || details.deposits.length === 0) && (
                        <div className="text-sm text-gray-400">Chưa có giao dịch nạp tiền</div>
                    )}
                </div>
            </div>

            {/* Purchases */}
            <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Lịch sử mua gói</h4>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {details.purchases?.map((p) => (
                        <div key={p.id} className="text-sm bg-white p-2 rounded">
                            <div className="font-medium text-blue-700">{p.feature}</div>
                            <div className="text-gray-500 text-xs">{p.quantity}x • {p.price.toLocaleString()} đ</div>
                        </div>
                    ))}
                    {(!details.purchases || details.purchases.length === 0) && (
                        <div className="text-sm text-gray-400">Chưa mua gói nào</div>
                    )}
                </div>
            </div>

            {/* Feature Usage */}
            <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-800">Sử dụng tính năng</h4>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {details.featureUsage?.map((f, i) => (
                        <div key={i} className="text-sm bg-white p-2 rounded">
                            <div className="font-medium text-purple-700">{f.name}</div>
                            <div className="text-gray-500 text-xs">{f.count} lần • {f.lastUsed}</div>
                        </div>
                    ))}
                    {(!details.featureUsage || details.featureUsage.length === 0) && (
                        <div className="text-sm text-gray-400">Chưa sử dụng tính năng nào</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function MembersView() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [banDialog, setBanDialog] = useState<{ open: boolean; user: User | null; reason: string }>({
        open: false,
        user: null,
        reason: '',
    });

    const { data: members = [], isLoading } = useQuery<User[]>({
        queryKey: ['staff-members'],
        queryFn: getAllMembers,
    });

    const banMutation = useMutation({
        mutationFn: ({ userId, isBanned, reason }: { userId: number; isBanned: boolean; reason?: string }) =>
            isBanned ? banUser(userId, { isBanned: true, reason }) : unbanUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff-members'] });
            setBanDialog({ open: false, user: null, reason: '' });
        },
    });

    const filteredMembers = members.filter((m) =>
        m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Quản lý Members</h2>
                <p className="text-gray-500 mt-1">{members.length} members</p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Tìm theo tên, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Members List */}
            <div className="space-y-3">
                {filteredMembers.map((member) => {
                    const isExpanded = expandedId === member.userID;

                    return (
                        <div key={member.userID} className="bg-white rounded-xl border overflow-hidden">
                            <div className="p-4 flex items-center justify-between">
                                <div
                                    className="flex-1 cursor-pointer"
                                    onClick={() => setExpandedId(isExpanded ? null : member.userID)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <div className="font-semibold text-gray-800">{member.fullName}</div>
                                            <div className="text-sm text-gray-500">{member.email}</div>
                                        </div>
                                        <Badge variant={member.isBanned ? 'destructive' : 'success'}>
                                            {member.isBanned ? 'Bị khóa' : 'Hoạt động'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-green-600 font-medium">
                                        {(member.wallet?.currency || 0).toLocaleString()} đ
                                    </span>
                                    <Button
                                        variant={member.isBanned ? 'outline' : 'ghost'}
                                        size="sm"
                                        onClick={() => setBanDialog({ open: true, user: member, reason: '' })}
                                    >
                                        {member.isBanned ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Ban className="h-4 w-4 text-red-500" />}
                                        <span className="ml-1">{member.isBanned ? 'Mở khóa' : 'Khóa'}</span>
                                    </Button>
                                    <button onClick={() => setExpandedId(isExpanded ? null : member.userID)}>
                                        {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                                    </button>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-t bg-gray-50">
                                    <UserDetailsPanel userId={member.userID} />
                                </div>
                            )}
                        </div>
                    );
                })}
                {filteredMembers.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">Không tìm thấy member nào</div>
                )}
            </div>

            {/* Ban Dialog */}
            <Dialog open={banDialog.open} onClose={() => setBanDialog({ ...banDialog, open: false })}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                        {banDialog.user?.isBanned ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => setBanDialog({ ...banDialog, open: false })}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-gray-500 mb-4">Member: {banDialog.user?.fullName}</p>
                {!banDialog.user?.isBanned && (
                    <textarea
                        className="w-full px-4 py-2 border rounded-lg mb-4"
                        placeholder="Lý do khóa tài khoản..."
                        rows={3}
                        value={banDialog.reason}
                        onChange={(e) => setBanDialog({ ...banDialog, reason: e.target.value })}
                    />
                )}
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setBanDialog({ ...banDialog, open: false })}>Hủy</Button>
                    <Button
                        variant={banDialog.user?.isBanned ? 'default' : 'destructive'}
                        onClick={() => banDialog.user && banMutation.mutate({
                            userId: banDialog.user.userID,
                            isBanned: !banDialog.user.isBanned,
                            reason: banDialog.reason
                        })}
                        disabled={banMutation.isPending}
                    >
                        {banMutation.isPending ? 'Đang xử lý...' : banDialog.user?.isBanned ? 'Mở khóa' : 'Khóa'}
                    </Button>
                </div>
            </Dialog>
        </div>
    );
}
