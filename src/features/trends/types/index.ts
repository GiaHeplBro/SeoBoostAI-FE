// TypeScript interfaces for Trends/Keyword Analysis feature

export interface AnalysisRequest {
    question: string;
    featureID: number;
}

export interface AnalysisResponse {
    id: number;
    originalQuestion: string;
    finalAiResponse: string; // Markdown content from AI
    createdAt: string;
}

export interface KeywordData {
    Keyword: string;
    Avg_Search_Volume: string;
    Competition: string;
    Low_Bid: string;
    High_Bid: string;
    AiSuggestion: boolean;
    AiMessage: string | null;
}

// Query History types
export interface QueryHistoryItem {
    id: number;
    memberId: number;
    originalQuestion: string;
    finalAiResponse: string; // Markdown content
    createdAt: string;
    adsSearchRequestId: number;
    adsSearchRequest: null;
    member: null;
}

export interface QueryHistoryResponse {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    items: QueryHistoryItem[];
}
