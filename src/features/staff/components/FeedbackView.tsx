// Staff Feedback View Component
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, MessageSquare, Send, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getFeedbacks, addFeedbackReply, updateFeedbackStatus } from '../api';
import type { Feedback } from '../types';

const Badge = ({ variant = 'default', children }: { variant?: string; children: React.ReactNode }) => {
    const variants: Record<string, string> = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant] || variants.default}`}>{children}</span>;
};

const Button = ({ variant = 'default', size = 'default', className = '', children, ...props }: any) => {
    const variants: Record<string, string> = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
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

export function FeedbackView() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const { data: feedbacks = [], isLoading } = useQuery<Feedback[]>({
        queryKey: ['staff-feedbacks'],
        queryFn: () => getFeedbacks(),
    });

    const replyMutation = useMutation({
        mutationFn: ({ feedbackId, content }: { feedbackId: number; content: string }) =>
            addFeedbackReply(feedbackId, { content }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff-feedbacks'] });
            setReplyContent('');
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ feedbackId, status }: { feedbackId: number; status: string }) =>
            updateFeedbackStatus(feedbackId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff-feedbacks'] });
        },
    });

    const filteredFeedbacks = feedbacks.filter((fb) => {
        const matchesSearch =
            fb.topic?.toLowerCase().includes(search.toLowerCase()) ||
            fb.userEmail?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || fb.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'Open': return { variant: 'warning', icon: <Clock className="h-3 w-3" />, label: 'Mở' };
            case 'In Progress': return { variant: 'info', icon: <MessageSquare className="h-3 w-3" />, label: 'Đang xử lý' };
            case 'Resolved': return { variant: 'success', icon: <CheckCircle className="h-3 w-3" />, label: 'Đã giải quyết' };
            case 'Closed': return { variant: 'default', icon: <XCircle className="h-3 w-3" />, label: 'Đóng' };
            default: return { variant: 'default', icon: null, label: status };
        }
    };

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
                <p className="text-gray-500 mt-1">{feedbacks.length} feedback từ Members</p>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo chủ đề, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">Tất cả</option>
                    <option value="Open">Mở</option>
                    <option value="In Progress">Đang xử lý</option>
                    <option value="Resolved">Đã giải quyết</option>
                    <option value="Closed">Đóng</option>
                </select>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
                {filteredFeedbacks.map((feedback) => {
                    const statusInfo = getStatusInfo(feedback.status);
                    const isExpanded = expandedId === feedback.feedbackID;

                    return (
                        <div key={feedback.feedbackID} className="bg-white rounded-xl border overflow-hidden">
                            <div
                                className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                                onClick={() => setExpandedId(isExpanded ? null : feedback.feedbackID)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-gray-800">{feedback.topic}</h3>
                                        <Badge variant={statusInfo.variant}>
                                            <span className="flex items-center gap-1">{statusInfo.icon}{statusInfo.label}</span>
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {feedback.userName || feedback.userEmail} • {new Date(feedback.createdAt).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">{feedback.messages?.length || 0} tin nhắn</span>
                                    {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-t">
                                    {feedback.description && (
                                        <div className="p-4 bg-gray-50 border-b">
                                            <p className="text-gray-700">{feedback.description}</p>
                                        </div>
                                    )}
                                    <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                                        {feedback.messages?.map((msg) => (
                                            <div
                                                key={msg.messageID}
                                                className={`p-3 rounded-lg ${msg.senderRole === 'Staff' ? 'bg-blue-50 ml-8' : 'bg-gray-100 mr-8'}`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-sm">{msg.senderName}</span>
                                                    <Badge variant={msg.senderRole === 'Staff' ? 'info' : 'default'}>{msg.senderRole}</Badge>
                                                    <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString('vi-VN')}</span>
                                                </div>
                                                <p className="text-gray-700">{msg.content}</p>
                                            </div>
                                        ))}
                                        {(!feedback.messages || feedback.messages.length === 0) && (
                                            <p className="text-center text-gray-400 py-4">Chưa có tin nhắn nào</p>
                                        )}
                                    </div>
                                    <div className="p-4 border-t bg-gray-50">
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                placeholder="Nhập phản hồi..."
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                            <Button
                                                onClick={() => replyMutation.mutate({ feedbackId: feedback.feedbackID, content: replyContent })}
                                                disabled={!replyContent.trim() || replyMutation.isPending}
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <select
                                            value={feedback.status}
                                            onChange={(e) => statusMutation.mutate({ feedbackId: feedback.feedbackID, status: e.target.value })}
                                            className="px-3 py-1 text-sm border rounded-lg"
                                            disabled={statusMutation.isPending}
                                        >
                                            <option value="Open">Mở</option>
                                            <option value="In Progress">Đang xử lý</option>
                                            <option value="Resolved">Đã giải quyết</option>
                                            <option value="Closed">Đóng</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {filteredFeedbacks.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">Không có feedback nào</div>
                )}
            </div>
        </div>
    );
}
