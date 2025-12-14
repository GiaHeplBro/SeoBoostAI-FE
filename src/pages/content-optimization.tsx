import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";

// Import icons and UI components
import { Sparkles, Search, Wand2, History, ChevronDown, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

// Import from feature modules
import type {
  ContentOptimizationPayload,
  ContentOptimizationResponse
} from "@/features/content-optimization/types";

import {
  createContentOptimization,
  searchOptimizationHistory
} from "@/features/content-optimization/api";

import { ComparisonScoreCard } from "@/features/content-optimization/components/ComparisonScoreCard";
import { OptimizedContentDisplay } from "@/features/content-optimization/components/OptimizedContentDisplay";

import {
  READABILITY_LEVELS,
  CONTENT_LENGTH_OPTIONS,
  DEFAULT_PAGE_SIZE
} from "@/features/content-optimization/utils/constants";

import { parseUserRequest } from "@/features/content-optimization/utils/helpers";

export default function ContentOptimization() {
  // --- States ---
  const [content, setContent] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [optimizationLevel, setOptimizationLevel] = useState<number[]>([3]);
  const [readabilityPreference, setReadabilityPreference] = useState<number[]>([2]);
  const [contentLengthPreference, setContentLengthPreference] = useState<number[]>([2]);


  // Current optimization result
  const [currentResult, setCurrentResult] = useState<ContentOptimizationResponse | null>(null);

  // Search and pagination states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Debounce search keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
      setCurrentPage(1); // Reset to page 1 when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchKeyword]);



  // Fetch optimization history - userId obtained from JWT token in backend
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['optimizationHistory', debouncedKeyword, currentPage],
    queryFn: () => searchOptimizationHistory({
      keyword: debouncedKeyword || undefined,
      currentPage: currentPage,
      pageSize: DEFAULT_PAGE_SIZE
    }),
    enabled: true,
  });

  // Create optimization mutation
  const mutation = useMutation({
    mutationFn: createContentOptimization,
    onSuccess: (data) => {
      toast({
        title: "Thành công!",
        description: "Nội dung của bạn đã được tối ưu hóa."
      });
      setCurrentResult(data);
      queryClient.invalidateQueries({ queryKey: ['optimizationHistory'] });
    },
    onError: (error: any) => {
      toast({
        title: "Thất bại",
        description: error.message || "Có lỗi xảy ra",
        variant: "destructive"
      });
    },
  });

  // Handle optimization request
  const handleOptimize = () => {

    if (!content || !targetKeyword) {
      const missing = [];
      if (!content) missing.push('nội dung');
      if (!targetKeyword) missing.push('từ khóa');

      toast({
        title: "Lỗi",
        description: `Thiếu: ${missing.join(', ')}.`,
        variant: "destructive"
      });
      return;
    }

    const payload: ContentOptimizationPayload = {
      keyword: targetKeyword,
      content: content,
      optimizationLevel: optimizationLevel[0],
      readabilityLevel: READABILITY_LEVELS[readabilityPreference[0]],
      contentLength: CONTENT_LENGTH_OPTIONS[contentLengthPreference[0]],
      featureId: 1 // Feature ID for Content Optimization
    };

    mutation.mutate(payload);
  };

  // Load history item
  const handleLoadHistoryItem = (item: ContentOptimizationResponse) => {
    setCurrentResult(item);

    // Parse and populate form if possible
    const parsedRequest = parseUserRequest(item.userRequest);
    if (parsedRequest) {
      // Support both PascalCase and camelCase from backend
      const keyword = (parsedRequest as any).Keyword || (parsedRequest as any).keyword || '';
      const contentText = (parsedRequest as any).Content || (parsedRequest as any).content || '';
      setTargetKeyword(keyword);
      setContent(contentText);
    }

    // Scroll to results - wait for DOM update
    setTimeout(() => {
      const resultsElement = document.getElementById('comparison-scores-section');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold flex items-center text-white">
          Tối ưu nội dung <Sparkles className="ml-2 h-6 w-6 text-yellow-500" />
        </h1>
        <p className="text-slate-400">
          Nâng cao nội dung bằng AI để cải thiện xếp hạng tìm kiếm và mức độ tương tác
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Card */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Nhập nội dung</CardTitle>
              <CardDescription className="text-slate-400">Nhập nội dung để tối ưu cho SEO và khả năng đọc</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Keyword Input */}
              <div className="space-y-2">
                <Label htmlFor="target-keyword" className="text-slate-300">Từ khóa hoặc chủ đề</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="target-keyword"
                    placeholder="Ví dụ: tai nghe gaming"
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Content Textarea */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="content" className="text-slate-300">Nội dung của bạn</Label>
                  <span className="text-xs text-slate-400">{content?.length || 0} ký tự</span>
                </div>
                <Textarea
                  id="content"
                  placeholder="Dán nội dung vào đây..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Cài đặt tối ưu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content Length */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-slate-300">Độ dài nội dung</Label>
                  <span className="text-sm font-medium text-white">{CONTENT_LENGTH_OPTIONS[contentLengthPreference[0]]}</span>
                </div>
                <Slider
                  min={0}
                  max={CONTENT_LENGTH_OPTIONS.length - 1}
                  step={1}
                  value={contentLengthPreference}
                  onValueChange={setContentLengthPreference}
                />
              </div>

              {/* Optimization Level */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-slate-300">Mức tối ưu</Label>
                  <span className="text-sm font-medium text-white">Level {optimizationLevel[0]}</span>
                </div>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={optimizationLevel}
                  onValueChange={setOptimizationLevel}
                />
              </div>

              {/* Readability Level */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-slate-300">Mức độ dễ đọc</Label>
                  <span className="text-sm font-medium text-white">{READABILITY_LEVELS[readabilityPreference[0]]}</span>
                </div>
                <Slider
                  min={0}
                  max={READABILITY_LEVELS.length - 1}
                  step={1}
                  value={readabilityPreference}
                  onValueChange={setReadabilityPreference}
                />
              </div>



              {/* Optimize Button */}
              <Button
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleOptimize}
                disabled={mutation.isPending || !content || !targetKeyword}
                size="lg"
              >
                {mutation.isPending ? (
                  "Đang tối ưu..."
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    <span>Tối ưu bằng AI</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Display */}
          {currentResult && (
            <div className="space-y-6" id="comparison-scores-section">
              {/* Comparison Scores */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white">So sánh điểm số</CardTitle>
                      <CardDescription className="text-slate-400">Cải thiện của nội dung sau khi tối ưu</CardDescription>
                    </div>
                    <a
                      href="https://docs.google.com/document/d/your-doc-id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-blue-400 transition-colors"
                      title="Tìm hiểu về các chỉ số"
                    >
                      <HelpCircle className="h-5 w-5" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentResult.aiData?.comparison ? (
                    <div className="grid grid-cols-1 gap-4">
                      <ComparisonScoreCard
                        title="SEO Score"
                        originalScore={currentResult.aiData.comparison.original?.seo_score ?? 0}
                        optimizedScore={currentResult.aiData.comparison.optimized?.seo_score ?? 0}
                        originalJustification={currentResult.aiData.comparison.original?.seo_justification ?? ''}
                        optimizedJustification={currentResult.aiData.comparison.optimized?.seo_justification ?? ''}
                      />
                      <ComparisonScoreCard
                        title="Readability"
                        originalScore={currentResult.aiData.comparison.original?.readability_score ?? 0}
                        optimizedScore={currentResult.aiData.comparison.optimized?.readability_score ?? 0}
                        originalJustification={currentResult.aiData.comparison.original?.readability_justification ?? ''}
                        optimizedJustification={currentResult.aiData.comparison.optimized?.readability_justification ?? ''}
                      />
                      <ComparisonScoreCard
                        title="Engagement"
                        originalScore={currentResult.aiData.comparison.original?.engagement_score ?? 0}
                        optimizedScore={currentResult.aiData.comparison.optimized?.engagement_score ?? 0}
                        originalJustification={currentResult.aiData.comparison.original?.engagement_justification ?? ''}
                        optimizedJustification={currentResult.aiData.comparison.optimized?.engagement_justification ?? ''}
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">Không có dữ liệu so sánh cho bản ghi này</p>
                  )}
                </CardContent>
              </Card>

              {/* Optimized Content */}
              <OptimizedContentDisplay content={currentResult.aiData.optimized_content} />

              {/* Summary */}
              {currentResult.aiData?.summary && (
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Tóm tắt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">
                      {currentResult.aiData.summary}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-900 border-slate-800 sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <History className="mr-2 h-5 w-5" /> Lịch sử tối ưu
              </CardTitle>
              {/* Search input */}
              <div className="mt-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm theo từ khóa..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {isLoadingHistory ? (
                  <p className="text-sm text-slate-400 text-center py-4">Đang tải lịch sử...</p>
                ) : historyData && historyData.items.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {historyData.items.map(item => {
                      const parsedRequest = parseUserRequest(item.userRequest);
                      return (
                        <AccordionItem value={`item-${item.contentOptimizationID}`} key={item.contentOptimizationID}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="text-left">
                              <p className="font-semibold truncate text-white">
                                {(parsedRequest as any)?.Keyword || (parsedRequest as any)?.keyword || 'N/A'}
                              </p>
                              <p className="text-xs text-slate-400">
                                {new Date(item.createdAt).toLocaleString('vi-VN')}
                              </p>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 p-2">
                              {/* Scores */}
                              {item.aiData?.comparison ? (
                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                  <div>
                                    <p className="text-slate-400">SEO</p>
                                    <p className="font-bold text-white">
                                      {item.aiData.comparison.original?.seo_score ?? 'N/A'} → {item.aiData.comparison.optimized?.seo_score ?? 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400">Read</p>
                                    <p className="font-bold text-white">
                                      {item.aiData.comparison.original?.readability_score ?? 'N/A'} → {item.aiData.comparison.optimized?.readability_score ?? 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400">Eng</p>
                                    <p className="font-bold text-white">
                                      {item.aiData.comparison.original?.engagement_score ?? 'N/A'} → {item.aiData.comparison.optimized?.engagement_score ?? 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-slate-400 text-center">Không có dữ liệu so sánh</p>
                              )}

                              {/* Load Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                                onClick={() => handleLoadHistoryItem(item)}
                              >
                                Xem chi tiết
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">
                    {searchKeyword ? 'Không tìm thấy kết quả.' : 'Chưa có lịch sử.'}
                  </p>
                )}
              </ScrollArea>

              {/* Pagination Controls */}
              {historyData && historyData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>

                  <span className="text-sm text-slate-400">
                    Trang {currentPage} / {historyData.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                    onClick={() => setCurrentPage(p => Math.min(historyData.totalPages, p + 1))}
                    disabled={currentPage === historyData.totalPages}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
