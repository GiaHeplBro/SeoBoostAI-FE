// Staff Dashboard View Component
import { useQuery } from '@tanstack/react-query';
import { Users, UserX, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { getStaffDashboard, getAllMembers, getFeedbacks } from '../api';
import type { StaffDashboard, User, Feedback } from '../types';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    subtitle?: string;
    color?: string;
}

function StatCard({ title, value, icon, subtitle, color = 'blue' }: StatCardProps) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        orange: 'bg-orange-50 text-orange-600 border-orange-200',
        red: 'bg-red-50 text-red-600 border-red-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
    };

    return (
        <div className={`p-6 rounded-xl border ${colorClasses[color]} transition-all hover:shadow-md`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                    {subtitle && <p className="text-xs mt-2 opacity-70">{subtitle}</p>}
                </div>
                <div className="p-3 rounded-full bg-white/50">{icon}</div>
            </div>
        </div>
    );
}

export function DashboardView() {
    // Fetch members to calculate stats
    const { data: members = [], isLoading: loadingMembers } = useQuery<User[]>({
        queryKey: ['staff-members'],
        queryFn: getAllMembers,
    });

    // Fetch feedbacks for recent activity
    const { data: feedbacks = [], isLoading: loadingFeedbacks } = useQuery<Feedback[]>({
        queryKey: ['staff-feedbacks'],
        queryFn: () => getFeedbacks({ pageSize: 5 }),
    });

    const isLoading = loadingMembers || loadingFeedbacks;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Calculate stats from data
    const totalMembers = members.length;
    const bannedMembers = members.filter((m) => m.isBanned).length;
    const openFeedbacks = feedbacks.filter((f) => f.status === 'Open' || f.status === 'In Progress').length;
    const resolvedFeedbacks = feedbacks.filter((f) => f.status === 'Resolved' || f.status === 'Closed').length;

    // Top members by balance
    const topMembers = [...members]
        .sort((a, b) => (b.wallet?.currency || 0) - (a.wallet?.currency || 0))
        .slice(0, 5);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p className="text-gray-500 mt-1">Tổng quan hoạt động</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Tổng Members"
                    value={totalMembers}
                    icon={<Users className="h-6 w-6" />}
                    color="blue"
                />
                <StatCard
                    title="Đang bị khóa"
                    value={bannedMembers}
                    icon={<UserX className="h-6 w-6" />}
                    color="red"
                />
                <StatCard
                    title="Feedback chờ xử lý"
                    value={openFeedbacks}
                    icon={<Clock className="h-6 w-6" />}
                    color="orange"
                />
                <StatCard
                    title="Đã giải quyết"
                    value={resolvedFeedbacks}
                    icon={<CheckCircle className="h-6 w-6" />}
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Members */}
                <div className="bg-white rounded-xl border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Members (Số dư)</h3>
                    <div className="space-y-3">
                        {topMembers.map((member, index) => (
                            <div key={member.userID} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <div className="font-medium text-gray-800">{member.fullName}</div>
                                        <div className="text-sm text-gray-500">{member.email}</div>
                                    </div>
                                </div>
                                <div className="font-mono font-medium text-green-600">
                                    {(member.wallet?.currency || 0).toLocaleString()} đ
                                </div>
                            </div>
                        ))}
                        {topMembers.length === 0 && (
                            <div className="text-center text-gray-400 py-4">Chưa có member nào</div>
                        )}
                    </div>
                </div>

                {/* Recent Feedbacks */}
                <div className="bg-white rounded-xl border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Feedback gần đây</h3>
                    <div className="space-y-3">
                        {feedbacks.slice(0, 5).map((fb) => (
                            <div key={fb.feedbackID} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-gray-800">{fb.topic}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${fb.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
                                            fb.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                fb.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {fb.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {fb.userName || fb.userEmail} • {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                        ))}
                        {feedbacks.length === 0 && (
                            <div className="text-center text-gray-400 py-4">Chưa có feedback nào</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
