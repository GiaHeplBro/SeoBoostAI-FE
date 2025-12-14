// TypeScript interfaces for Wallet feature

export interface Transaction {
    transactionId: number;
    amount: number;
    balanceAfter: number;
    description: string;
    status: string;
    paymentDate: string;
    paymentMethod: string;
    gatewayTransactionId: string;
    // Optional/Legacy fields might need review, but keeping strictly to provided JSON for now
    type?: string;
    userID?: number;
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

export interface TransactionReceipt {
    transactionCode: string;
    status: string;
    paymentDate: string;
    payerName: string;
    payerEmail: string;
    paymentMethod: string;
    bankName: string;
    serviceName: string;
    description: string;
    amount: number;
    vatRate: number;
    vatAmount: number;
    totalAmount: number;
}
