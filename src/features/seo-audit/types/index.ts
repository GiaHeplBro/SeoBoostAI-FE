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
    auditId: string;
    title: string;
    extractedEvidenceJson: string; // JSON string array of strings
    hasSuggestion: boolean;
    aiRecommendation: string | null;
    description: string | null;
    // Old fields that might still be useful or need validation if they are gone
    elementID?: number; // Optional now as it wasn't in the simplified example but present in the full response example?
    // User example: { "auditId": "...", "title": "...", "extractedEvidenceJson": "...", "hasSuggestion": true, ... }
    // The user's NEW example for GET /api/elements/suggestion/{id} shows:
    // { auditId, title, extractedEvidenceJson, hasSuggestion, aiRecommendation, description }
}

// Response wrapper cho element APIs
export interface ElementsResponse {
    success: boolean;
    message: string;
    data: ElementSuggestion[];
}

// Payload for Batch Fix API
export interface BatchFixPayload {
    analysisCacheId: number;
    repoOwner: string;
    repoName: string;
    createSinglePR: boolean;
    useForkPR: boolean;
}

// Result item for Batch Fix
export interface BatchFixResultItem {
    elementId?: number; // Note: Input example showed elementID in the POST output, 
    // even if GET suggestion didn't explicitly show it in the user's snippet, 
    // it's likely part of the data or mapped.
    // Wait, the user's GET suggestion example DOES NOT have elementID.
    // BUT the POST batch-fix output data DOES have elementId: 6231.
    // Let's keep it optional or assume the backend handles matching.
    auditId: string;
    title: string;
    filePath: string;
    success: boolean;
    errorMessage: string | null;
}

// Response for Batch Fix API
export interface BatchFixResponse {
    success: boolean;
    message: string;
    data: {
        totalIssues: number;
        fixedCount: number;
        failedCount: number;
        results: BatchFixResultItem[];
        pullRequestUrl: string | null;
    };
}

// Kiểu dữ liệu cho một mục trong danh sách
export type HistoryItem = ScanHistoryItem;

// ============ MetaDataAnalysis Types ============

// MetaTagSuggestionDetail - chi tiết suggestion cho từng thẻ meta
export interface MetaTagSuggestionDetail {
    id: number;
    metaDataSuggestionId: number;
    tagName: string;
    currentValue: string;
    issue: string;
    recommendation: string;
    isImportant: boolean;
    createdAt: string;
    metaDataSuggestion: null;
}

// MetaDataSuggestion - suggestion tổng thể
export interface MetaDataSuggestion {
    id: number;
    metaDataAnalysisId: number;
    generalAssessment: string;
    createdAt: string;
    metaDataAnalysis: null;
    metaTagSuggestionDetails: MetaTagSuggestionDetail[];
}

// MetaDataAnalysis - response chính từ API metadata-analysis
export interface MetaDataAnalysis {
    id: number;
    url: string;
    title: string;
    description: string;
    keywords: string | null;
    charset: string;
    viewport: string;
    canonical: string;
    robots: string;
    openGraphData: string; // JSON string
    twitterCardData: string; // JSON string
    otherMetaData: string; // JSON string
    createdAt: string;
    urlHash: string;
    analysisCacheID: number;
    analysisCache: null;
    metaDataSuggestions: MetaDataSuggestion[];
}

// Response wrapper cho MetaDataAnalysis API
export interface MetaDataAnalysisResponse {
    success: boolean;
    message: string;
    data: MetaDataAnalysis;
}
