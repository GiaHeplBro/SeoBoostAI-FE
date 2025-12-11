// Admin Feedback Management Component - Read-only view with statistics
import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MessageSquare, CheckCircle, Clock, ChevronDown, ChevronUp, AlertCircle, Filter, X, Users, Eye, User } from 'lucide-react';
import { getFeedbacksPaginated, getUsersFilter, getChatHistory } from '../api';
import type { FeedbackListResponse, UserFilterResponse, FeedbackMessage } from '../types';

// ==================== Constants ====================

const TOPIC_OPTIONS = [
    { value: 'all', label: 'Tất cả chủ đề' },
    { value: 'Lỗi nạp tiền, lỗi ví', label: 'Lỗi nạp tiền, lỗi ví' },
    { value: 'Lỗi chức năng', label: 'Lỗi chức năng' },
    { value: 'Góp ý-Phàn nàn', label: 'Góp ý - Phàn nàn' },
    { value: 'Khác', label: 'Khác' },
];

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Chờ xử lý', icon: Clock },
    { value: 'completed', label: 'Hoàn thành', icon: CheckCircle },
    { value: 'all', label: 'Tất cả', icon: null },
];

// ==================== UI Components ====================

const Badge = ({ variant = 'default', children }: { variant?: string; children: React.ReactNode }) => {
    const variants: Record<string, string> = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
        pending: 'bg-orange-100 text-orange-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant] || variants.default}`}>{children}</span>;
};

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) => (
    <div className="bg-white rounded-xl border p-4 flex items-center gap-4">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

// Dialog/Modal component
const Dialog = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

// ==================== Helper Functions ====================

const getStatusInfo = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'PENDING':
        case 'OPEN': return { variant: 'pending', icon: <Clock className="h-3 w-3" />, label: 'Chờ xử lý' };
        case 'IN PROGRESS': return { variant: 'info', icon: <MessageSquare className="h-3 w-3" />, label: 'Đang xử lý' };
        case 'COMPLETED':
        case 'RESOLVED': return { variant: 'success', icon: <CheckCircle className="h-3 w-3" />, label: 'Hoàn thành' };
        default: return { variant: 'default', icon: null, label: status };
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
};

// ==================== Main Component ====================

