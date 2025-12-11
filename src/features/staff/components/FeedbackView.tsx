// Staff Feedback View with SignalR Real-time Chat
import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as signalR from '@microsoft/signalr';
import {
    MessageSquare, Send, CheckCircle, Clock, ChevronLeft, ChevronRight,
    User, AlertCircle, RefreshCw, Search, Filter, X
} from 'lucide-react';
import { getFeedbacksPaginated, getChatHistory, updateFeedback, getUsersFilter } from '../api';
import type { Feedback, FeedbackListResponse, FeedbackMessage, ChatMessage } from '../types';

// ==================== Constants ====================

const TOPIC_OPTIONS = [
    { value: 'all', label: 'Tất cả chủ đề' },
    { value: 'Lỗi nạp tiền, lỗi ví', label: 'Lỗi nạp tiền, lỗi ví' },
    { value: 'Lỗi chức năng', label: 'Lỗi chức năng' },
    { value: 'Góp ý-Phàn nàn', label: 'Góp ý - Phàn nàn' },
    { value: 'Khác', label: 'Khác' },
];

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'all', label: 'Tất cả' },
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
    return <span className={`px - 2 py - 1 rounded - full text - xs font - medium ${variants[variant] || variants.default} `}>{children}</span>;
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
        sm: 'px-3 py-1.5 text-sm',
        icon: 'p-2',
    };
    return (
        <button className={`rounded - lg font - medium transition - colors disabled: opacity - 50 disabled: cursor - not - allowed ${variants[variant]} ${sizes[size]} ${className} `}
            disabled={disabled} {...props}>{children}</button>
    );
};

// ==================== Utility Functions ====================

