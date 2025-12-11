// TypeScript interfaces for Content Optimization feature

// Request payload for creating content optimization
// userId is obtained from JWT token on backend
export interface ContentOptimizationPayload {
    keyword: string;
    content: string;
    contentLength: string;
    optimizationLevel: number;
    readabilityLevel: string;
    featureId: number; // Feature ID for Content Optimization
}

// Score data with justification
export interface ScoreData {
    seo_score: number;
    seo_justification: string;
    readability_score: number;
    readability_justification: string;
    engagement_score: number;
    engagement_justification: string;
}

// Comparison between original and optimized
export interface ComparisonData {
    original: ScoreData;
    optimized: ScoreData;
}

// AI response data
export interface AIData {
    comparison: ComparisonData;
    optimized_content: string; // Markdown content
    summary?: string;
}

// Main response from create optimization API
export interface ContentOptimizationResponse {
    contentOptimizationID: number;
    userID: number;
    model: string;
    userRequest: string; // JSON string containing the original request
    aiData: AIData;
    createdAt: string;
}

// Search/history parameters - userId from token
export interface SearchHistoryParams {
    keyword?: string;
    createdAt?: string;
    currentPage: number;
    pageSize: number;
}

// Search/history response
export interface SearchHistoryResponse {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    items: ContentOptimizationResponse[];
}

// Parsed user request (from userRequest JSON string)
export interface ParsedUserRequest {
    Keyword: string;
    Content: string;
    ContentLength: string;
    OptimizationLevel: number;
    ReadabilityLevel: string;
    FeatureId: number;
}
