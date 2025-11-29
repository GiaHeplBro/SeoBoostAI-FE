// API functions for Content Optimization feature

import api from '@/axiosInstance';
import type {
    ContentOptimizationPayload,
    ContentOptimizationResponse,
    SearchHistoryParams,
    SearchHistoryResponse
} from '../types';

/**
 * Create new content optimization
 * POST /content-optimizations
 */
export const createContentOptimization = async (
    payload: ContentOptimizationPayload
): Promise<ContentOptimizationResponse> => {
    const { data } = await api.post('/content-optimizations', payload);
    return data;
};

/**
 * Search optimization history with pagination
 * GET /content-optimizations/Search
 */
export const searchOptimizationHistory = async (
    params: SearchHistoryParams
): Promise<SearchHistoryResponse> => {
    const { data } = await api.get('/content-optimizations/Search', { params });
    return data;
};
