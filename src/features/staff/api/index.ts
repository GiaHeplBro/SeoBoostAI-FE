// Staff Feature API
import api from '@/axiosInstance';
import type { User, StaffDashboard, Feedback, FeedbackListResponse, FeedbackMessage, UserDetails, UserFilterRequest, UserFilterResponse } from '../types';

// ==================== Request Types ====================
export interface BanUserRequest {
    isBanned: boolean;
    reason?: string;
}

export interface FeedbackFilterRequest {
    currentPage?: number;
    pageSize?: number;
    status?: string;
    email?: string;
    sortBy?: string;
}

export interface FeedbackReplyRequest {
    content: string;
}

// ==================== API Functions ====================

// Dashboard
export const getStaffDashboard = async (): Promise<StaffDashboard> => {
    const response = await api.get('/staff/dashboard');
    return response.data;
};

// User Management with Filters (for Staff - only shows Members)
export const getUsersFilter = async (filters: UserFilterRequest): Promise<UserFilterResponse> => {
    const params: Record<string, any> = {
        CurrentPage: filters.CurrentPage,
        PageSize: filters.PageSize,
        Role: 'Member', // Staff can only see Members
    };
    if (filters.IsBanned !== undefined) {
        params.IsBanned = filters.IsBanned;
    }
    if (filters.IsDeleted !== undefined) {
        params.IsDeleted = filters.IsDeleted;
    }
    const response = await api.get('/users/filter', { params });
    return response.data;
};

export const getUserById = async (userId: number): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data.data; // API returns { success, message, data: User }
};

// PUT /api/users/ban-unban-user - Toggle ban/unban user (send [userId])
export const toggleBanUser = async (userId: number): Promise<User> => {
    const response = await api.put('/users/ban-unban-user', [userId]);
    return response.data.data[0]; // API returns { success, message, data: [User] }
};

// Legacy User Management (Members only)
export const getAllMembers = async (): Promise<User[]> => {
    const response = await api.get('/users');
    const users = response.data?.items || response.data || [];
    return users.filter((u: User) => u.role === 'Member');
};

export const getUserDetails = async (userId: number): Promise<UserDetails> => {
    const response = await api.get(`/users/${userId}/details`);
    return response.data;
};

export const banUser = async (userId: number, data: BanUserRequest) => {
    const response = await api.put(`/users/${userId}/ban`, data);
    return response.data;
};

export const unbanUser = async (userId: number) => {
    const response = await api.put(`/users/${userId}/unban`);
    return response.data;
};

// Feedback Management


// GET /api/feedbacks/{currentPage}/{pageSize} - Get paginated feedbacks (Staff)
export const getFeedbacksPaginated = async (currentPage: number = 1, pageSize: number = 10): Promise<FeedbackListResponse> => {
    const response = await api.get(`/feedbacks/${currentPage}/${pageSize}`);
    return response.data.data; // Response: { success, message, data: FeedbackListResponse }
};

// GET /api/feedbacks/chat-histories/{feedbackId} - Get chat history for a feedback
export const getChatHistory = async (feedbackId: number): Promise<FeedbackMessage[]> => {
    const response = await api.get(`/feedbacks/chat-histories/${feedbackId}`);
    return response.data.data || []; // Response: { success, message, data: FeedbackMessage[] }
};

// PUT /api/feedbacks - Update feedback (e.g., change status to Completed)
export const updateFeedback = async (feedback: Partial<Feedback>): Promise<Feedback> => {
    const response = await api.put('/feedbacks', feedback);
    return response.data.data || response.data;
};

// Legacy (kept for compatibility)
export const getFeedbacks = async (filters?: FeedbackFilterRequest): Promise<Feedback[]> => {
    const response = await api.get('/feedbacks', { params: filters });
    return response.data?.items || response.data || [];
};

export const addFeedbackReply = async (feedbackId: number, data: FeedbackReplyRequest) => {
    const response = await api.post(`/feedbacks/${feedbackId}/messages`, data);
    return response.data;
};

export const updateFeedbackStatus = async (feedbackId: number, status: string) => {
    const response = await api.put(`/feedbacks/${feedbackId}/status`, { status });
    return response.data;
};

// Transaction Management (Staff - no deposit)
import type { Transaction, TransactionListResponse } from '../types';

// GET /api/transactions/{currentPage}/{pageSize} - Get all transactions with pagination
export const getTransactionsPaginated = async (currentPage: number = 1, pageSize: number = 10): Promise<TransactionListResponse> => {
    const response = await api.get(`/transactions/${currentPage}/${pageSize}`);
    return response.data;
};

// GET /api/transactions/{id} - Get transaction by ID
export const getTransactionById = async (transactionId: number): Promise<Transaction> => {
    const response = await api.get(`/transactions/${transactionId}`);
    return response.data;
};
