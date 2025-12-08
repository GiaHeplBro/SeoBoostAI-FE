// TypeScript interfaces for Wallet feature

export interface Transaction {
    transactionID: number;
    userID: number;
    money: number;
    gatewayTransactionId: string | null;
    bankTransId: string | null;
    paymentMethod: string;
    type: 'DEPOSIT' | 'PURCHASE' | 'WITHDRAWAL';
    description: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELED' | 'FAILED';
    requestTime: string;
    completedTime: string | null;
    isDeleted: boolean;
    balanceAfter: number | null;
    purchasedFeatures?: any[];
    user?: any;
}

export interface User {
    userID: number;
    userName: string;
    fullName: string | null;
    email: string;
    role: string;
    avatar: string | null;
    googleID: string | null;
    currency: number;
    createdAt: string;
    updatedAt: string;
    isBanned: boolean;
    isDeleted: boolean;
    // Add other fields as needed based on the JSON response, mapped as optional if uncertain
    contentOptimizations?: any[];
    feedbackMessages?: any[];
    feedbacks?: any[];
    performanceHistories?: any[];
    queryHistories?: any[];
    transactions?: Transaction[];
    userMonthlyFreeQuota?: any[];
}

export interface PaginatedTransactionResponse {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    items: Transaction[];
}
