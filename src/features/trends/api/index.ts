// API functions for Trends/Keyword Analysis feature

import api from '@/axiosInstance';
import type { AnalysisRequest, AnalysisResponse, KeywordData, QueryHistoryResponse } from '../types';

/**
 * Analyze keyword trends - LONG RUNNING (1-4 minutes)
 * POST /api/trends/analyze
 * userId obtained from JWT token in backend
 */
export const analyzeTrend = async (request: AnalysisRequest): Promise<AnalysisResponse> => {
    const { data } = await api.post('/trends/analyze', request, {
        timeout: 300000 // 5 minutes timeout for long-running operation
    });
    return data;
};

/**
 * Get keyword suggestions for analysis
 * GET /api/trends/show-keywords/{historyId}
 */
export const fetchKeywords = async (
    historyId: number,
    onlySuggestions: boolean
): Promise<KeywordData[]> => {
    const { data } = await api.get(`/trends/show-keywords/${historyId}`, {
        params: { onlySuggestions }
    });
    return data;
};

/**
 * Get query history with pagination
 * GET /api/query-histories
 * userId obtained from JWT token in backend
 */
export const fetchQueryHistory = async (
    currentPage: number = 1,
    pageSize: number = 10
): Promise<QueryHistoryResponse> => {
    const { data } = await api.get('/query-histories', {
        params: {
            CurrentPage: currentPage,
            PageSize: pageSize
        }
    });
    return data;
};
