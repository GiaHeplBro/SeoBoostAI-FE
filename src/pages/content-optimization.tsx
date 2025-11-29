import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { jwtDecode } from 'jwt-decode';

// Import icons and UI components
import { Sparkles, Search, Wand2, History, ChevronDown } from "lucide-react";
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
  const [includeCitation, setIncludeCitation] = useState(false);

  // Current optimization result
  const [currentResult, setCurrentResult] = useState<ContentOptimizationResponse | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get userId from JWT token
  const userId = useMemo(() => {
    try {
      const encodedTokens = localStorage.getItem('tokens');
      if (!encodedTokens) return null;

      const decodedString = decodeURIComponent(atob(encodedTokens));
      const { accessToken } = JSON.parse(decodedString);
      const decodedToken: { user_ID: string } = jwtDecode(accessToken);
      return decodedToken.user_ID;
    } catch (e) {
      console.error("Lỗi giải mã token:", e);
      return null;
    }
  }, []);

  // Fetch optimization history
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['optimizationHistory', userId],
    queryFn: () => searchOptimizationHistory({
      UserId: parseInt(userId || '0', 10),
      CurrentPage: 1,
      PageSize: DEFAULT_PAGE_SIZE
    }),
    enabled: !!userId,
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
      queryClient.invalidateQueries({ queryKey: ['optimizationHistory', userId] });
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
    // Debug logging
    console.log('Validation check:', {
      content: !!content,
      targetKeyword: !!targetKeyword,
      userId: !!userId,
      contentValue: content?.substring(0, 50),
      keywordValue: targetKeyword,
      userIdValue: userId
    });

    if (!content || !targetKeyword || !userId) {
      const missing = [];
      if (!content) missing.push('nội dung');
      if (!targetKeyword) missing.push('từ khóa');
      if (!userId) missing.push('thông tin đăng nhập');

      toast({
        title: "Lỗi",
        description: `Thiếu: ${missing.join(', ')}. ${!userId ? 'Vui lòng đăng nhập lại.' : ''}`,
        variant: "destructive"
      });
      return;
    }

    const payload: ContentOptimizationPayload = {
      UserId: parseInt(userId, 10),
      Keyword: targetKeyword,
      Content: content,
      OptimizationLevel: optimizationLevel[0],
      ReadabilityLevel: READABILITY_LEVELS[readabilityPreference[0]],
      IncludeCitation: includeCitation,
      ContentLength: CONTENT_LENGTH_OPTIONS[contentLengthPreference[0]],
    };

    mutation.mutate(payload);
  };

  // Load history item
  const handleLoadHistoryItem = (item: ContentOptimizationResponse) => {
    setCurrentResult(item);

    // Parse and populate form if possible
    const parsedRequest = parseUserRequest(item.userRequest);
    if (parsedRequest) {
      setTargetKeyword(parsedRequest.Keyword);
      setContent(parsedRequest.Content);
    }

    // Scroll to results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center">
          Tối ưu nội dung <Sparkles className="ml-2 h-6 w-6 text-yellow-500" />
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Nâng cao nội dung bằng AI để cải thiện xếp hạng tìm kiếm và mức độ tương tác
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Card */}
          <Card>
            <CardHeader>
              <CardTitle>Nhập nội dung</CardTitle>
              <CardDescription>Nhập nội dung để tối ưu cho SEO và khả năng đọc</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Keyword Input */}
              <div className="space-y-2">
                <Label htmlFor="target-keyword">Từ khóa hoặc chủ đề</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="target-keyword"
                    placeholder="Ví dụ: tai nghe gaming"
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Content Textarea */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="content">Nội dung của bạn</Label>
                  <span className="text-xs text-muted-foreground">{content.length} ký tự</span>
                </div>
                <Textarea
                  id="content"
                  placeholder="Dán nội dung vào đây..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt tối ưu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content Length */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Độ dài nội dung</Label>
                  <span className="text-sm font-medium">{CONTENT_LENGTH_OPTIONS[contentLengthPreference[0]]}</span>
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
                  <Label>Mức tối ưu</Label>
                  <span className="text-sm font-medium">Level {optimizationLevel[0]}</span>
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
                  <Label>Mức độ dễ đọc</Label>
                  <span className="text-sm font-medium">{READABILITY_LEVELS[readabilityPreference[0]]}</span>
                </div>
                <Slider
                  min={0}
                  max={READABILITY_LEVELS.length - 1}
                  step={1}
                  value={readabilityPreference}
                  onValueChange={setReadabilityPreference}
                />
              </div>

              {/* Include Citation */}
              <div className="flex items-center justify-between">
                <Label htmlFor="citation">Bao gồm trích dẫn</Label>
                <Switch
                  id="citation"
                  checked={includeCitation}
                  onCheckedChange={setIncludeCitation}
                />
              </div>

              {/* Optimize Button */}
              <Button
                className="w-full flex items-center justify-center gap-2"
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
            <div className="space-y-6">
              {/* Comparison Scores */}
              <Card>
                <CardHeader>
                  <CardTitle>So sánh điểm số</CardTitle>
                  <CardDescription>Cải thiện của nội dung sau khi tối ưu</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ComparisonScoreCard
                      title="SEO Score"
                      originalScore={currentResult.aiData.comparison.original.seo_score}
                      optimizedScore={currentResult.aiData.comparison.optimized.seo_score}
                      originalJustification={currentResult.aiData.comparison.original.seo_justification}
                      optimizedJustification={currentResult.aiData.comparison.optimized.seo_justification}
                    />
                    <ComparisonScoreCard
                      title="Readability"
                      originalScore={currentResult.aiData.comparison.original.readability_score}
                      optimizedScore={currentResult.aiData.comparison.optimized.readability_score}
                      originalJustification={currentResult.aiData.comparison.original.readability_justification}
                      optimizedJustification={currentResult.aiData.comparison.optimized.readability_justification}
                    />
                    <ComparisonScoreCard
                      title="Engagement"
                      originalScore={currentResult.aiData.comparison.original.engagement_score}
                      optimizedScore={currentResult.aiData.comparison.optimized.engagement_score}
                      originalJustification={currentResult.aiData.comparison.original.engagement_justification}
                      optimizedJustification={currentResult.aiData.comparison.optimized.engagement_justification}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Optimized Content */}
              <OptimizedContentDisplay content={currentResult.aiData.optimized_content} />
            </div>
          )}
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="mr-2 h-5 w-5" /> Lịch sử tối ưu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {isLoadingHistory ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Đang tải lịch sử...</p>
                ) : historyData && historyData.items.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {historyData.items.map(item => {
                      const parsedRequest = parseUserRequest(item.userRequest);
                      return (
                        <AccordionItem value={`item-${item.contentOptimizationID}`} key={item.contentOptimizationID}>
                          <AccordionTrigger>
                            <div className="text-left">
                              <p className="font-semibold truncate">{parsedRequest?.Keyword || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.createdAt).toLocaleString('vi-VN')}
                              </p>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 p-2">
                              {/* Scores */}
                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div>
                                  <p className="text-muted-foreground">SEO</p>
                                  <p className="font-bold">
                                    {item.aiData.comparison.original.seo_score} → {item.aiData.comparison.optimized.seo_score}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Read</p>
                                  <p className="font-bold">
                                    {item.aiData.comparison.original.readability_score} → {item.aiData.comparison.optimized.readability_score}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Eng</p>
                                  <p className="font-bold">
                                    {item.aiData.comparison.original.engagement_score} → {item.aiData.comparison.optimized.engagement_score}
                                  </p>
                                </div>
                              </div>

                              {/* Load Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
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
                  <p className="text-sm text-muted-foreground text-center py-4">Không có lịch sử.</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