export function FeedbackManagement() {
    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [topicFilter, setTopicFilter] = useState('all');
    const [selectedFeedback, setSelectedFeedback] = useState<any>(null); // For popup
    const [chatMessages, setChatMessages] = useState<FeedbackMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Fetch feedbacks
    const { data: feedbackData, isLoading } = useQuery<FeedbackListResponse>({
        queryKey: ['admin-feedbacks-paginated'],
        queryFn: () => getFeedbacksPaginated(1, 500), // Get all for client-side filtering
    });

    // Fetch users for user info lookup
    const { data: usersData } = useQuery<UserFilterResponse>({
        queryKey: ['admin-users-for-feedback'],
        queryFn: () => getUsersFilter({ CurrentPage: 1, PageSize: 500 }),
        staleTime: 5 * 60 * 1000,
    });

    // Create user lookup map
    const usersMap = useMemo(() => {
        return usersData?.data?.items?.reduce((map: Record<number, { fullName: string; email: string }>, user) => {
            map[user.userID] = { fullName: user.fullName, email: user.email };
            return map;
        }, {} as Record<number, { fullName: string; email: string }>) || {};
    }, [usersData]);

    // Load chat messages when selecting a feedback
    useEffect(() => {
        if (selectedFeedback) {
            setLoadingMessages(true);
            getChatHistory(selectedFeedback.feedbackID)
                .then((messages: FeedbackMessage[]) => setChatMessages(messages))
                .catch((error: any) => console.error('Error loading chat history:', error))
                .finally(() => setLoadingMessages(false));
        } else {
            setChatMessages([]);
        }
    }, [selectedFeedback]);

    const feedbacks = feedbackData?.items || [];

    // Calculate statistics
    const stats = useMemo(() => {
        const total = feedbacks.length;
        const pending = feedbacks.filter(fb => {
            const status = fb.status?.toUpperCase();
            return status === 'PENDING' || status === 'OPEN' || status === 'IN PROGRESS';
        }).length;
        const completed = feedbacks.filter(fb => {
            const status = fb.status?.toUpperCase();
            return status === 'COMPLETED' || status === 'RESOLVED';
        }).length;
        return { total, pending, completed };
    }, [feedbacks]);

    // Filter and sort feedbacks
    const filteredFeedbacks = useMemo(() => {
        return feedbacks
            .filter(ticket => {
                // Status filter
                const status = ticket.status?.toUpperCase();
                if (statusFilter === 'pending') {
                    if (status === 'COMPLETED' || status === 'RESOLVED') return false;
                } else if (statusFilter === 'completed') {
                    if (status !== 'COMPLETED' && status !== 'RESOLVED') return false;
                }

                // Topic filter
                if (topicFilter !== 'all' && ticket.topic !== topicFilter) return false;

                // Search query
                if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    const userInfo = usersMap[ticket.userID];
                    const userName = userInfo?.fullName?.toLowerCase() || '';
                    const userEmail = userInfo?.email?.toLowerCase() || '';
                    const topic = ticket.topic?.toLowerCase() || '';
                    const description = ticket.description?.toLowerCase() || '';
                    const ticketId = ticket.feedbackID?.toString() || '';

                    if (!userName.includes(query) &&
                        !userEmail.includes(query) &&
                        !topic.includes(query) &&
                        !description.includes(query) &&
                        !ticketId.includes(query)) {
                        return false;
                    }
                }

                return true;
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [feedbacks, statusFilter, topicFilter, searchQuery, usersMap]);

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
                <h2 className="text-2xl font-bold text-gray-800">Quản lý Feedback</h2>
                <p className="text-gray-500 mt-1">Xem và theo dõi các yêu cầu hỗ trợ từ người dùng</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Tổng feedback" value={stats.total} icon={MessageSquare} color="bg-blue-500" />
                <StatCard title="Đang chờ xử lý" value={stats.pending} icon={Clock} color="bg-orange-500" />
                <StatCard title="Đã hoàn thành" value={stats.completed} icon={CheckCircle} color="bg-green-500" />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border p-4 space-y-3">
                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm theo tên, email, #ID, chủ đề..."
                        className="w-full pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

                <div className="flex gap-4 flex-wrap">
                    {/* Status Filter Buttons */}
                    <div className="flex gap-2 items-center">
                        <Filter className="h-4 w-4 text-gray-500" />
                        {STATUS_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setStatusFilter(opt.value as any)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${statusFilter === opt.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Topic Filter */}
                    <select
                        value={topicFilter}
                        onChange={(e) => setTopicFilter(e.target.value)}
                        className="px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                        {TOPIC_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    <span className="ml-auto text-sm text-gray-500">
                        {filteredFeedbacks.length}/{stats.total} hiển thị
                    </span>
                </div>
            </div>

            {/* Feedback List */}
            <div className="space-y-3">
                {filteredFeedbacks.map((feedback) => {
                    const statusInfo = getStatusInfo(feedback.status);
                    const userInfo = usersMap[feedback.userID];
                    const displayName = userInfo?.fullName || userInfo?.email || `User #${feedback.userID}`;

                    return (
                        <div
                            key={feedback.feedbackID}
                            className="bg-white rounded-xl border p-4 cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all flex items-center justify-between"
                            onClick={() => setSelectedFeedback(feedback)}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 text-sm">#{feedback.feedbackID}</span>
                                    <h3 className="font-semibold text-gray-800">{feedback.topic}</h3>
                                    <Badge variant={statusInfo.variant}>
                                        <span className="flex items-center gap-1">
                                            {statusInfo.icon}
                                            {statusInfo.label}
                                        </span>
                                    </Badge>
                                </div>
                                <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                    <Users className="h-3 w-3" />
                                    {displayName} • {formatDate(feedback.createdAt)}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-blue-500" />
                                <span className="text-sm text-blue-600">Xem chi tiết</span>
                            </div>
                        </div>
                    );
                })}

                {filteredFeedbacks.length === 0 && feedbacks.length > 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
                        <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Không có feedback nào với bộ lọc này</p>
                        <button
                            onClick={() => { setStatusFilter('all'); setTopicFilter('all'); setSearchQuery(''); }}
                            className="text-sm text-blue-600 mt-2 hover:underline"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                )}

                {feedbacks.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Chưa có feedback nào</p>
                    </div>
                )}
            </div>

            {/* Feedback Detail Popup */}
            <Dialog
                open={!!selectedFeedback}
                onClose={() => setSelectedFeedback(null)}
                title={selectedFeedback ? `Ticket #${selectedFeedback.feedbackID} - ${selectedFeedback.topic}` : ''}
            >
                {selectedFeedback && (() => {
                    const statusInfo = getStatusInfo(selectedFeedback.status);
                    const userInfo = usersMap[selectedFeedback.userID];
                    const displayName = userInfo?.fullName || userInfo?.email || `User #${selectedFeedback.userID}`;

                    return (
                        <div>
                            {/* User Info */}
                            <div className="p-4 bg-gray-50 border-b flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-medium text-lg">{displayName[0]?.toUpperCase()}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{userInfo?.fullName || 'Unknown User'}</p>
                                    <p className="text-sm text-gray-500">{userInfo?.email || `User ID: ${selectedFeedback.userID}`}</p>
                                </div>
                                <Badge variant={statusInfo.variant}>
                                    <span className="flex items-center gap-1">{statusInfo.icon} {statusInfo.label}</span>
                                </Badge>
                            </div>

                            {/* Description */}
                            {selectedFeedback.description && (
                                <div className="p-4 bg-blue-50 border-b">
                                    <p className="text-sm text-gray-700"><strong>Mô tả:</strong> {selectedFeedback.description}</p>
                                </div>
                            )}

                            {/* Chat Messages History */}
                            <div className="p-4">
                                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Lịch sử tin nhắn ({chatMessages.length})
                                </h4>
                                {loadingMessages ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : chatMessages.length > 0 ? (
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {chatMessages.map((msg, index) => {
                                            const senderId = Number(msg.senderID);
                                            const senderInfo = usersMap[senderId];
                                            const senderName = senderInfo?.fullName || senderInfo?.email || msg.senderName || `User #${senderId}`;
                                            const isStaff = senderId !== selectedFeedback.userID;
                                            return (
                                                <div
                                                    key={index}
                                                    className={`p-3 rounded-lg ${isStaff ? 'bg-blue-50 ml-6 border-l-4 border-blue-400' : 'bg-gray-100 mr-6 border-l-4 border-gray-400'}`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User className="h-3 w-3" />
                                                        <span className="font-medium text-sm">{senderName}</span>
                                                        <Badge variant={isStaff ? 'info' : 'default'}>
                                                            {isStaff ? 'Staff' : 'Member'}
                                                        </Badge>
                                                        <span className="text-xs text-gray-400 ml-auto">{formatDate(msg.createdAt)}</span>
                                                    </div>
                                                    <p className="text-gray-700 text-sm">{msg.content || msg.message}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-400 py-6">Chưa có tin nhắn nào</p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-gray-50 border-t text-sm text-gray-500 text-center">
                                Tạo lúc: {formatDate(selectedFeedback.createdAt)}
                            </div>
                        </div>
                    );
                })()}
            </Dialog>
        </div>
    );
}
