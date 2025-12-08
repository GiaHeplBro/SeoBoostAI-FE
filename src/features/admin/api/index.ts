// Admin Feature API
import api from '@/axiosInstance';
import type {
    User,
    AdminDashboard,
    Transaction,
    Feedback,
    SystemConfig,
    DashboardOverview,
    RevenueChartItem,
    RevenueChartType,
    GeminiKeyUsageResponse,
    GeminiKeyUsage
} from '../types';

// ==================== Request Types ====================
export interface UpdateUserRoleRequest {
    role: string;
}

export interface BanUserRequest {
    isBanned: boolean;
    reason?: string;
}

export interface UpdateWalletBalanceRequest {
    amount: number;
    description: string;
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

// Dashboard Overview - GET /api/admin/dashboard/overview
export const getDashboardOverview = async (): Promise<DashboardOverview> => {
    const response = await api.get('/admin/dashboard/overview');
    return response.data;
};

// Revenue Chart - GET /api/admin/dashboard/revenue-chart?type=week|month|year
export const getRevenueChart = async (type: RevenueChartType = 'week'): Promise<RevenueChartItem[]> => {
    const response = await api.get('/admin/dashboard/revenue-chart', { params: { type } });
    return response.data;
};

// Gemini Keys Usage Stats - GET /api/gemini-keys/usage-stats
export const getGeminiKeysUsage = async (): Promise<GeminiKeyUsage[]> => {
    const response = await api.get('/gemini-keys/usage-stats');
    // Extract the 'result' from each item in the response
    const data: GeminiKeyUsageResponse[] = response.data;
    return data.map((item) => item.result).filter(Boolean);
};

// Legacy Dashboard (kept for compatibility)
export const getDashboard = async (): Promise<AdminDashboard> => {
    const response = await api.get('/admin/dashboard');
    return response.data;
};

// User Management

// GET /api/users/filter - Get users with filters and pagination
import type { UserFilterRequest, UserFilterResponse } from '../types';

export const getUsersFilter = async (filters: UserFilterRequest): Promise<UserFilterResponse> => {
    const params: Record<string, any> = {
        CurrentPage: filters.CurrentPage,
        PageSize: filters.PageSize,
    };
    // Only include Role if it's set
    if (filters.Role) {
        params.Role = filters.Role;
    }
    // Only include IsBanned if it's explicitly set (not undefined)
    if (filters.IsBanned !== undefined) {
        params.IsBanned = filters.IsBanned;
    }
    // Only include IsDeleted if it's explicitly set (not undefined)
    if (filters.IsDeleted !== undefined) {
        params.IsDeleted = filters.IsDeleted;
    }
    const response = await api.get('/users/filter', { params });
    return response.data;
};

// GET /api/users/{userId} - Get user details
export const getUserById = async (userId: number): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data.data; // API returns { success, message, data: User }
};

// PUT /api/users/update-role/{id} - Promote Member to Staff
export const promoteToStaff = async (userId: number): Promise<User> => {
    const response = await api.put(`/users/update-role/${userId}`);
    return response.data.data; // API returns { success, message, data: User }
};

// PUT /api/users/ban-unban-user - Toggle ban/unban user (send [userId])
export const toggleBanUser = async (userId: number): Promise<User> => {
    const response = await api.put('/users/ban-unban-user', [userId]);
    return response.data.data[0]; // API returns { success, message, data: [User] }
};

// Legacy functions (kept for compatibility)
export const getAllUsers = async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data?.items || response.data || [];
};

export const updateUserRole = async (userId: number, data: UpdateUserRoleRequest) => {
    const response = await api.put(`/users/${userId}/role`, data);
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

export const deleteUser = async (userId: number) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
};

export const updateWalletBalance = async (userId: number, data: UpdateWalletBalanceRequest) => {
    const response = await api.put(`/wallets/user/${userId}/balance`, data);
    return response.data;
};

export const createUser = async (data: { Email: string; FullName: string; Role: string }) => {
    const response = await api.post('/users', data);
    return response.data;
};

// Transaction Management

import type { TransactionListResponse, AdminDepositRequest, AdminDepositResponse } from '../types';

// GET /api/transactions/{currentPage}/{pageSize} - Get all transactions with pagination
export const getTransactionsPaginated = async (currentPage: number = 1, pageSize: number = 10): Promise<TransactionListResponse> => {
    const response = await api.get(`/transactions/${currentPage}/${pageSize}`);
    return response.data;
};

// GET /api/transactions/{id} - Get transaction details by ID
export const getTransactionById = async (transactionId: number): Promise<Transaction> => {
    const response = await api.get(`/transactions/${transactionId}`);
    return response.data;
};

// POST /api/transactions/admin-deposit - Admin deposit money to user
export const adminDeposit = async (data: AdminDepositRequest): Promise<AdminDepositResponse> => {
    const response = await api.post('/transactions/admin-deposit', data);
    return response.data;
};

// Legacy function (kept for compatibility)
export const getTransactions = async (limit: number = 50): Promise<Transaction[]> => {
    const response = await api.get('/transactions', { params: { limit } });
    return response.data?.items || response.data || [];
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

// System Config
export const getSystemConfigs = async (): Promise<SystemConfig[]> => {
    const response = await api.get('/system-configs');
    return response.data?.items || response.data || [];
};

export const updateSystemConfig = async (key: string, value: string) => {
    const response = await api.put(`/system-configs/${key}`, { settingValue: value });
    return response.data;
};
