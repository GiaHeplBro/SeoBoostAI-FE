// API functions for Content Optimization feature

import api from '@/axiosInstance';
import type {
    ContentOptimizationPayload,
    ContentOptimizationResponse,
    SearchHistoryParams,
    SearchHistoryResponse
} from '../types';

import {
    READABILITY_LEVELS,
    CONTENT_LENGTH_OPTIONS
} from '../utils/constants';

/**
 * Create new content optimization
 * POST /api/content-optimizations
 * userId is obtained from JWT token in backend
 * Note: Backend C# expects PascalCase field names and STRING for ContentLength/ReadabilityLevel
 */
export const createContentOptimization = async (
    payload: ContentOptimizationPayload
): Promise<ContentOptimizationResponse> => {
    // Transform to PascalCase for C# Backend
    // Backend expects STRING for ContentLength and ReadabilityLevel (not numbers)
    const backendPayload = {
        Keyword: payload.keyword,
        Content: payload.content,
        OptimizationLevel: payload.optimizationLevel,
        ReadabilityLevel: READABILITY_LEVELS[payload.readabilityLevel], // Convert index to string
        ContentLength: CONTENT_LENGTH_OPTIONS[payload.contentLength], // Convert index to string
        FeatureId: payload.featureId
    };
    const { data } = await api.post('/content-optimizations', backendPayload);
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
