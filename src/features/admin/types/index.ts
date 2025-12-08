// Admin Feature Types

// Dashboard Overview from /api/admin/dashboard/overview
export interface DashboardOverview {
    totalRevenue: number;
    todayRevenue: number;
    thisMonthRevenue: number;
}

// Revenue Chart from /api/admin/dashboard/revenue-chart
export interface RevenueChartItem {
    label: string;
    revenue: number;
}

export type RevenueChartType = 'week' | 'month' | 'year';

// Gemini Key Usage from /api/gemini-keys/usage-stats
export interface GeminiKeyUsage {
    id: number;
    apiKey: string;
    keyName: string;
    isActive: boolean;
    rpmUsage: string;
    tpmUsage: string;
    rpdUsage: string;
    rpmPercentage: number;
    tpmPercentage: number;
    rpdPercentage: number;
    lastResetDate: string;
    isRateLimited: boolean;
}

export interface GeminiKeyUsageResponse {
    result: GeminiKeyUsage;
    id: number;
    exception: any;
    status: number;
    isCanceled: boolean;
    isCompleted: boolean;
    isCompletedSuccessfully: boolean;
    creationOptions: number;
    asyncState: any;
    isFaulted: boolean;
}

// User from /api/users/filter and /api/users/{userId}
export interface User {
    userID: number;
    userName: string;
    fullName: string;
    email: string;
    role: 'Admin' | 'Staff' | 'Member';
    avatar?: string;
    googleID?: string;
    createdAt: string;
    updatedAt?: string;
    isBanned: boolean;
    isDeleted: boolean;
    currency: number;
    timeZoneId?: string;
}

// Filter request for /api/users/filter
export interface UserFilterRequest {
    CurrentPage: number;
    PageSize: number;
    Role?: string;        // 'Member' | 'Staff' | empty
    IsBanned?: boolean;   // true | false | undefined (empty)
    IsDeleted?: boolean;  // true | false | undefined (empty)
}

// Response from /api/users/filter
export interface UserFilterResponse {
    success: boolean;
    message: string;
    data: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
        items: User[];
    };
}

// Legacy AdminDashboard (kept for compatibility)
export interface AdminDashboard {
    totalUsers: number;
    totalMembers: number;
    totalStaff: number;
    totalAdmins: number;
    bannedUsers?: number;
    totalRevenue: number;
    monthlyRevenue?: number;
    totalTransactions?: number;
    pendingTransactions?: number;
    totalFeedbacks: number;
    activeFeedbacks: number;
    requestsUsedToday?: number;
    tokensUsedToday?: number;
    featureUsageStats?: Record<string, number>;
}

// Transaction from /api/transactions
export interface Transaction {
    transactionID: number;
    userID: number;
    money: number;
    gatewayTransactionId?: string;
    bankTransId?: string;
    paymentMethod: string;
    type: 'DEPOSIT' | 'PURCHASE' | 'WITHDRAW';
    description?: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    requestTime: string;
    completedTime?: string;
    isDeleted: boolean;
    balanceAfter: number;
    purchasedFeatures?: any[];
    user?: User | null;
}

// Response from /api/transactions/{currentPage}/{pageSize}
export interface TransactionListResponse {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    items: Transaction[];
}

// Request for /api/transactions/admin-deposit
export interface AdminDepositRequest {
    userId: number;
    money: number;
    description: string;
}

// Response from /api/transactions/admin-deposit
export interface AdminDepositResponse {
    message: string;
    newBalance: number;
    transactionId: number;
}

// Feedback
export interface FeedbackMessage {
    messageID: number;
    senderName: string;
    senderRole: string;
    content: string;
    createdAt: string;
}

export interface Feedback {
    feedbackID: number;
    userEmail: string;
    userName?: string;
    topic: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    description?: string;
    createdAt: string;
    updatedAt?: string;
    messages?: FeedbackMessage[];
}

// System Config
export interface SystemConfig {
    settingKey: string;
    settingValue: string;
    description: string;
}
