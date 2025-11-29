import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';

// --- Import các components UI cần thiết ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// --- Import Icons ---
import { History, Smartphone, Laptop, Search, Info, RefreshCcw, TrendingUp, TrendingDown } from "lucide-react";

// --- Import from feature modules ---
import type {
  PerformanceHistoryPayload,
  UpdatePerformanceHistoryPayload,
  PageSpeedScores,
  ComparisonModel,
  HistoryItem,
  PerformanceHistoryResponse
} from "@/features/seo-audit/types";

import {
  analyzeWebsite,
  updateWebsiteAnalysis,
  fetchExistingElements,
  generateDeepDiveAnalysis,
  fetchPerformanceHistory,
  fetchSingleReport,
  fetchComparisonResult
} from "@/features/seo-audit/api";

// Element suggestion type from feature modules
import type { ElementSuggestion } from "@/features/seo-audit/types";


// --- 2. Hằng số và Helper Functions ---

const METRIC_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  TBT: { good: 200, needsImprovement: 600 },
  FCP: { good: 1800, needsImprovement: 3000 },
  SI: { good: 3400, needsImprovement: 5800 },
  TTI: { good: 3800, needsImprovement: 7300 },
  PerformanceScore: { good: 90, needsImprovement: 50 }
};

const getScoreColor = (metric: keyof typeof METRIC_THRESHOLDS, value: number) => {
  if (value === null || value === undefined) return 'text-gray-500';
  const thresholds = METRIC_THRESHOLDS[metric];

  if (metric === 'PerformanceScore') {
    if (value >= thresholds.good) return 'text-green-500';
    if (value >= thresholds.needsImprovement) return 'text-amber-500';
    return 'text-red-500';
  } else {
    if (value <= thresholds.good) return 'text-green-500';
    if (value <= thresholds.needsImprovement) return 'text-amber-500';
    return 'text-red-500';
  }
};

const getMetricUnit = (metric: string) => {
  switch (metric) {
    case 'CLS':
      return '';
    case 'PerformanceScore':
      return '';
    default:
      return 'ms';
  }
}

const getMetricInfo = (metric: string) => {
  switch (metric) {
    case 'LCP':
      return 'Tốc độ tải trang. Thời gian để nội dung lớn nhất (văn bản, hình ảnh) hiển thị.';
    case 'CLS':
      return 'Tính ổn định hình ảnh. Đo lường mức độ "nhảy" (dịch chuyển) của các yếu tố trên trang khi tải.';
    case 'TBT':
      return 'Khả năng tương tác. Tổng thời gian trang bị "treo" (bị chặn) không thể phản hồi người dùng.';
    case 'FCP':
      return 'Tốc độ phản hồi đầu tiên. Thời gian từ khi tải trang đến khi bất kỳ nội dung nào (văn bản, màu nền) xuất hiện.';
    case 'SI':
      return 'Tốc độ hiển thị trực quan. Đo lường mức độ nhanh chóng mà nội dung trong màn hình đầu tiên được hiển thị.';
    case 'TTI':
      return 'Thời gian sẵn sàng tương tác. Thời gian để trang tải xong, hiển thị nội dung và sẵn sàng phản hồi tương tác.';
    case 'PerformanceScore':
      return 'Điểm hiệu suất tổng thể của trang web do PageSpeed Insights đánh giá.';
    default:
      return '';
  }
}

