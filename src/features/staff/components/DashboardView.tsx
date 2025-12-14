// Staff Dashboard View Component - Enhanced with real API data
import { useQuery } from '@tanstack/react-query';
import { Users, UserX, MessageSquare, CheckCircle, Clock, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { getUsersFilter, getFeedbacksPaginated } from '../api';
import type { UserFilterResponse, FeedbackListResponse, User, Feedback } from '../types';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    subtitle?: string;
    color?: string;
}

function StatCard({ title, value, icon, subtitle, color = 'blue' }: StatCardProps) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 border-blue-200',
        green: 'bg-gradient-to-br from-green-50 to-green-100 text-green-600 border-green-200',
        orange: 'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 border-orange-200',
        red: 'bg-gradient-to-br from-red-50 to-red-100 text-red-600 border-red-200',
        purple: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 border-purple-200',
        indigo: 'bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 border-indigo-200',
    };

    return (
        <div className={`p-6 rounded-xl border ${colorClasses[color]} transition-all hover:shadow-lg hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                    {subtitle && <p className="text-xs mt-2 opacity-70">{subtitle}</p>}
                </div>
                <div className="p-3 rounded-full bg-white/60 shadow-sm">{icon}</div>
            </div>
        </div>
    );
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' đ';
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN');

const getStatusBadge = (status: string) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
        case 'PENDING':
        case 'OPEN':
            return { bg: 'bg-orange-100 text-orange-700', label: 'Chờ xử lý' };
        case 'IN PROGRESS':
            return { bg: 'bg-blue-100 text-blue-700', label: 'Đang xử lý' };
        case 'COMPLETED':
        case 'RESOLVED':
            return { bg: 'bg-green-100 text-green-700', label: 'Hoàn thành' };
        default:
            return { bg: 'bg-gray-100 text-gray-700', label: status };
    }
};

export function DashboardView() {
    // Fetch users (Members only) with pagination - get first page for stats
    const { data: usersData, isLoading: loadingUsers } = useQuery<UserFilterResponse>({
        queryKey: ['staff-dashboard-users'],
        queryFn: () => getUsersFilter({ CurrentPage: 1, PageSize: 100 }), // Get up to 100 for stats
    });

    // Fetch feedbacks with pagination - use larger pageSize for accurate stats
    const { data: feedbacksData, isLoading: loadingFeedbacks } = useQuery<FeedbackListResponse>({
        queryKey: ['staff-dashboard-feedbacks'],
        queryFn: () => getFeedbacksPaginated(1, 1000), // Fetch up to 1000 for accurate counting
    });

    const isLoading = loadingUsers || loadingFeedbacks;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    // Extract data
    const users = usersData?.data?.items || [];
    const feedbacks = feedbacksData?.items || [];
    const totalFeedbacks = feedbacksData?.totalItems || 0;

    // Calculate stats
    const totalMembers = usersData?.data?.totalItems || users.length;
    const bannedMembers = users.filter((m) => m.isBanned).length;
    const activeMembers = users.filter((m) => !m.isBanned && !m.isDeleted).length;

    // Feedback stats
    const pendingFeedbacks = feedbacks.filter((f) =>
        f.status?.toUpperCase() === 'PENDING' || f.status?.toUpperCase() === 'OPEN'
    ).length;
    const completedFeedbacks = feedbacks.filter((f) =>
        f.status?.toUpperCase() === 'COMPLETED' || f.status?.toUpperCase() === 'RESOLVED'
    ).length;

    // Top members by balance (currency)
    const topMembers = [...users]
        .sort((a, b) => (b.currency || 0) - (a.currency || 0))
        .slice(0, 5);

    // Total balance of all members
    const totalBalance = users.reduce((sum, u) => sum + (u.currency || 0), 0);

    // Recent feedbacks (first 5)
    const recentFeedbacks = feedbacks.slice(0, 5);

    // New members (joined in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newMembers = users.filter((m) => new Date(m.createdAt) > sevenDaysAgo).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                    <p className="text-gray-500 mt-1">Tổng quan hoạt động hệ thống</p>
                </div>
                <div className="text-sm text-gray-400">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Cards - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Tổng Members"
                    value={totalMembers}
                    icon={<Users className="h-6 w-6" />}
                    subtitle={`${activeMembers} đang hoạt động`}
                    color="blue"
                />
                <StatCard
                    title="Members mới (7 ngày)"
                    value={newMembers}
                    icon={<TrendingUp className="h-6 w-6" />}
                    subtitle="Đăng ký gần đây"
                    color="green"
                />
                <StatCard
                    title="Đang bị khóa"
                    value={bannedMembers}
                    icon={<UserX className="h-6 w-6" />}
                    subtitle={`${((bannedMembers / totalMembers) * 100 || 0).toFixed(1)}% tổng số`}
                    color="red"
                />
            </div>

            {/* Stats Cards - Row 2: Feedbacks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Tổng Feedback"
                    value={totalFeedbacks}
                    icon={<MessageSquare className="h-6 w-6" />}
                    subtitle="Tất cả yêu cầu hỗ trợ"
                    color="indigo"
                />
                <StatCard
                    title="Chờ xử lý"
                    value={pendingFeedbacks}
                    icon={<Clock className="h-6 w-6" />}
                    subtitle="Cần phản hồi"
                    color="orange"
                />
                <StatCard
                    title="Đã hoàn thành"
                    value={completedFeedbacks}
                    icon={<CheckCircle className="h-6 w-6" />}
                    subtitle="Đã giải quyết"
                    color="green"
                />
            </div>

            {/* Two columns: Top Members & Recent Feedbacks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Members by Balance */}
                <div className="bg-white rounded-xl border shadow-sm">
                    <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                            Top Members (Số dư cao nhất)
                        </h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {topMembers.map((member, index) => (
                            <div key={member.userID} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                        index === 1 ? 'bg-gray-300 text-gray-700' :
                                            index === 2 ? 'bg-orange-300 text-orange-800' :
                                                'bg-blue-100 text-blue-600'
                                        }`}>
                                        {index + 1}
                                    </span>
                                    <div>
                                        <div className="font-medium text-gray-800">{member.fullName}</div>
                                        <div className="text-sm text-gray-500">{member.email}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-semibold text-green-600">
                                        {formatCurrency(member.currency || 0)}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {member.isBanned ? '🚫 Đã khóa' : '✅ Active'}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {topMembers.length === 0 && (
                            <div className="text-center text-gray-400 py-8">
                                <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                Chưa có member nào
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Feedbacks */}
                <div className="bg-white rounded-xl border shadow-sm">
                    <div className="p-4 border-b bg-gradient-to-r from-orange-50 to-yellow-50">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-orange-600" />
                            Feedback gần đây
                        </h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {recentFeedbacks.map((fb) => {
                            const statusBadge = getStatusBadge(fb.status);
                            return (
                                <div key={fb.feedbackID} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-800 truncate max-w-[200px]">
                                            #{fb.feedbackID} {fb.topic}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg}`}>
                                            {statusBadge.label}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center justify-between">
                                        <span>{fb.user?.fullName || fb.user?.email || users.find(u => u.userID === fb.userID)?.fullName || users.find(u => u.userID === fb.userID)?.email || 'Người dùng'}</span>
                                        <span className="text-xs text-gray-400">{formatDate(fb.createdAt)}</span>
                                    </div>
                                    {fb.description && (
                                        <p className="text-xs text-gray-400 mt-1 truncate">{fb.description}</p>
                                    )}
                                </div>
                            );
                        })}
                        {recentFeedbacks.length === 0 && (
                            <div className="text-center text-gray-400 py-8">
                                <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                Chưa có feedback nào
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
