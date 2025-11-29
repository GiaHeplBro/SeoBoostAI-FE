// TypeScript interfaces for Wallet feature

export interface Transaction {
    transactionID: number;
    walletID: number;
    money: number;
    gatewayTransactionId: string;
    bankTransId: string | null;
    paymentMethod: string;
    type: 'DEPOSIT' | 'PURCHASE' | 'WITHDRAWAL';
    description: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELED' | 'FAILED';
    requestTime: string;
    completedTime: string | null;
    isDeleted: boolean;
}

export interface WalletUser {
    userID: number;
    fullName: string | null;
    email: string;
    role: string;
    avatar: string | null;
}

export interface WalletResponse {
    walletID: number;
    userID: number;
    currency: number; // Balance in VND
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    transactions: Transaction[];
    user: WalletUser;
}