// --- 3. Component con: Vòng tròn điểm số ---
const PerformanceScoreCircle = ({ metric, score, change }: { metric: string, score: number, change?: number }) => {
  const roundedScore = Math.round(score);
  const colorClass = getScoreColor(metric as keyof typeof METRIC_THRESHOLDS, metric === 'CLS' ? score : roundedScore);
  const unit = getMetricUnit(metric);
  const info = getMetricInfo(metric);
  const displayScore = metric === 'CLS' ? score.toFixed(2) : roundedScore;

  // Determine change color and icon
  const getChangeColor = () => {
    if (!change || change === 0) return 'text-gray-400';

    // For Performance Score, positive change is good
    if (metric === 'PerformanceScore') {
      return change > 0 ? 'text-green-500' : 'text-red-500';
    }

    // For other metrics (lower is better), negative change is good
    return change < 0 ? 'text-green-500' : 'text-red-500';
  };

  const getChangeIcon = () => {
    if (!change || change === 0) return null;

    // For Performance Score, positive change shows up arrow
    if (metric === 'PerformanceScore') {
      return change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
    }

    // For other metrics, negative change shows down arrow (improvement)
    return change < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />;
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center justify-center p-2 text-center">
            <div className={`relative w-20 h-20 flex items-center justify-center border-4 rounded-full ${colorClass.replace('text-', 'border-')}`}>
              <span className={`text-xl font-bold ${colorClass}`}>{displayScore}</span>
              {unit && <span className="text-xs text-muted-foreground absolute bottom-3">{unit}</span>}

              <TooltipContent side="top" className="max-w-[200px] text-center">
                <p className="font-semibold">{metric}</p>
                <p className="text-xs">{info}</p>
              </TooltipContent>
            </div>
            <p className="mt-2 text-sm font-medium text-muted-foreground">{metric}</p>

            {/* Display change indicator */}
            {change !== undefined && change !== 0 && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${getChangeColor()}`}>
                {getChangeIcon()}
                <span>{metric === 'CLS' ? change.toFixed(3) : Math.abs(change).toFixed(0)}</span>
              </div>
            )}
          </div>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
};



// --- 3. Component chính ---

export default function ContentOptimization() {
  // --- States ---
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState<"desktop" | "mobile">("desktop");

  const [currentAnalysis, setCurrentAnalysis] = useState<HistoryItem | null>(null);
  const [deepDiveAnalysis, setDeepDiveAnalysis] = useState<ElementSuggestion[] | null>(null);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparisonModel | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Lấy userId từ token
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

  // --- React Query Hooks ---

  // Query 1: Lấy lịch sử (API 4) - userId từ token
  const historyQuery = useQuery({
    queryKey: ['performanceHistory'],
    queryFn: () => fetchPerformanceHistory(),
    enabled: true,
  });

  // Mutation 1: Chạy phân tích (API 1)
  const analysisMutation = useMutation({
    mutationFn: analyzeWebsite,
    onSuccess: async (response) => {
      toast({ title: "Phân tích hoàn tất!", description: "Đã tải xong kết quả." });
      setCurrentAnalysis(response.data); // Extract data from wrapper
      setDeepDiveAnalysis(null);
      setShowDeepDive(false);
      setComparisonData(null);
      queryClient.invalidateQueries({ queryKey: ['performanceHistory'] });

      // Tải dữ liệu so sánh
      if (response.data.analysisCache.analysisCacheID) {
        try {
          const comparisonResult = await fetchComparisonResult(response.data.analysisCache.analysisCacheID);
          if (comparisonResult.data.comparisonModel) {
            setComparisonData(comparisonResult.data.comparisonModel);
          }
        } catch (error: any) {
          // 404 means no previous data to compare - this is OK for first scan
          if (error?.response?.status !== 404) {
            console.error("Lỗi tải dữ liệu so sánh:", error);
          }
        }
      }
    },
    onError: (error) => {
      toast({ title: "Lỗi phân tích", description: error.message, variant: "destructive" });
    },
  });

  // Mutation Update: Chạy lại phân tích (PUT)
  const updateAnalysisMutation = useMutation({
    mutationFn: updateWebsiteAnalysis,
    onSuccess: async (response) => {
      toast({ title: "Cập nhật thành công!", description: "Kết quả phân tích đã được làm mới." });
      setCurrentAnalysis(response.data); // Extract data from wrapper
      setDeepDiveAnalysis(null);
      setShowDeepDive(false);
      queryClient.invalidateQueries({ queryKey: ['performanceHistory'] });

      // Tải dữ liệu so sánh
      if (response.data.analysisCache.analysisCacheID) {
        try {
          const comparisonResult = await fetchComparisonResult(response.data.analysisCache.analysisCacheID);
          if (comparisonResult.data.comparisonModel) {
            setComparisonData(comparisonResult.data.comparisonModel);
          }
        } catch (error: any) {
          // 404 means no previous data to compare - this is OK for first scan
          if (error?.response?.status !== 404) {
            console.error("Lỗi tải dữ liệu so sánh:", error);
          }
        }
      }
    },
    onError: (error) => {
      toast({ title: "Lỗi cập nhật", description: error.message, variant: "destructive" });
    },
  });

  // Mutation 2: Tạo mới Element (API 3)
  const generateDeepDiveMutation = useMutation<ElementSuggestion[], Error, number>({
    mutationFn: generateDeepDiveAnalysis,
    onSuccess: (data) => {
      console.log("✅ Deep dive RAW data received:", data);
      console.log("✅ Data type:", typeof data);
      console.log("✅ Data is array?:", Array.isArray(data));
      console.log("✅ Data length:", data?.length);
      console.log("✅ First 3 items:", data?.slice(0, 3));

      setDeepDiveAnalysis(data);
      // Khi chạy POST, dữ liệu trả về chắc chắn đã có AI Suggestion
      // nên ta có thể set showDeepDive = true luôn.
      // Tuy nhiên, để an toàn (trường hợp POST trả về element rỗng), ta vẫn set.
      setShowDeepDive(true);
      toast({ title: "Phân tích chuyên sâu hoàn tất!" });
    },
    onError: (error: any) => {
      console.error("❌ Deep dive error:", error);
      console.error("❌ Error response:", error?.response);
      console.error("❌ Error data:", error?.response?.data);
      toast({ title: "Lỗi phân tích chuyên sâu", description: error.message, variant: "destructive" });
    },
  });

  // Mutation 3: Tải Element đã có (API 2)
  const fetchDeepDiveMutation = useMutation<ElementSuggestion[], Error, number>({
    mutationFn: fetchExistingElements,
    onSuccess: (data) => {
      // SỬA: Logic hiển thị mới
      // Nếu có dữ liệu Element trả về (dù có suggestion hay chưa) -> LƯU VÀO STATE
      if (data && data.length > 0) {
        setDeepDiveAnalysis(data);

        // Kiểm tra xem đã có aiRecommendation nào chưa
        // Nếu CÓ ít nhất 1 cái -> Hiển thị Bảng 2 (đã chạy chuyên sâu)
        // Nếu KHÔNG có cái nào -> Ẩn Bảng 2 (chưa chạy chuyên sâu) -> Để hiện nút
        const hasAnalysis = data?.some(item => item.aiRecommendation || item.description) ?? false;

        setShowDeepDive(hasAnalysis);
      } else {
        // Nếu không có element nào -> Chưa chạy -> Ẩn bảng 2
        setShowDeepDive(false);
      }
    },
    onError: (error: any) => {
      // 404 means elements don't exist yet - this is OK, just don't show deep dive
      console.log("Chưa có phân tích chuyên sâu (404 is expected):", error?.response?.status);
      setDeepDiveAnalysis(null);
      setShowDeepDive(false); // Make sure button shows up
    },
  });

  // Mutation 4: Tải 1 báo cáo từ lịch sử (API 5)
  const singleReportMutation = useMutation<PerformanceHistoryResponse, Error, number>({
    mutationFn: fetchSingleReport,
    onSuccess: async (response) => {
      setCurrentAnalysis(response.data); // Extract data from wrapper
      setDeepDiveAnalysis(null);
      setShowDeepDive(false);
      setComparisonData(null);
      toast({ title: "Đã tải báo cáo", description: "Đã tải kết quả từ lịch sử." });
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (response.data.analysisCache.analysisCacheID) {
        fetchDeepDiveMutation.mutate(response.data.analysisCache.analysisCacheID);

        // Tải dữ liệu so sánh
        try {
          const comparisonResult = await fetchComparisonResult(response.data.analysisCache.analysisCacheID);
          if (comparisonResult.data.comparisonModel) {
            setComparisonData(comparisonResult.data.comparisonModel);
          }
        } catch (error: any) {
          // 404 means no previous data to compare - this is OK for first scan
          if (error?.response?.status !== 404) {
            console.error("Lỗi tải dữ liệu so sánh:", error);
          }
        }
      }
    },
    onError: (error) => {
      toast({ title: "Lỗi tải lịch sử", description: error.message, variant: "destructive" });
    },
  });

  // --- Xử lý dữ liệu ---

  const scores: PageSpeedScores | null = useMemo(() => {
    if (!currentAnalysis?.analysisCache?.pageSpeedResponse) return null;
    try {
      return JSON.parse(currentAnalysis.analysisCache.pageSpeedResponse);
    } catch (e) {
      console.error("Lỗi parse JSON điểm số:", e);
      toast({ title: "Lỗi dữ liệu", description: "Không thể đọc dữ liệu điểm số trả về.", variant: "destructive" });
      return null;
    }
  }, [currentAnalysis]);

  // --- Event Handlers ---

  const handleAnalyze = () => {
    if (!url) {
      toast({ title: "Lỗi", description: "Vui lòng nhập URL.", variant: "destructive" });
      return;
    }
    // userId không cần check vì BE lấy từ token

    const payload: PerformanceHistoryPayload = {
      url: url,
      strategy: strategy,
      featureId: 3 // featureId cho SEO Audit
    };
    analysisMutation.mutate(payload);
  };

  // Hàm xử lý nút cập nhật
  const handleUpdateAnalysis = () => {
    if (!currentAnalysis) return;

    const payload: UpdatePerformanceHistoryPayload = {
      performanceHistoryId: currentAnalysis.scanHistoryID,
      featureId: 3 // featureId cho SEO Audit
    };

    updateAnalysisMutation.mutate(payload);
  };

  const handleGenerateDeepDive = () => {
    if (!currentAnalysis?.analysisCache?.analysisCacheID) return;
    generateDeepDiveMutation.mutate(currentAnalysis.analysisCache.analysisCacheID);
  };

  const handleLoadFromHistory = (scanHistoryID: number) => {
    singleReportMutation.mutate(scanHistoryID);
  }

  // --- JSX (Render UI) ---
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Tối ưu hóa Website</h1>
      <p className="text-muted-foreground">
        Phân tích toàn diện tình trạng SEO và hiệu suất website của bạn
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* --- CỘT TRÁI: NHẬP LIỆU VÀ LỊCH SỬ --- */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Phân tích Website</CardTitle>
              <CardDescription>Nhập URL để bắt đầu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="url-input"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={strategy} onValueChange={(value: "desktop" | "mobile") => setStrategy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thiết bị" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">
                    <div className="flex items-center gap-2">
                      <Laptop className="h-4 w-4" /> Desktop (Mặc định)
                    </div>
                  </SelectItem>
                  <SelectItem value="mobile">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" /> Mobile
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleAnalyze}
                disabled={analysisMutation.isPending}
              >
                {analysisMutation.isPending ? "Đang phân tích..." : "Phân tích"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" /> Lịch sử báo cáo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {historyQuery.isLoading && <p>Đang tải lịch sử...</p>}
                {historyQuery.data && historyQuery.data.data && historyQuery.data.data.items.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {historyQuery.data.data.items.map((item: HistoryItem) => (
                      <AccordionItem value={`item-${item.scanHistoryID}`} key={item.scanHistoryID}>
                        <AccordionTrigger>
                          <div className="text-left truncate">
                            <p className="font-semibold truncate pr-4">{item.analysisCache.normalizedUrl}</p>
                            <p className="text-xs text-muted-foreground">{new Date(item.scanTime).toLocaleString('vi-VN')}</p>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoadFromHistory(item.scanHistoryID)}
                            disabled={singleReportMutation.isPending && singleReportMutation.variables === item.scanHistoryID}
                          >
                            {(singleReportMutation.isPending && singleReportMutation.variables === item.scanHistoryID) ? "Đang tải..." : "Xem lại chi tiết"}
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  !historyQuery.isLoading && <p className="text-sm text-muted-foreground text-center py-4">Không có lịch sử.</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

        </div>

        {/* --- CỘT PHẢI: KẾT QUẢ --- */}
        <div className="lg:col-span-2 space-y-6">
          {!currentAnalysis && !analysisMutation.isPending && (
            <Card className="flex items-center justify-center min-h-[500px]">
              <p className="text-muted-foreground">
                Nhập một URL để bắt đầu phân tích<br />
                hoặc chọn một báo cáo từ lịch sử để xem chi tiết.
              </p>
            </Card>
          )}

          {(analysisMutation.isPending || updateAnalysisMutation.isPending) && (
            <Card className="min-h-[500px] p-6 space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <div className="flex justify-around pt-4">
                <Skeleton className="h-28 w-20 rounded-full" />
                <Skeleton className="h-28 w-20 rounded-full" />
                <Skeleton className="h-28 w-20 rounded-full" />
                <Skeleton className="h-28 w-20 rounded-full" />
              </div>
              <Skeleton className="h-24 w-full" />
            </Card>
          )}

          {currentAnalysis && scores && !analysisMutation.isPending && !updateAnalysisMutation.isPending && (
            <>
              {/* --- METRICS GRID CARDS --- */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle>Điểm hiệu suất (Core Web Vitals)</CardTitle>
                      <CardDescription>
                        Điểm số dựa trên phân tích của Google PageSpeed Insights cho <strong>{currentAnalysis.analysisCache.strategy}</strong>
                      </CardDescription>
                    </div>

                    {/* Nút Update */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-xs h-8"
                      onClick={handleUpdateAnalysis}
                      disabled={updateAnalysisMutation.isPending}
                    >
                      <RefreshCcw className={`h-3 w-3 ${updateAnalysisMutation.isPending ? 'animate-spin' : ''}`} />
                      {updateAnalysisMutation.isPending ? "Đang cập nhật..." : "Cập nhật kết quả"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Debug: Show comparison data status */}
                  {comparisonData && (
                    <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                      <p className="text-blue-600 dark:text-blue-400">✓ Dữ liệu so sánh đã tải</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Performance Score Card */}
                    <div className="flex flex-col gap-2 rounded-xl p-6 border border-border bg-card">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getScoreColor('PerformanceScore', scores.PerformanceScore).replace('text-', 'bg-')}`}></div>
                        <p className="text-sm font-medium text-muted-foreground">Performance Score</p>
                      </div>
                      <p className="text-4xl font-bold">{Math.round(scores.PerformanceScore)}</p>
                      {comparisonData?.scoreChange !== undefined && comparisonData.scoreChange !== 0 && (
                        <div className="flex items-center gap-1">
                          {comparisonData.scoreChange > 0 ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <p className="text-sm font-medium text-green-500">
                                +{comparisonData.scoreChange.toFixed(0)} điểm so với lần trước
                              </p>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-4 w-4 text-red-500" />
                              <p className="text-sm font-medium text-red-500">
                                {comparisonData.scoreChange.toFixed(0)} điểm so với lần trước
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* LCP Card */}
                    <div className="flex flex-col gap-2 rounded-xl p-6 border border-border bg-card">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getScoreColor('LCP', scores.LCP).replace('text-', 'bg-')}`}></div>
                        <p className="text-sm font-medium text-muted-foreground">LCP (Largest Contentful Paint)</p>
                      </div>
                      <p className="text-4xl font-bold">{Math.round(scores.LCP)}<span className="text-lg text-muted-foreground ml-1">ms</span></p>
                      {comparisonData?.lcpChange !== undefined && comparisonData.lcpChange !== 0 && (
                        <div className="flex items-center gap-1">
                          {comparisonData.lcpChange < 0 ? (
                            <>
                              <TrendingDown className="h-4 w-4 text-green-500" />
                              <p className="text-sm font-medium text-green-500">
                                {Math.abs(comparisonData.lcpChange).toFixed(0)}ms nhanh hơn
                              </p>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-4 w-4 text-red-500" />
                              <p className="text-sm font-medium text-red-500">
                                +{comparisonData.lcpChange.toFixed(0)}ms chậm hơn
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* FCP Card */}
                    <div className="flex flex-col gap-2 rounded-xl p-6 border border-border bg-card">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getScoreColor('FCP', scores.FCP).replace('text-', 'bg-')}`}></div>
                        <p className="text-sm font-medium text-muted-foreground">FCP (First Contentful Paint)</p>
                      </div>
                      <p className="text-4xl font-bold">{Math.round(scores.FCP)}<span className="text-lg text-muted-foreground ml-1">ms</span></p>
                      {comparisonData?.fcpChange !== undefined && comparisonData.fcpChange !== 0 && (
                        <div className="flex items-center gap-1">
                          {comparisonData.fcpChange < 0 ? (
                            <>
                              <TrendingDown className="h-4 w-4 text-green-500" />
                              <p className="text-sm font-medium text-green-500">
                                {Math.abs(comparisonData.fcpChange).toFixed(0)}ms nhanh hơn
                              </p>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-4 w-4 text-red-500" />
                              <p className="text-sm font-medium text-red-500">
                                +{comparisonData.fcpChange.toFixed(0)}ms chậm hơn
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CLS Card */}
                    <div className="flex flex-col gap-2 rounded-xl p-6 border border-border bg-card">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getScoreColor('CLS', scores.CLS).replace('text-', 'bg-')}`}></div>
                        <p className="text-sm font-medium text-muted-foreground">CLS (Cumulative Layout Shift)</p>
                      </div>
                      <p className="text-4xl font-bold">{scores.CLS.toFixed(3)}</p>
                      {comparisonData?.clsChange !== undefined && comparisonData.clsChange !== 0 && (
                        <div className="flex items-center gap-1">
                          {comparisonData.clsChange < 0 ? (
                            <>
                              <TrendingDown className="h-4 w-4 text-green-500" />
                              <p className="text-sm font-medium text-green-500">
                                {Math.abs(comparisonData.clsChange).toFixed(3)} ổn định hơn
                              </p>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-4 w-4 text-red-500" />
                              <p className="text-sm font-medium text-red-500">
                                +{comparisonData.clsChange.toFixed(3)} kém ổn định hơn
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* TBT Card */}
                    <div className="flex flex-col gap-2 rounded-xl p-6 border border-border bg-card">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getScoreColor('TBT', scores.TBT).replace('text-', 'bg-')}`}></div>
                        <p className="text-sm font-medium text-muted-foreground">TBT (Total Blocking Time)</p>
                      </div>
                      <p className="text-4xl font-bold">{Math.round(scores.TBT)}<span className="text-lg text-muted-foreground ml-1">ms</span></p>
                      {comparisonData?.tbtChange !== undefined && comparisonData.tbtChange !== 0 && (
                        <div className="flex items-center gap-1">
                          {comparisonData.tbtChange < 0 ? (
                            <>
                              <TrendingDown className="h-4 w-4 text-green-500" />
                              <p className="text-sm font-medium text-green-500">
                                {Math.abs(comparisonData.tbtChange).toFixed(0)}ms ít hơn
                              </p>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-4 w-4 text-red-500" />
                              <p className="text-sm font-medium text-red-500">
                                +{comparisonData.tbtChange.toFixed(0)}ms nhiều hơn
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Speed Index Card */}
                    <div className="flex flex-col gap-2 rounded-xl p-6 border border-border bg-card">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getScoreColor('SI', scores.SpeedIndex).replace('text-', 'bg-')}`}></div>
                        <p className="text-sm font-medium text-muted-foreground">SI (Speed Index)</p>
                      </div>
                      <p className="text-4xl font-bold">{Math.round(scores.SpeedIndex)}<span className="text-lg text-muted-foreground ml-1">ms</span></p>
                      {comparisonData?.siChange !== undefined && comparisonData.siChange !== 0 && (
                        <div className="flex items-center gap-1">
                          {comparisonData.siChange < 0 ? (
                            <>
                              <TrendingDown className="h-4 w-4 text-green-500" />
                              <p className="text-sm font-medium text-green-500">
                                {Math.abs(comparisonData.siChange).toFixed(0)}ms nhanh hơn
                              </p>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-4 w-4 text-red-500" />
                              <p className="text-sm font-medium text-red-500">
                                +{comparisonData.siChange.toFixed(0)}ms chậm hơn
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* TTI Card */}
                    <div className="flex flex-col gap-2 rounded-xl p-6 border border-border bg-card">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getScoreColor('TTI', scores.TimeToInteractive).replace('text-', 'bg-')}`}></div>
                        <p className="text-sm font-medium text-muted-foreground">TTI (Time to Interactive)</p>
                      </div>
                      <p className="text-4xl font-bold">{Math.round(scores.TimeToInteractive)}<span className="text-lg text-muted-foreground ml-1">ms</span></p>
                      {comparisonData?.ttiChange !== undefined && comparisonData.ttiChange !== 0 && (
                        <div className="flex items-center gap-1">
                          {comparisonData.ttiChange < 0 ? (
                            <>
                              <TrendingDown className="h-4 w-4 text-green-500" />
                              <p className="text-sm font-medium text-green-500">
                                {Math.abs(comparisonData.ttiChange).toFixed(0)}ms nhanh hơn
                              </p>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-4 w-4 text-red-500" />
                              <p className="text-sm font-medium text-red-500">
                                +{comparisonData.ttiChange.toFixed(0)}ms chậm hơn
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* --- BẢNG THÔNG TIN 1 --- */}
              <Card>
                <CardHeader>
                  <CardTitle>Bảng thông tin 1: Đánh giá chung (AI)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Đánh giá chung</h4>
                    <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md mt-1">
                      {currentAnalysis.analysisCache.generalAssessment}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Đề xuất</h4>
                    <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md mt-1">
                      {currentAnalysis.analysisCache.suggestion}
                    </p>
                  </div>
                </CardContent>
                {/* SỬA: Nút chỉ hiển thị nếu showDeepDive = false */}
                {!showDeepDive && (
                  <CardFooter>
                    <Button
                      className="ml-auto"
                      onClick={handleGenerateDeepDive}
                      disabled={generateDeepDiveMutation.isPending}
                    >
                      {generateDeepDiveMutation.isPending ? "Đang tải..." : "Phân tích chuyên sâu"}
                    </Button>
                  </CardFooter>
                )}
              </Card>

              {/* --- BẢNG THÔNG TIN 2 (ẨN/HIỆN) --- */}
              {(fetchDeepDiveMutation.isPending || generateDeepDiveMutation.isPending || (showDeepDive && deepDiveAnalysis)) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Bảng thông tin 2: Phân tích chuyên sâu (Elements)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(fetchDeepDiveMutation.isPending || generateDeepDiveMutation.isPending) && <p>Đang tải dữ liệu chuyên sâu...</p>}

                    {deepDiveAnalysis && deepDiveAnalysis.length > 0 && (
                      <ScrollArea className="max-h-[600px] overflow-auto border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>TagName</TableHead>
                              <TableHead>OuterHTML</TableHead>
                              <TableHead>Mô tả</TableHead>
                              <TableHead>Khuyến nghị (AI)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {deepDiveAnalysis.map(item => (
                              <TableRow key={item.elementID}>
                                <TableCell><code className="text-xs">{item.tagName}</code></TableCell>
                                <TableCell><pre className="text-xs bg-muted p-1 rounded max-w-xs overflow-x-auto"><code>{item.outerHTML}</code></pre></TableCell>
                                <TableCell className="text-xs">
                                  {typeof item.description === 'string' ? item.description : (item.description ? "Có vấn đề" : "Đã tối ưu")}
                                </TableCell>
                                <TableCell className="text-xs font-medium text-blue-600">
                                  {typeof item.aiRecommendation === 'string' ? item.aiRecommendation : "Đã phân tích, không cần điều chỉnh"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    )}
                    {deepDiveAnalysis && deepDiveAnalysis.length === 0 && !fetchDeepDiveMutation.isPending && (
                      <p className="text-sm text-muted-foreground">Không tìm thấy chi tiết element nào.</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
