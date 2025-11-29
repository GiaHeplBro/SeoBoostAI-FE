// TypeScript interfaces for SEO Audit feature

// Payload cho API 1 (Phân tích - POST)
// userId được lấy từ token ở BE, không cần truyền nữa
export interface PerformanceHistoryPayload {
    url: string;
    strategy: "desktop" | "mobile";
    featureId: number;
}

// Payload cho API Update (Phân tích lại - PUT)
// userId được lấy từ token ở BE, không cần truyền nữa
export interface UpdatePerformanceHistoryPayload {
    performanceHistoryId: number;
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

// Element trong analysisCache
export interface Element {
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
    updatedAt: string | null;
    isDeleted: boolean;
}

// Dữ liệu cache (nested trong scanHistory)
export interface AnalysisCache {
    analysisCacheID: number;
    url: string;
    normalizedUrl: string;
    strategy: string;
    pageSpeedResponse: string; // JSON string
    generalAssessment: string;
    suggestion: string;
    lastAnalyzedAt: string;
    elements: Element[];
    analysisSnapshots: any[];
    performanceHistories: any[];
}

// Response item từ API lịch sử
export interface ScanHistoryItem {
    scanHistoryID: number;
    userID: number;
    analysisCacheID: number;
    scanTime: string;
    analysisCache: AnalysisCache;
    user: null;
}

// Response từ API GET /performance-histories (có pagination)
export interface PerformanceHistoryListResponse {
    success: boolean;
    message: string;
    data: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
        items: ScanHistoryItem[];
    };
}

// Response từ API POST /performance-histories (single item)
export interface PerformanceHistoryResponse {
    success: boolean;
    message: string;
    data: ScanHistoryItem;
}

// Response từ API 2 (Chuyên sâu) - Element data
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
    updatedAt: string | null;
    isDeleted: boolean;
    analysisCache: AnalysisCache | null;
}

// Response wrapper cho element APIs
export interface ElementsResponse {
    success: boolean;
    message: string;
    data: ElementSuggestion[];
}

// Kiểu dữ liệu cho một mục trong danh sách
export type HistoryItem = ScanHistoryItem;
