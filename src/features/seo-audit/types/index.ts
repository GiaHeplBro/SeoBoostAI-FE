// TypeScript interfaces for SEO Audit feature

// Payload cho API 1 (Phân tích - POST)
export interface PerformanceHistoryPayload {
    userId: number;
    url: string;
    strategy: "desktop" | "mobile";
    featureId: number;
}

// Payload cho API Update (Phân tích lại - PUT)
export interface UpdatePerformanceHistoryPayload {
    performanceHistoryId: number;
    userId: number;
    featureId: number;
}

// Các điểm số (bên trong `pageSpeedResponse` đã được parse)
export interface PageSpeedScores {
    PerformanceScore: number;
    FCP: number;
    LCP: number;
    CLS: number;
    TBT: number;
    SpeedIndex: number;
    TimeToInteractive: number;
}

// Model so sánh từ API mới
export interface ComparisonModel {
    scoreChange: number;
    fcpChange: number;
    lcpChange: number;
    clsChange: number;
    tbtChange: number;
    siChange: number;
    ttiChange: number;
}

// Response từ API so sánh
export interface AnalysisResultResponse {
    success: boolean;
    message: string;
    data: {
        pageSpeedMetrics: {
            performanceScore: number;
            fcp: number;
            lcp: number;
            cls: number;
            tbt: number;
            speedIndex: number;
            timeToInteractive: number;
        };
        comparisonModel: ComparisonModel | null;
    };
}

// Dữ liệu cache (trong response API 1)
export interface AnalysisCache {
    analysisCacheID: number;
    url: string;
    normalizedUrl: string;
    strategy: string;
    pageSpeedResponse: string; // Đây là JSON string
    generalAssessment: string;
    suggestion: string;
    lastAnalyzedAt: string;
    elements: any[];
}

// Response từ API 1 & PUT
export interface PerformanceHistoryResponse {
    scanHistoryID: number;
    userID: number;
    analysisCacheID: number;
    scanTime: string;
    analysisCache: AnalysisCache;
}

// Response từ API 2 (Chuyên sâu)
export interface ElementSuggestion {
    elementID: number;
    analysisCacheID: number;
    tagName: string;
    innerText: string;
    outerHTML: string;
    important: boolean;
    hasSuggestion: boolean;
    aiRecommendation: string | null;
    description: string | null;
    createdAt: string;
}

// Kiểu dữ liệu cho API Lịch sử (API 1 Response)
export interface HistoryApiResponse {
    totalItems: number;
    totalPages: number;
    pageSize: number;
    items: PerformanceHistoryResponse[];
}

// Kiểu dữ liệu cho một mục trong danh sách
export type HistoryItem = PerformanceHistoryResponse;
