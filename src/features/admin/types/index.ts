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
    messageID?: number;
    senderID?: number;
    senderName?: string;
    senderRole?: string;
    content?: string;
    message?: string; // Alternative field name from chat history API
    createdAt: string;
}

export interface Feedback {
    feedbackID: number;
    userID: number;
    userEmail?: string;
    userName?: string;
    topic: string;
    status: string; // 'PENDING' | 'Open' | 'In Progress' | 'COMPLETED' | 'Resolved' | 'Closed'
    description?: string;
    createdAt: string;
    updatedAt?: string;
    isDeleted?: boolean;
    messages?: FeedbackMessage[];
    user?: {
        userID: number;
        fullName: string;
        email: string;
    } | null;
}

// Response from /api/feedbacks/{currentPage}/{pageSize}
export interface FeedbackListResponse {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    items: Feedback[];
}

// System Settings/Config

// Response from GET /api/admin-settings
export interface AdminSettingsResponse {
    success: boolean;
    message: string;
    data: Record<string, string>; // key-value pairs
}

// Single setting item from GET /api/admin-settings/{featureId}
export interface AdminSetting {
    settingID: number;
    settingKey: string;
    settingValue: string;
    description?: string | null;
    lastUpdatedDate: string;
    featureID: number;
    feature?: any | null;
}

// Response from GET /api/admin-settings/{featureId}
export interface SettingsByFeatureResponse {
    success: boolean;
    message: string;
    data: AdminSetting[];
}

// Request for PUT /api/admin-settings
export interface UpdateSettingRequest {
    key: string;
    value: string;
    featureID: number;
}

// Feature from GET /api/features
export interface Feature {
    featureID: number;
    name: string;
    price: number;
    description: string;
    benefits: string[];
}

// Feature Information (benefits detail)
export interface FeatureInformation {
    informationID: number;
    featureID: number;
    informationFeature: string;
    createdAt: string;
    updatedAt?: string | null;
    feature?: any | null;
}

// Detailed Feature from GET /api/features/{currentPage}/{pageSize}
export interface FeatureDetailed {
    featureID: number;
    name: string;
    description: string;
    price: number;
    featureInformations: FeatureInformation[];
    purchasedFeatures?: any[];
    systemSettings?: any[];
    userMonthlyFreeQuota?: any[];
}

// Response from GET /api/features/{currentPage}/{pageSize}
export interface FeaturesPaginatedResponse {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    items: FeatureDetailed[];
}

// Request for PUT /api/features/{id}
export interface UpdateFeatureRequest {
    price: number;
    description: string;
}

// Feature Quota from GET /api/user-monthly-free-quotas/quota
export interface FeatureQuota {
    featureId: number;
    featureName: string;
    freeUsage: number;
    freeLimit: number;
    freeRemaining: number;
    paidRemaining: number;
    totalRemaining: number;
}

// Gemini API Key
export interface GeminiKey {
    id: number;
    apiKey: string;
    keyName: string;
    isActive: boolean;
    rpmLimit: number;
    tpmLimit: number;
    rpdLimit: number;
    requestsUsedToday: number;
    tokensUsedToday: number;
    lastResetDate: string;
    rateLimitedUntil: string | null;
    createdAt: string;
    updatedAt: string | null;
}

// Request for POST /api/gemini-keys
export interface CreateGeminiKeyRequest {
    apiKey: string;
    keyName: string;
    isActive: boolean;
    rpmLimit: number;
    tpmLimit: number;
    rpdLimit: number;
}

// Legacy interface (kept for compatibility)
export interface SystemConfig {
    settingKey: string;
    settingValue: string;
    description: string;
}

// Request for POST /api/feature-informations
export interface CreateFeatureInformationRequest {
    featureID: number;
    informationFeature: string;
}

// Request for PUT /api/feature-informations/{id}
export interface UpdateFeatureInformationRequest {
    informationFeature: string;
}

