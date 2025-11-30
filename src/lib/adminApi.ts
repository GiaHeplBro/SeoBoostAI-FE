import api from '@/axiosInstance';

// ==================== TYPES ====================

export interface UpdateUserRoleRequest {
    role: string; // "Member", "Staff", "Admin"
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
    status?: string; // "Activity", "Close", "Both"
    email?: string;
    sortBy?: string; // "newest", "oldest"
}

export interface FeedbackReplyRequest {
    content: string;
}

export interface UpdateFeedbackStatusRequest {
    status: string; // "Activity", "Close"
}

// Response types
export interface UserDetailWithStats {
    userID: number;
    fullName: string;
    email: string;
    role: string;
    isBanned: boolean;
    walletBalance: number;
    featureUsageStats: Record<string, number>;
    createdAt?: string;
}

export interface AdminDashboard {
    totalUsers: number;
    totalMembers: number;
    totalStaff: number;
    totalAdmins: number;
    bannedUsers: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalTransactions: number;
    pendingTransactions: number;
    totalFeedbacks: number;
    activeFeedbacks: number;
    featureUsageStats: Record<string, number>;
}

export interface TransactionHistory {
    transactionID: number;
    userID: number;
    userEmail: string;
    userName: string;
    money: number;
    type: string;
    description: string;
    status: string;
    requestTime: string;
    completedTime?: string;
}

export interface PurchasedFeatureHistory {
    purchasedFeatureID: number;
    featureName: string;
    totalQuantity: number;
    remainingQuantity: number;
    price: number;
    purchaseDate: string;
}

export interface FeedbackMessage {
    messageID: number;
    senderName: string;
    senderRole: string;
    content: string;
    createdAt: string;
}

export interface FeedbackWithMessages {
    feedbackID: number;
    userEmail: string;
    userName: string;
    topic: string;
    status: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    messages: FeedbackMessage[];
}

// ==================== ADMIN APIs ====================

export const adminApi = {
    // User Management
    getAllUsers: async () => {
        const response = await api.get('/users/filter', {
            params: {
                CurrentPage: 1,
                PageSize: 100, // Lấy nhiều users
                Role: null,
                IsBanned: null,
                IsDeleted: false
            }
        });
        return response.data.data.items || [];
    },

    updateUserRole: async (userId: number, data: UpdateUserRoleRequest) => {
        const response = await api.put(`/users/${userId}/role`, data);
        return response.data;
    },

    banUser: async (userId: number, data: BanUserRequest) => {
        const response = await api.put(`/users/${userId}/ban`, data);
        return response.data;
    },

    unbanUser: async (userId: number) => {
        const response = await api.put(`/users/${userId}/ban`, { isBanned: false });
        return response.data;
    },

    deleteUser: async (userId: number) => {
        const response = await api.delete(`/users/${userId}/soft`);
        return response.data;
    },

    updateWalletBalance: async (userId: number, data: UpdateWalletBalanceRequest) => {
        const response = await api.put(`/wallets/user/${userId}/balance`, data);
        return response.data;
    },

    // Quota Management
    updateUserQuota: async (userId: number, data: { FeatureID: number; UsageCount: number; MonthlyLimit: number }) => {
        const response = await api.put(`/users/${userId}/quota`, data);
        return response.data;
    },

    // Create User
    createUser: async (data: { Email: string; FullName: string; Role: string }) => {
        const response = await api.post('/users/create', data);
        return response.data;
    },

    // Dashboard
    getDashboard: async (): Promise<AdminDashboard> => {
        const response = await api.get('/users/admin/dashboard');
        return response.data.data;
    },

    getRecentTransactions: async (limit: number = 10): Promise<TransactionHistory[]> => {
        const response = await api.get('/transactions/admin/recent', {
            params: { limit }
        });
        return response.data.data || [];
    },
};

// ==================== STAFF APIs ====================

export const staffApi = {
    // User Info
    getUserWithStats: async (userId: number): Promise<UserDetailWithStats> => {
        const response = await api.get(`/users/${userId}/stats`);
        return response.data.data;
    },

    getAllUsers: async () => {
        const response = await api.get('/users/filter', {
            params: {
                CurrentPage: 1,
                PageSize: 1000,
                Role: null,
                IsBanned: null,
                IsDeleted: false
            }
        });
        return response.data.data?.items || [];
    },

    // Transaction History
    getUserTransactionHistory: async (userId: number, type?: string): Promise<TransactionHistory[]> => {
        const params = type ? `?type=${type}` : '';
        const response = await api.get(`/transactions/user/${userId}/history${params}`);
        return response.data.data;
    },

    // Purchase History
    getUserPurchaseHistory: async (userId: number): Promise<PurchasedFeatureHistory[]> => {
        const response = await api.get(`/purchased-features/user/${userId}/history`);
        return response.data.data;
    },

    // Ban/Unban
    banUser: async (userId: number, data: BanUserRequest) => {
        const response = await api.put(`/users/${userId}/ban`, data);
        return response.data;
    },
    unbanUser: async (userId: number) => {
        const response = await api.put(`/users/${userId}/ban`, { isBanned: false });
        return response.data;
    },

    // Feedback Management
    getFeedbacksWithFilters: async (filters: FeedbackFilterRequest): Promise<FeedbackWithMessages[]> => {
        const params = new URLSearchParams();
        if (filters.currentPage) params.append('currentPage', filters.currentPage.toString());
        if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
        if (filters.status) params.append('status', filters.status);
        if (filters.email) params.append('email', filters.email);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);

        const response = await api.get(`/feedbacks/staff/filter?${params.toString()}`);
        return response.data.data;
    },

    addFeedbackReply: async (feedbackId: number, data: FeedbackReplyRequest) => {
        const response = await api.post(`/feedbacks/${feedbackId}/reply`, data);
        return response.data;
    },

    updateFeedbackStatus: async (feedbackId: number, data: UpdateFeedbackStatusRequest) => {
        const response = await api.put(`/feedbacks/${feedbackId}/status`, data);
        return response.data;
    },
};

// ==================== COMMON APIs ====================

export const usersApi = {
    getUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    getUsersWithFilter: async (params: {
        currentPage: number;
        pageSize: number;
        role?: string;
        isBanned?: boolean;
        isDeleted?: boolean;
    }) => {
        const queryParams = new URLSearchParams();
        queryParams.append('currentPage', params.currentPage.toString());
        queryParams.append('pageSize', params.pageSize.toString());
        if (params.role) queryParams.append('role', params.role);
        if (params.isBanned !== undefined) queryParams.append('isBanned', params.isBanned.toString());
        if (params.isDeleted !== undefined) queryParams.append('isDeleted', params.isDeleted.toString());

        const response = await api.get(`/users/filter?${queryParams.toString()}`);
        return response.data;
    },
};

export const feedbacksApi = {
    getFeedbacks: async () => {
        const response = await api.get('/feedbacks');
        return response.data;
    },

    getFeedbackById: async (id: number) => {
        const response = await api.get(`/feedbacks/${id}`);
        return response.data;
    },
};