const getAccessToken = (): string | null => {
    const encodedTokens = localStorage.getItem('tokens');
    if (!encodedTokens) return null;
    try {
        const decodedString = decodeURIComponent(atob(encodedTokens));
        const { accessToken } = JSON.parse(decodedString);
        return accessToken;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

const getCurrentUserId = (): number | null => {
    // Get userID from localStorage (saved during login from JWT's user_ID)
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        const decoded = JSON.parse(decodeURIComponent(atob(userStr)));
        const userId = decoded.userID || decoded.user_ID;
        console.log('🔍 Staff User ID from localStorage:', userId);
        return userId ? Number(userId) : null;
    } catch (error) {
        console.error('Error getting user ID:', error);
        return null;
    }
};

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

const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

// ==================== Main Component ====================

export function FeedbackView() {
    const queryClient = useQueryClient();
    const currentUserId = getCurrentUserId();

    // State
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTicket, setSelectedTicket] = useState<Feedback | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('pending'); // Default to pending
    const [topicFilter, setTopicFilter] = useState('all');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const selectedTicketRef = useRef<Feedback | null>(null);

    // Keep ref in sync with state
    useEffect(() => {
        selectedTicketRef.current = selectedTicket;
    }, [selectedTicket]);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fetch feedbacks with pagination
    const { data: feedbackData, isLoading, refetch } = useQuery<FeedbackListResponse>({
        queryKey: ['staff-feedbacks-paginated', currentPage],
        queryFn: () => getFeedbacksPaginated(currentPage, 100), // Get more items for client-side filtering
    });

    // Fetch users for user info lookup
    const { data: usersData } = useQuery({
        queryKey: ['staff-users-for-feedback'],
        queryFn: () => getUsersFilter({ CurrentPage: 1, PageSize: 500 }),
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // Create user lookup map
    const usersMap = usersData?.data?.items?.reduce((map: Record<number, { fullName: string; email: string }>, user) => {
        map[user.userID] = { fullName: user.fullName, email: user.email };
        return map;
    }, {} as Record<number, { fullName: string; email: string }>) || {};

    // Update feedback mutation (for completing ticket)
    const updateMutation = useMutation({
        mutationFn: updateFeedback,
        onSuccess: (updatedFeedback) => {
            queryClient.invalidateQueries({ queryKey: ['staff-feedbacks-paginated'] });
            if (selectedTicket && updatedFeedback) {
                setSelectedTicket({ ...selectedTicket, status: updatedFeedback.status });
            }
            alert('Đã cập nhật trạng thái ticket!');
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Có lỗi xảy ra');
        },
    });

    // Initialize SignalR connection
    const initSignalR = useCallback(async () => {
        const token = getAccessToken();
        if (!token) {
            console.warn('⚠️ No token available for SignalR');
            setConnectionStatus('error');
            return;
        }

        // Log token info (first 30 chars only for security)
        console.log('🔑 Token found:', token.substring(0, 30) + '...');

        // Build hub URL - use the same base as API but without /api
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://localhost:7012';
        const hubUrl = `${baseUrl}/chatHub`;
        console.log('🔗 Connecting to SignalR Hub:', hubUrl);

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => token,
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .configureLogging(signalR.LogLevel.Debug)
            .build();

        setConnection(newConnection);
        setConnectionStatus('connecting');

        try {
            await newConnection.start();
            console.log('✅ SignalR Connected');
            setConnectionStatus('connected');

            // Join AdminGroup to receive notifications
            await newConnection.invoke('JoinChatRoom', 'AdminGroup');

            // Listen for new ticket notifications
            newConnection.on('ReceiveNewTicketNotification', (data) => {
                console.log('📥 New Ticket:', data);
                refetch();
            });

            // Listen for messages
            newConnection.on('ReceiveMessage', (user: string, message: string, time: string) => {
                // Check if message is from staff (comparing with 'Staff' or 'Admin')
                const isMe = user === 'Staff' || user === 'Admin' || user === 'Bạn (Staff)';
                const msg: ChatMessage = { user, message, time, isMe };
                setMessages(prev => {
                    const updated = [...prev, msg];
                    return updated.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
                });
            });

            // Listen for status changes
            newConnection.on('ReceiveTicketStatusChange', (status: string) => {
                const currentTicket = selectedTicketRef.current;
                if (currentTicket) {
                    setSelectedTicket({ ...currentTicket, status });
                    queryClient.invalidateQueries({ queryKey: ['staff-feedbacks-paginated'] });
                }
            });

            // Listen for errors
            newConnection.on('ReceiveError', (error: string) => {
                console.error('❌ SignalR Error:', error);
            });

        } catch (error) {
            console.error('❌ SignalR Connection failed:', error);
            setConnectionStatus('error');
        }
    }, [refetch, queryClient]);

    // Initialize SignalR on mount
    useEffect(() => {
        initSignalR();
        return () => {
            if (connection) {
                connection.stop();
            }
        };
    }, []);

    // Join ticket room
    const joinTicket = async (ticket: Feedback) => {
        setMessages([]);
        setSelectedTicket(ticket);

        // Fetch chat history
        try {
            const history = await getChatHistory(ticket.feedbackID);
            console.log('📜 Staff Chat history:', history);
            console.log('🔍 Staff User ID for comparison:', currentUserId);

            const formattedHistory: ChatMessage[] = history
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map(h => {
                    // Ensure numeric comparison
                    const senderId = Number(h.senderID);
                    const myId = Number(currentUserId);
                    const isMe = senderId === myId;
                    console.log(`Staff: Message from senderID=${senderId}, myId=${myId}, isMe=${isMe}`);
                    return {
                        user: isMe ? 'Staff' : 'User',
                        message: h.content,
                        time: h.createdAt,
                        isMe: isMe
                    };
                });
            setMessages(formattedHistory);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }

        // Join SignalR room
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
            try {
                await connection.invoke('JoinChatRoom', ticket.feedbackID.toString());
                console.log('✅ Joined room:', ticket.feedbackID);
            } catch (error) {
                console.error('Error joining room:', error);
            }
        }
    };

    // Send message
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedTicket || !connection) return;

        if (connection.state !== signalR.HubConnectionState.Connected) {
            alert('Chưa kết nối SignalR. Vui lòng thử lại.');
            return;
        }

        try {
            await connection.invoke('SendMessageToRoom', selectedTicket.feedbackID.toString(), newMessage);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Không thể gửi tin nhắn');
        }
    };

    // Complete ticket
    const completeTicket = async () => {
        if (!selectedTicket) return;

        const updatedTicket = {
            ...selectedTicket,
            status: 'Completed',
            updatedAt: new Date().toISOString()
        };

        updateMutation.mutate(updatedTicket);

        // Notify via SignalR
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
            try {
                await connection.invoke('NotifyTicketStatusChanged', selectedTicket.feedbackID.toString(), 'Completed');
            } catch (error) {
                console.error('Error notifying status change:', error);
            }
        }
    };

    const tickets = feedbackData?.items || [];
    const totalPages = feedbackData?.totalPages || 1;
    const totalItems = feedbackData?.totalItems || 0;

    // Filter and sort tickets
    const filteredTickets = tickets
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

            // Search query (search in user name, email, topic, description)
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const userName = ticket.user?.fullName?.toLowerCase() || '';
                const userEmail = ticket.user?.email?.toLowerCase() || '';
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-gray-50 rounded-xl overflow-hidden border">
            {/* Ticket List Sidebar */}
            <div className="w-96 bg-white border-r flex flex-col">
                {/* Header with Search & Filters */}
                <div className="p-3 border-b bg-gray-50 space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" /> Tickets
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></span>
                            <Button variant="ghost" size="icon" onClick={() => refetch()} title="Làm mới">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm theo tên, email, #ID..."
                            className="w-full pl-9 pr-8 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

                    {/* Status Filter Buttons */}
                    <div className="flex gap-1">
                        {STATUS_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setStatusFilter(opt.value as any)}
                                className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${statusFilter === opt.value
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
                        className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                        {TOPIC_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    <p className="text-xs text-gray-500">{filteredTickets.length}/{totalItems} hiển thị</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredTickets.map(ticket => {
                        const statusInfo = getStatusInfo(ticket.status);
                        const isSelected = selectedTicket?.feedbackID === ticket.feedbackID;
                        // Get user info from usersMap or ticket.user
                        const userInfo = usersMap[ticket.userID] || ticket.user;
                        const displayName = userInfo?.fullName || userInfo?.email || `User #${ticket.userID}`;
                        return (
                            <div key={ticket.feedbackID} onClick={() => joinTicket(ticket)}
                                className={`p-3 border-b cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-800 text-sm truncate">
                                            #{ticket.feedbackID} {ticket.topic}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate mt-0.5">
                                            {displayName}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">{formatDateTime(ticket.createdAt)}</div>
                                    </div>
                                    <Badge variant={statusInfo.variant}>
                                        <span className="flex items-center gap-1">{statusInfo.icon}</span>
                                    </Badge>
                                </div>
                            </div>
                        );
                    })}

                    {filteredTickets.length === 0 && tickets.length > 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <Filter className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">Không có ticket phù hợp</p>
                            <button
                                onClick={() => { setStatusFilter('all'); setTopicFilter('all'); setSearchQuery(''); }}
                                className="text-xs text-blue-600 mt-1 hover:underline"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}

                    {tickets.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <AlertCircle className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                            <p>Không có ticket nào</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-3 border-t bg-gray-50 flex items-center justify-between">
                        <Button variant="ghost" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-600">Trang {currentPage}/{totalPages}</span>
                        <Button variant="ghost" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedTicket ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Ticket #{selectedTicket.feedbackID} - {selectedTicket.topic}</h3>
                                    <p className="text-sm text-gray-500">
                                        {usersMap[selectedTicket.userID]?.fullName || usersMap[selectedTicket.userID]?.email || selectedTicket.user?.fullName || selectedTicket.user?.email || `User #${selectedTicket.userID}`}
                                    </p>
                                </div>
                            </div>
                            {selectedTicket.status?.toUpperCase() !== 'COMPLETED' && (
                                <Button variant="success" size="sm" onClick={completeTicket} disabled={updateMutation.isPending}>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    {updateMutation.isPending ? 'Đang xử lý...' : 'Hoàn thành'}
                                </Button>
                            )}
                        </div>

                        {/* Description */}
                        {selectedTicket.description && (
                            <div className="p-4 bg-blue-50 border-b">
                                <p className="text-sm text-gray-700"><strong>Mô tả:</strong> {selectedTicket.description}</p>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, idx) => {
                                // Use isMe flag if available, otherwise fallback to user name comparison
                                const isStaff = msg.isMe !== undefined ? msg.isMe : (msg.user === 'Staff' || msg.user === 'Admin');
                                return (
                                    <div key={idx} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isStaff ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                                            <div className={`text-xs mb-1 ${isStaff ? 'text-blue-200' : 'text-gray-500'}`}>{isStaff ? 'Bạn (Staff)' : msg.user}</div>
                                            <p className="break-words">{msg.message}</p>
                                            <div className={`text-xs mt-1 ${isStaff ? 'text-blue-200' : 'text-gray-400'}`}>{formatDateTime(msg.time)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            {messages.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <MessageSquare className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                                    <p>Chưa có tin nhắn nào</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        {selectedTicket.status?.toUpperCase() === 'COMPLETED' ? (
                            <div className="p-4 border-t bg-gray-50 text-center text-gray-500 italic">
                                Ticket này đã được đánh dấu hoàn thành
                            </div>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="p-4 border-t flex gap-2">
                                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                <Button type="submit" disabled={!newMessage.trim() || connectionStatus !== 'connected'}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg">Chọn một ticket để bắt đầu chat</p>
                            <p className="text-sm mt-2">
                                {connectionStatus === 'connected' && <span className="text-green-600">● SignalR đã kết nối</span>}
                                {connectionStatus === 'connecting' && <span className="text-yellow-600">⏳ Đang kết nối...</span>}
                                {connectionStatus === 'error' && <span className="text-red-600">❌ Không thể kết nối SignalR</span>}
                                {connectionStatus === 'disconnected' && <span className="text-gray-400">○ Chưa kết nối</span>}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
