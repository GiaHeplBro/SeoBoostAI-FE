// User Feedback Page - Support Chat with Staff via SignalR
import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as signalR from '@microsoft/signalr';
import {
    MessageSquare, Send, Plus, ArrowLeft, Clock, CheckCircle, User, AlertCircle, Filter
} from 'lucide-react';
import api from '@/axiosInstance';

// ==================== Types ====================

interface Feedback {
    feedbackID: number;
    userID: number;
    topic: string;
    status: string;
    description?: string;
    createdAt: string;
    updatedAt?: string;
    isDeleted?: boolean;
}

interface FeedbackMessage {
    messageID: number;
    feedbackID: number;
    senderID: number;
    content: string;
    createdAt: string;
    isDeleted?: boolean;
}

interface ChatMessage {
    user: string;
    message: string;
    time: string;
    isMe?: boolean; // Flag to track if message is from current user
}

// ==================== Constants ====================

const TOPIC_OPTIONS = [
    { value: 'Lỗi nạp tiền, lỗi ví', label: 'Lỗi nạp tiền, lỗi ví' },
    { value: 'Lỗi chức năng', label: 'Lỗi chức năng' },
    { value: 'Góp ý-Phàn nàn', label: 'Góp ý - Phàn nàn' },
    { value: 'Khác', label: 'Khác' },
];

const STATUS_FILTER_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'completed', label: 'Hoàn thành' },
];

// ==================== API Functions ====================

// Get user's own feedback tickets
const getUserFeedbacks = async (): Promise<Feedback[]> => {
    const response = await api.get('/feedbacks/message-histories');
    return response.data.data || [];
};

// Get chat history for a specific feedback
const getChatHistory = async (feedbackId: number): Promise<FeedbackMessage[]> => {
    const response = await api.get(`/feedbacks/chat-histories/${feedbackId}`);
    return response.data.data || [];
};

// Create new feedback ticket
const createFeedback = async (data: { topic: string; description: string }): Promise<Feedback> => {
    // Get userID from localStorage
    const userStr = localStorage.getItem('user');
    let userID: number | null = null;
    if (userStr) {
        try {
            const decoded = JSON.parse(decodeURIComponent(atob(userStr)));
            userID = decoded.userID || decoded.user_ID;
        } catch (e) {
            console.error('Error getting userID:', e);
        }
    }

    const requestBody = {
        UserID: userID,
        Topic: data.topic,
        Description: data.description,
        Status: 'Pending',
        CreatedAt: new Date().toISOString(),
        IsDeleted: false
    };

    const response = await api.post('/feedbacks', requestBody);

    // API returns { success, message, id } - construct Feedback object
    const result = response.data;

    // Handle response: API returns { id } or { data: Feedback }
    if (result.id) {
        // API returned just the ID, construct the Feedback object
        return {
            feedbackID: result.id,
            userID: userID || 0,
            topic: data.topic,
            description: data.description,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            isDeleted: false
        };
    }

    // If API returns full data object
    return result.data || result;
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
        return userId ? Number(userId) : null;
    } catch (error) {
        console.error('Error getting user ID:', error);
        return null;
    }
};

const getCurrentUserName = (): string => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return 'User';
    try {
        const decoded = JSON.parse(decodeURIComponent(atob(userStr)));
        return decoded.fullName || decoded.email || 'User';
    } catch {
        return 'User';
    }
};

const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const getStatusInfo = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'PENDING':
        case 'OPEN': return { color: 'text-orange-600 bg-orange-100', label: 'Chờ xử lý', icon: <Clock className="h-3 w-3" /> };
        case 'IN PROGRESS': return { color: 'text-blue-600 bg-blue-100', label: 'Đang xử lý', icon: <MessageSquare className="h-3 w-3" /> };
        case 'COMPLETED':
        case 'RESOLVED': return { color: 'text-green-600 bg-green-100', label: 'Hoàn thành', icon: <CheckCircle className="h-3 w-3" /> };
        default: return { color: 'text-gray-600 bg-gray-100', label: status, icon: null };
    }
};

// ==================== Main Component ====================

