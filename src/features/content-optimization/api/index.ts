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
 * POST /api/content-optimizations
 * userId is obtained from JWT token in backend
 */
export const createContentOptimization = async (
    payload: ContentOptimizationPayload
): Promise<ContentOptimizationResponse> => {
    const { data } = await api.post('/content-optimizations', payload);
    return data;
};

/**
 * Search optimization history with pagination
 * GET /api/content-optimizations/Search
 * userId is obtained from JWT token in backend
 */
export const searchOptimizationHistory = async (
    params: SearchHistoryParams
): Promise<SearchHistoryResponse> => {
    const { data } = await api.get('/content-optimizations/Search', {
        params: {
            Keyword: params.keyword,
            CreatedAt: params.createdAt,
            CurrentPage: params.currentPage,
            PageSize: params.pageSize
        }
    });
    return data;
};
