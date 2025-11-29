// API functions for Wallet feature

import api from '@/axiosInstance';
import type { WalletResponse } from '../types';

/**
 * Get wallet data for current user
 * GET /api/wallets
 * userId is obtained from JWT token in backend
 */
export const fetchWallet = async (): Promise<WalletResponse> => {
    const { data } = await api.get('/wallets');
    return data;
};