export default function UserFeedbackPage() {
    const queryClient = useQueryClient();
    const currentUserId = getCurrentUserId();
    const currentUserName = getCurrentUserName();

    // State
    const [step, setStep] = useState<'list' | 'create' | 'chat'>('list');
    const [selectedTicket, setSelectedTicket] = useState<Feedback | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [topic, setTopic] = useState(TOPIC_OPTIONS[0].value); // Default to first option
    const [description, setDescription] = useState('');
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fetch user's feedbacks
    const { data: feedbacks = [], isLoading, refetch } = useQuery<Feedback[]>({
        queryKey: ['user-feedbacks'],
        queryFn: getUserFeedbacks,
    });

    // Filter and sort feedbacks: newest first + status filter
    const filteredFeedbacks = feedbacks
        .filter(ticket => {
            if (statusFilter === 'all') return true;
            const status = ticket.status?.toUpperCase();
            if (statusFilter === 'pending') {
                return status === 'PENDING' || status === 'OPEN' || status === 'IN PROGRESS';
            }
            if (statusFilter === 'completed') {
                return status === 'COMPLETED' || status === 'RESOLVED';
            }
            return true;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Create feedback mutation
    const createMutation = useMutation({
        mutationFn: createFeedback,
        onSuccess: (newFeedback) => {
            queryClient.invalidateQueries({ queryKey: ['user-feedbacks'] });
            joinTicket(newFeedback);
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || 'Không thể tạo yêu cầu hỗ trợ');
        }
    });

    // Initialize SignalR connection
    const initSignalR = useCallback(async () => {
        const token = getAccessToken();
        if (!token) {
            console.warn('⚠️ No token available for SignalR');
            setConnectionStatus('error');
            return;
        }

        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://localhost:7012';
        const hubUrl = `${baseUrl}/chatHub`;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => token,
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .configureLogging(signalR.LogLevel.Information)
            .build();

        setConnection(newConnection);
        setConnectionStatus('connecting');

        try {
            await newConnection.start();
            setConnectionStatus('connected');

            // Listen for messages
            newConnection.on('ReceiveMessage', (user: string, message: string, time: string) => {
                // Check if message is from current user by comparing username
                const isMe = user === currentUserName || user === 'Bạn';
                const msg: ChatMessage = { user, message, time, isMe };
                setMessages(prev => {
                    const updated = [...prev, msg];
                    return updated.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
                });
            });

            // Listen for status changes
            newConnection.on('ReceiveTicketStatusChange', (status: string) => {
                setSelectedTicket(prev => prev ? { ...prev, status } : null);
                queryClient.invalidateQueries({ queryKey: ['user-feedbacks'] });
            });

            // Listen for errors
            newConnection.on('ReceiveError', (error: string) => {
                console.error('❌ SignalR Error:', error);
            });

        } catch (error) {
            console.error('❌ SignalR Connection failed:', error);
            setConnectionStatus('error');
        }
    }, [queryClient]);

    // Initialize SignalR on mount
    useEffect(() => {
        initSignalR();
        return () => {
            if (connection) {
                connection.stop();
            }
        };
    }, []);

    // Join ticket room and load history
    const joinTicket = async (ticket: Feedback) => {
        setMessages([]);
        setSelectedTicket(ticket);
        setStep('chat');

        // Fetch chat history
        try {
            const history = await getChatHistory(ticket.feedbackID);

            const formattedHistory: ChatMessage[] = history
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map(h => {
                    // Ensure numeric comparison
                    const senderId = Number(h.senderID);
                    const myId = Number(currentUserId);
                    const isMe = senderId === myId;
                    return {
                        user: isMe ? currentUserName : 'Staff',
                        message: h.content,
                        time: h.createdAt,
                        isMe: isMe // Store this flag for rendering
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
            } catch (error) {
                console.error('Error joining room:', error);
            }
        }
    };

    // Send message
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedTicket || !connection) return;

        if (connection.state !== signalR.HubConnectionState.Connected) {
            alert('Chưa kết nối. Vui lòng thử lại sau.');
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

    // Create new ticket
    const handleCreateTicket = (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim() || !description.trim()) return;
        createMutation.mutate({ topic: topic.trim(), description: description.trim() });
    };

    // ==================== Render ====================

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Đang tải...</p>
                </div>
            </div>
        );
    }

    // Create ticket form
    if (step === 'create') {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <MessageSquare className="h-6 w-6" />
                            Tạo yêu cầu hỗ trợ mới
                        </h2>
                    </div>
                    <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chủ đề</label>
                            <select
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                                required
                            >
                                {TOPIC_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Mô tả vấn đề của bạn..."
                                rows={4}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                                required
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setStep('list'); setTopic(TOPIC_OPTIONS[0].value); setDescription(''); }}
                                className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {createMutation.isPending ? 'Đang tạo...' : 'Gửi yêu cầu'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Chat view
    if (step === 'chat' && selectedTicket) {
        const statusInfo = getStatusInfo(selectedTicket.status);
        const isCompleted = selectedTicket.status?.toUpperCase() === 'COMPLETED' || selectedTicket.status?.toUpperCase() === 'RESOLVED';

        return (
            <div className="h-[calc(100vh-6rem)] flex flex-col bg-white rounded-xl shadow-lg overflow-hidden mx-4 my-2">
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50">
                    <button
                        onClick={() => { setStep('list'); setSelectedTicket(null); }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">#{selectedTicket.feedbackID} - {selectedTicket.topic}</h3>
                        <p className="text-sm text-gray-500">{selectedTicket.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color} flex items-center gap-1`}>
                        {statusInfo.icon} {statusInfo.label}
                    </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((msg, idx) => {
                        // Use isMe flag if available, otherwise fallback to user name comparison
                        const isMe = msg.isMe !== undefined ? msg.isMe : (msg.user === currentUserName || msg.user === 'Bạn');
                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white text-gray-800 rounded-bl-md border'}`}>
                                    <div className={`text-xs mb-1 font-medium ${isMe ? 'text-blue-200' : 'text-gray-500'}`}>{isMe ? 'Bạn' : msg.user}</div>
                                    <p className="break-words">{msg.message}</p>
                                    <div className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>{formatDateTime(msg.time)}</div>
                                </div>
                            </div>
                        );
                    })}
                    {messages.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <MessageSquare className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                            <p>Chưa có tin nhắn nào</p>
                            <p className="text-sm text-gray-400 mt-1">Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {isCompleted ? (
                    <div className="p-4 border-t bg-gray-50 text-center text-gray-500 italic">
                        <CheckCircle className="h-5 w-5 inline mr-2 text-green-500" />
                        Yêu cầu này đã được giải quyết
                    </div>
                ) : (
                    <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="p-4 border-t flex gap-2 bg-white">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || connectionStatus !== 'connected'}
                            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                )}
            </div>
        );
    }

    // Ticket list
    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <MessageSquare className="h-6 w-6" />
                                Hỗ trợ trực tuyến
                            </h2>
                            <p className="text-blue-100 text-sm mt-1">Liên hệ với đội ngũ hỗ trợ của chúng tôi</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`}></span>
                            <span className="text-xs text-blue-100">{connectionStatus === 'connected' ? 'Đã kết nối' : connectionStatus === 'connecting' ? 'Đang kết nối...' : 'Chưa kết nối'}</span>
                        </div>
                    </div>
                </div>

                {/* Create new button + Status Filter */}
                <div className="p-4 border-b bg-gray-50 space-y-3">
                    <button
                        onClick={() => setStep('create')}
                        className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Tạo yêu cầu hỗ trợ mới
                    </button>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Lọc:</span>
                        <div className="flex gap-2">
                            {STATUS_FILTER_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setStatusFilter(opt.value as any)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${statusFilter === opt.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <span className="ml-auto text-xs text-gray-400">
                            {filteredFeedbacks.length} yêu cầu
                        </span>
                    </div>
                </div>

                {/* Ticket list */}
                <div className="divide-y max-h-[60vh] overflow-y-auto">
                    {filteredFeedbacks.map((ticket) => {
                        const statusInfo = getStatusInfo(ticket.status);
                        return (
                            <div
                                key={ticket.feedbackID}
                                onClick={() => joinTicket(ticket)}
                                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-800 truncate">
                                            #{ticket.feedbackID} - {ticket.topic}
                                        </div>
                                        {ticket.description && (
                                            <p className="text-sm text-gray-500 truncate mt-0.5">{ticket.description}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">{formatDateTime(ticket.createdAt)}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} flex items-center gap-1 whitespace-nowrap`}>
                                        {statusInfo.icon} {statusInfo.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {filteredFeedbacks.length === 0 && feedbacks.length > 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <Filter className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>Không có yêu cầu nào với bộ lọc này</p>
                            <button
                                onClick={() => setStatusFilter('all')}
                                className="text-sm text-blue-600 mt-2 hover:underline"
                            >
                                Xem tất cả
                            </button>
                        </div>
                    )}

                    {feedbacks.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>Bạn chưa có yêu cầu hỗ trợ nào</p>
                            <p className="text-sm text-gray-400 mt-1">Nhấn nút bên trên để tạo yêu cầu mới</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
