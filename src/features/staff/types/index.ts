// Staff Feature Types

export interface User {
    userID: number;
    fullName: string;
    email: string;
    role: 'Admin' | 'Staff' | 'Member';
    createdAt: string;
    isBanned: boolean;
    isDeleted: boolean;
    currency: number;
    avatar?: string;
    googleID?: string;
}

// User Filter for Staff (same as Admin but only for Members)
export interface UserFilterRequest {
    CurrentPage: number;
    PageSize: number;
    Role?: string;
    IsBanned?: boolean;
    IsDeleted?: boolean;
}

export interface UserFilterResponse {
    data: {
        items: User[];
        currentPage: number;
        totalPages: number;
        totalItems: number;
    };
}

export interface StaffDashboard {
    totalMembers: number;
    bannedMembers: number;
    totalFeedbacks: number;
    openFeedbacks: number;
    resolvedFeedbacks: number;
}

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

export interface UserDeposit {
    id: number;
    amount: number;
    method: string;
    status: string;
    time: string;
}

export interface UserPurchase {
    id: number;
    feature: string;
    quantity: number;
    price: number;
    time: string;
}

export interface UserFeatureUsage {
    name: string;
    count: number;
    lastUsed: string;
}

export interface UserDetails {
    deposits: UserDeposit[];
    purchases: UserPurchase[];
    featureUsage: UserFeatureUsage[];
}

// Transaction types
export interface Transaction {
    transactionID: number;
    userID: number;
    type: 'DEPOSIT' | 'PURCHASE';
    money: number;
    description: string;
    paymentMethod: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    balanceAfter: number;
    requestTime: string;
    completedTime?: string;
    gatewayTransactionId?: string;
}

export interface TransactionListResponse {
    items: Transaction[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
}
