// API functions for SEO Audit feature

import api from '@/axiosInstance';
import type {
    PerformanceHistoryPayload,
    UpdatePerformanceHistoryPayload,
    PerformanceHistoryResponse,
    ElementSuggestion,
    HistoryItem,
    AnalysisResultResponse
} from '../types';

// API 1: Phân tích URL (POST)
export const analyzeWebsite = async (payload: PerformanceHistoryPayload): Promise<PerformanceHistoryResponse> => {
    const { data } = await api.post('/performance-histories', payload);
    return data;
};

// API UPDATE: Chạy lại phân tích (PUT)
export const updateWebsiteAnalysis = async (payload: UpdatePerformanceHistoryPayload): Promise<PerformanceHistoryResponse> => {
    const { data } = await api.put('/performance-histories', payload);
    return data;
};

// API 2: Tải Element đã có (GET)
export const fetchExistingElements = async (analysisCacheID: number): Promise<ElementSuggestion[]> => {
    const { data } = await api.get(`/element/analysis/${analysisCacheID}`);
    return data;
};

// API 3: Tạo mới Element (POST)
export const generateDeepDiveAnalysis = async (analysisCacheID: number): Promise<ElementSuggestion[]> => {
    const { data } = await api.get(`/element/suggestion/${analysisCacheID}`);
    return data;
};

// API 4: Lấy lịch sử (GET List)
export const fetchPerformanceHistory = async (userId: string | null): Promise<HistoryItem[]> => {
    if (!userId) return [];
    try {
        const { data } = await api.get(`/performance-histories`, {
            params: {
                CurrentPage: 1,
                PageSize: 20,
                UserId: userId
            }
        });
        return data.items || [];
    } catch (error) {
        console.error("Lỗi khi tải lịch sử:", error);
        return [];
    }
};

// API 5: Lấy 1 báo cáo (GET by ID)
export const fetchSingleReport = async (id: number): Promise<PerformanceHistoryResponse> => {
    const { data } = await api.get(`/performance-histories/${id}`);
    return data;
};

// API 6: Lấy kết quả so sánh (GET)
export const fetchComparisonResult = async (analysisCacheId: number): Promise<AnalysisResultResponse> => {
    const { data } = await api.get(`/analysisCache/result/${analysisCacheId}`);
    return data;
};
