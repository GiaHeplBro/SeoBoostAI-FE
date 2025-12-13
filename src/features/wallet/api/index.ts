// API functions for Wallet feature

import api from '@/axiosInstance';
import { User, PaginatedTransactionResponse, TransactionReceipt } from '../types';

/**
 * Get current user profile (includes wallet balance)
 * GET /api/users/profile
 */
export const fetchUserProfile = async (): Promise<User> => {
    const { data } = await api.get('/users/profile');
    if (data.success && data.data) {
        return data.data;
    }
    throw new Error(data.message || 'Failed to fetch user profile');
};

/**
 * Get transaction history with pagination
 * GET /api/transactions/{page}/{pageSize}
 */
export const fetchTransactions = async (page: number, pageSize: number): Promise<PaginatedTransactionResponse> => {
    const { data } = await api.get(`/transactions/${page}/${pageSize}`);
    return data;
};

/**
 * Get transaction receipt details
 * GET /api/transactions/{id}/receipt
 */
export const fetchTransactionReceipt = async (transactionId: number): Promise<TransactionReceipt> => {
    const { data } = await api.get(`/transactions/${transactionId}/receipt`);
    return data;
};

/**
 * Create PayOS payment link
 * POST /api/payment/create-payment-link
 */
export const createPaymentLink = async (amount: number): Promise<{ checkoutUrl: string }> => {
    const { data } = await api.post('/payment/create-payment-link', { amount });
    return data;
};
