import { useState } from "react";
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowUp, History, Plus, Loader2, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ReactMarkdown from 'react-markdown';
import { useToast } from "@/hooks/use-toast";

import { analyzeTrend, fetchKeywords, fetchQueryHistory } from "@/features/trends/api";
import type { AnalysisResponse } from "@/features/trends/types";

type ViewState = 'empty' | 'loading' | 'results';

export default function KeywordAnalysis() {
    const [viewState, setViewState] = useState<ViewState>('empty');
    const [searchQuery, setSearchQuery] = useState("");
    const [activeHistoryId, setActiveHistoryId] = useState<number | null>(null);
    const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResponse | null>(null);
    const [showOnlySuggestions, setShowOnlySuggestions] = useState(false);

    const { toast } = useToast();

    // Mutation for analysis (1-4 min)
    const analysisMutation = useMutation({
        mutationFn: analyzeTrend,
        onSuccess: (data) => {
            setCurrentAnalysis(data);
            setActiveHistoryId(data.id);
            setViewState('results');
            setSearchQuery("");
            // Refetch history to include new item
            historyQuery.refetch();
            toast({
                title: "Phân tích hoàn tất!",
                description: "Kết quả phân tích xu hướng đã sẵn sàng.",
            });
        },
        onError: (error: any) => {
            console.error("Analysis error:", error);
            setViewState('empty');
            toast({
                title: "Lỗi phân tích",
                description: error?.message || "Không thể phân tích xu hướng. Vui lòng thử lại.",
                variant: "destructive",
            });
        }
    });

    // Query for keywords (auto-fetch after analysis)
    const { data: keywords, isLoading: isLoadingKeywords } = useQuery({
        queryKey: ['keywords', currentAnalysis?.id, showOnlySuggestions],
        queryFn: () => fetchKeywords(currentAnalysis!.id, showOnlySuggestions),
        enabled: !!currentAnalysis?.id,
    });

    // Query for history
    const historyQuery = useQuery({
        queryKey: ['queryHistory', 1],
        queryFn: () => fetchQueryHistory(1, 20),
    });

    // Handle search submission
    const handleSearch = () => {
        if (!searchQuery.trim()) {
            toast({
                title: "Thiếu thông tin",
                description: "Vui lòng nhập câu hỏi của bạn.",
                variant: "destructive",
            });
            return;
        }

        // BR-20 (Updated): Check word count limit
        const wordCount = searchQuery.trim().split(/\s+/).length;
        if (wordCount > 350) {
            toast({
                title: "Quá giới hạn từ",
                description: `Câu hỏi không được vượt quá 350 từ. (Hiện tại: ${wordCount} từ)`,
                variant: "destructive",
            });
            return;
        }

        setViewState('loading');
        analysisMutation.mutate({
            question: searchQuery.trim(),
            featureID: 2
        });
    };

    // Handle history item click
    const handleHistoryClick = (item: any) => {
        setCurrentAnalysis({
            id: item.id,
            originalQuestion: item.originalQuestion,
            finalAiResponse: item.finalAiResponse,
            createdAt: item.createdAt
        });
        setActiveHistoryId(item.id);
        setViewState('results');
    };

    // Handle new chat
    const handleNewChat = () => {
        setViewState('empty');
        setSearchQuery("");
        setActiveHistoryId(null);
        setCurrentAnalysis(null);
        setShowOnlySuggestions(false);
    };

    // Get competition badge color
    const getCompetitionColor = (competition: string) => {
        switch (competition.toLowerCase()) {
            case 'thấp': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'vừa': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'cao': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full bg-[#212121]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[#212121] bg-[#181818] p-4 flex flex-col">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-[#212121] rounded-full p-2">
                            <History className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-base font-medium text-white">Lịch sử tìm kiếm</h2>
                        </div>
                    </div>

                    {/* History List */}
                    <ScrollArea className="flex-1">
                        {historyQuery.isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                        ) : historyQuery.data?.items && historyQuery.data.items.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {historyQuery.data.items.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleHistoryClick(item)}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${activeHistoryId === item.id
                                            ? 'bg-[#212121] text-white'
                                            : 'text-white/70 hover:bg-[#212121]'
                                            }`}
                                    >
                                        <History className="h-4 w-4 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{item.originalQuestion}</p>
                                            <p className="text-[10px] opacity-70">
                                                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-[#212121] px-4 py-12 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-sm font-semibold text-white">Chưa có lịch sử</p>
                                    <p className="text-xs text-white/50">Các tìm kiếm của bạn sẽ xuất hiện ở đây</p>
                                </div>
                            </div>
                        )}
                    </ScrollArea>

                    {/* New Chat Button */}
                    <Button
                        onClick={handleNewChat}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-[#212121] hover:bg-[#212121]/80 text-white border-none"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Tìm kiếm mới</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[#212121]">
                {viewState === 'empty' && (
                    <div className="flex flex-1 flex-col justify-center items-center p-6 h-full">
                        <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-8">
                            <h1 className="text-4xl font-bold text-center text-white">
                                Chào bạn, tôi có thể giúp gì cho bạn?
                            </h1>

                            <div className="w-full max-w-xl">
                                <div className="relative flex items-center">
                                    <Input
                                        className="w-full h-16 pr-14 text-base bg-[#181818] border-[#181818] text-white placeholder:text-white/50"
                                        placeholder="Nhập câu hỏi về xu hướng từ khóa..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button
                                        size="icon"
                                        className="absolute right-2 h-10 w-10 rounded-lg bg-white hover:bg-white/90 text-[#181818]"
                                        onClick={handleSearch}
                                        disabled={!searchQuery.trim()}
                                    >
                                        <ArrowUp className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {viewState === 'loading' && (
                    <div className="flex flex-1 flex-col items-center justify-center p-6 h-full gap-6">
                        <Loader2 className="h-16 w-16 text-primary animate-spin" />
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2 text-white">Đang phân tích xu hướng...</h2>
                            <p className="text-white/70">Quá trình này có thể mất 1-4 phút. Vui lòng chờ...</p>
                            <p className="text-xs text-blue-400 font-medium mt-1">Ước tính thời gian: 1-2 phút</p>
                        </div>
                        <div className="w-full max-w-md space-y-2">
                            <div className="h-2 bg-[#181818] rounded-full overflow-hidden">
                                <div className="h-full bg-white animate-pulse w-2/3"></div>
                            </div>
                            <p className="text-xs text-white/50 text-center">💡 AI đang phân tích dữ liệu từ nhiều nguồn...</p>
                        </div>
                    </div>
                )}

                {viewState === 'results' && currentAnalysis && (
                    <div className="p-6 md:p-8 lg:p-12">
                        <div className="mx-auto max-w-4xl flex flex-col gap-6">
                            {/* Page Heading */}
                            <h1 className="text-4xl font-black text-white">{currentAnalysis.originalQuestion}</h1>

                            {/* Card 1: AI Response */}
                            <Card className="bg-[#181818] border-[#181818]">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-white">
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        Phân tích từ AI
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose prose-invert max-w-none">
                                        <ReactMarkdown>{currentAnalysis.finalAiResponse}</ReactMarkdown>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card 2: Keywords Table */}
                            <Card className="bg-[#181818] border-[#181818]">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center text-white">
                                                <Filter className="mr-2 h-5 w-5" />
                                                Từ Khóa Đề Xuất
                                            </CardTitle>
                                            <CardDescription className="text-white/70">
                                                {keywords?.length || 0} từ khóa được tìm thấy
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="filter-suggestions"
                                                checked={showOnlySuggestions}
                                                onCheckedChange={setShowOnlySuggestions}
                                            />
                                            <Label htmlFor="filter-suggestions" className="cursor-pointer text-white">
                                                Chỉ AI đề xuất
                                            </Label>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingKeywords ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                        </div>
                                    ) : keywords && keywords.length > 0 ? (
                                        <ScrollArea className="h-[500px] w-full rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[250px] text-white">Từ khóa</TableHead>
                                                        <TableHead className="text-white">Lượt tìm kiếm</TableHead>
                                                        <TableHead className="text-white">Cạnh tranh</TableHead>
                                                        <TableHead className="text-white">Giá thầu</TableHead>
                                                        <TableHead className="w-[300px] text-white">Đề xuất AI</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {keywords.map((keyword, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell className="font-medium text-white">
                                                                {keyword.Keyword}
                                                                {keyword.AiSuggestion && (
                                                                    <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                        <Sparkles className="h-3 w-3 mr-1" />
                                                                        AI
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-white">{keyword.Avg_Search_Volume}</TableCell>
                                                            <TableCell>
                                                                <Badge className={getCompetitionColor(keyword.Competition)}>
                                                                    {keyword.Competition}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-sm text-white">
                                                                {keyword.Low_Bid !== "—" && keyword.High_Bid !== "—" ? (
                                                                    <>{keyword.Low_Bid} - {keyword.High_Bid}</>
                                                                ) : (
                                                                    <span className="text-gray-400">—</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-white">
                                                                {keyword.AiMessage ? (
                                                                    <span className="text-sm text-white/70">
                                                                        {keyword.AiMessage}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-sm text-white/30">—</span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Filter className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400">
                                                {showOnlySuggestions ? 'Không có từ khóa được AI đề xuất' : 'Không tìm thấy từ khóa nào'}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
