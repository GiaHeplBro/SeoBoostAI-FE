// API functions for SEO Audit feature

import api from '@/axiosInstance';
import type {
    PerformanceHistoryPayload,
    UpdatePerformanceHistoryPayload,
    PerformanceHistoryResponse,
    PerformanceHistoryListResponse,
    ElementSuggestion,
    HistoryItem,
    AnalysisResultResponse
} from '../types';

// API 1: Phân tích URL (POST) - userId từ token
export const analyzeWebsite = async (payload: PerformanceHistoryPayload): Promise<PerformanceHistoryResponse> => {
    const { data } = await api.post('/performance-histories', payload);
    return data;
};

// API UPDATE: Chạy lại phân tích (PUT) - userId từ token
export const updateWebsiteAnalysis = async (payload: UpdatePerformanceHistoryPayload): Promise<PerformanceHistoryResponse> => {
    const { data } = await api.put('/performance-histories', payload);
    return data;
};

// API 2: Tải Element đã có (GET)
export const fetchExistingElements = async (analysisCacheID: number): Promise<ElementSuggestion[]> => {
    const { data } = await api.get(`/elements/analysis/${analysisCacheID}`);
    return data.data; // Extract data from wrapper
};

// API 3: Tạo mới Element (POST) - actually GET with suggestions
// API 3: Tạo mới Element (POST) - actually GET with suggestions
// Correct endpoint for Deep Dive Analysis
export const generateDeepDiveAnalysis = async (analysisCacheID: number): Promise<ElementSuggestion[]> => {
    const { data } = await api.get(`/elements/suggestion/${analysisCacheID}`);
    return data.data; // Extract data from wrapper
};

// API 4: Lấy lịch sử (GET List) - userId từ token, có pagination
export const fetchPerformanceHistory = async (currentPage: number = 1, pageSize: number = 20): Promise<PerformanceHistoryListResponse> => {
    try {
        const { data } = await api.get(`/performance-histories`, {
            params: {
                CurrentPage: currentPage,
                PageSize: pageSize
            }
        });
        return data;
    } catch (error) {
        console.error("Lỗi khi tải lịch sử:", error);
        // Return empty response structure
        return {
            success: false,
            message: "Failed to fetch history",
            data: {
                totalItems: 0,
                totalPages: 0,
                currentPage: 1,
                pageSize: pageSize,
                items: []
            }
        };
    }
};

// API 5: Lấy 1 báo cáo (GET by ID)
export const fetchSingleReport = async (id: number): Promise<PerformanceHistoryResponse> => {
    const { data } = await api.get(`/performance-histories/${id}`);
    return data;
};

// API 6: Lấy kết quả so sánh (GET)
export const fetchComparisonResult = async (analysisCacheId: number): Promise<AnalysisResultResponse> => {
    const { data } = await api.get(`/analysis-cache/result/${analysisCacheId}`);
    return data;
};
