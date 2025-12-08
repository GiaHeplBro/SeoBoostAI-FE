// Staff Feature API
import api from '@/axiosInstance';
import type { User, StaffDashboard, Feedback, UserDetails } from '../types';

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

// User Management (Members only)
export const getAllMembers = async (): Promise<User[]> => {
    const response = await api.get('/users');
    const users = response.data?.items || response.data || [];
    // Filter only Members for Staff view
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
