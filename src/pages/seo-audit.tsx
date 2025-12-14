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
  PerformanceHistoryResponse,
  MetaDataAnalysis
} from "@/features/seo-audit/types";

import {
  analyzeWebsite,
  updateWebsiteAnalysis,
  fetchExistingElements,
  generateDeepDiveAnalysis,
  fetchPerformanceHistory,
  fetchSingleReport,
  fetchComparisonResult,
  batchFixIssues
} from "@/features/seo-audit/api";

// Element suggestion type from feature modules
import type { ElementSuggestion, BatchFixPayload } from "@/features/seo-audit/types";


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

    // BR-21: Strict URL Validation
    const urlRegex = /^(https?:\/\/)/i;
    if (!urlRegex.test(url)) {
      toast({
        title: "Lỗi định dạng",
        description: "URL phải bắt đầu bằng http:// hoặc https:// (VD: https://google.com)",
        variant: "destructive"
      });
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
    const cacheId = currentAnalysis.analysisCache.analysisCacheID;

    // Chạy API Element
    generateDeepDiveMutation.mutate(cacheId);
  };

  const handleLoadFromHistory = (scanHistoryID: number) => {
    singleReportMutation.mutate(scanHistoryID);
  }

  // --- Auto Fix State ---
  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");

  // Mutation: Batch Fix
  const batchFixMutation = useMutation({
    mutationFn: batchFixIssues,
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "Đã sửa lỗi thành công!",
          description: `Đã sửa ${response.data.fixedCount}/${response.data.totalIssues} lỗi.`,
        });
        if (response.data.pullRequestUrl) {
          // Option to open PR or just show link
          console.log("PR URL:", response.data.pullRequestUrl);
          window.open(response.data.pullRequestUrl, '_blank');
        }
      } else {
        toast({ title: "Sửa lỗi thất bại", description: response.message, variant: "destructive" });
      }
    },
    onError: (error) => {
      toast({ title: "Lỗi Auto Fix", description: error.message, variant: "destructive" });
    }
  });

  const handleBatchFix = () => {
    if (!currentAnalysis?.analysisCache?.analysisCacheID) return;
    if (!repoOwner || !repoName) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng nhập Repo Owner và Repo Name.", variant: "destructive" });
      return;
    }

    const payload: BatchFixPayload = {
      analysisCacheId: currentAnalysis.analysisCache.analysisCacheID,
      repoOwner,
      repoName,
      createSinglePR: true,
      useForkPR: true
    };
    batchFixMutation.mutate(payload);
  };

  // --- JSX (Render UI) ---
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-black py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Mở Khóa Tiềm Năng Website Của Bạn
          </h1>
          <p className="text-lg text-slate-300">
            Nhập URL để nhận phân tích SEO toàn diện với khuyến nghị được hỗ trợ bởi AI
          </p>

          {/* URL Input */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mt-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="url-input"
                placeholder="Nhập địa chỉ website của bạn"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-12 h-12 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={analysisMutation.isPending}
              className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {analysisMutation.isPending ? "Đang phân tích..." : "Phân Tích Website"}
            </Button>
          </div>

          {/* Device Strategy Selector */}
          <div className="flex items-center gap-3 justify-center mt-4">
            <span className="text-sm text-slate-400">Thiết bị:</span>
            <Select value={strategy} onValueChange={(value: "desktop" | "mobile") => setStrategy(value)}>
              <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="desktop" className="text-white">
                  <div className="flex items-center gap-2">
                    <Laptop className="h-4 w-4" /> Desktop
                  </div>
                </SelectItem>
                <SelectItem value="mobile" className="text-white">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" /> Mobile
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left Column: Performance Score Circle */}
          {currentAnalysis && scores && !analysisMutation.isPending && !updateAnalysisMutation.isPending && (
            <div className="lg:col-span-1">
              <Card className="bg-slate-900 border-slate-800 sticky top-6">
                <CardHeader>
                  <CardTitle className="text-white text-center">Điểm Tổng Thể</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-slate-700"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - scores.PerformanceScore / 100)}`}
                        className={getScoreColor('PerformanceScore', scores.PerformanceScore)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-5xl font-bold ${getScoreColor('PerformanceScore', scores.PerformanceScore)}`}>
                        {Math.round(scores.PerformanceScore)}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">/ 100</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mt-4 text-center">Điểm Hiệu Suất</p>
                  {comparisonData?.scoreChange !== undefined && comparisonData.scoreChange !== 0 && (
                    <div className={`flex items-center gap-1 mt-2 ${comparisonData.scoreChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {comparisonData.scoreChange > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">
                        {comparisonData.scoreChange > 0 ? '+' : ''}{comparisonData.scoreChange.toFixed(0)} so với lần trước
                      </span>
                    </div>
                  )}
                  <div className="mt-4 text-center text-xs text-slate-400">
                    {new Date(currentAnalysis.scanTime).toLocaleString('vi-VN')}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                    onClick={handleUpdateAnalysis}
                    disabled={updateAnalysisMutation.isPending}
                  >
                    <RefreshCcw className={`h-3 w-3 mr-2 ${updateAnalysisMutation.isPending ? 'animate-spin' : ''}`} />
                    {updateAnalysisMutation.isPending ? "Đang cập nhật..." : "Cập Nhật Kết Quả"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Center Column: Metrics and Analysis */}
          <div className={currentAnalysis && scores ? "lg:col-span-2 space-y-6" : "lg:col-span-3 space-y-6"}>
            {!currentAnalysis && !analysisMutation.isPending && (
              <Card className="bg-slate-900 border-slate-800 flex items-center justify-center min-h-[400px]">
                <p className="text-slate-400 text-center">
                  👆 Nhập URL ở trên để phân tích website của bạn<br />
                  hoặc chọn một báo cáo từ lịch sử →
                </p>
              </Card>
            )}

            {(analysisMutation.isPending || updateAnalysisMutation.isPending) && (
              <Card className="bg-slate-900 border-slate-800 min-h-[400px] p-6 space-y-4 relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/50 backdrop-blur-sm rounded-xl">
                  <div className="flex flex-col items-center gap-2 p-4 bg-slate-800/90 rounded-lg border border-slate-700 shadow-lg">
                    <p className="text-lg font-medium text-white animate-pulse">Đang phân tích website...</p>
                    <p className="text-sm text-slate-400">Hệ thống đang thu thập dữ liệu từ Google PageSpeed Insights.</p>
                    <p className="text-xs text-blue-400 font-medium mt-1">Ước tính thời gian: 1-3 phút</p>
                  </div>
                </div>
                {/* Background Skeletons */}
                <Skeleton className="h-8 w-1/2 bg-slate-800" />
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Skeleton className="h-32 bg-slate-800" />
                  <Skeleton className="h-32 bg-slate-800" />
                  <Skeleton className="h-32 bg-slate-800" />
                  <Skeleton className="h-32 bg-slate-800" />
                </div>
              </Card>
            )}

            {currentAnalysis && scores && !analysisMutation.isPending && !updateAnalysisMutation.isPending && (
              <>
                {/* Metrics Grid */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Chỉ Số Web Cốt Lõi</CardTitle>
                    <CardDescription className="text-slate-400">
                      6 chỉ số quan trọng cho <strong>{currentAnalysis.analysisCache.strategy}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {/* LCP */}
                      <div className="flex flex-col gap-2 rounded-lg p-4 bg-slate-800 border border-slate-700">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getScoreColor('LCP', scores.LCP).replace('text-', 'bg-')}`}></div>
                          <p className="text-xs font-medium text-slate-400">LCP</p>
                        </div>
                        <p className="text-2xl font-bold text-white">{Math.round(scores.LCP)}<span className="text-sm text-slate-400 ml-1">ms</span></p>
                        {comparisonData?.lcpChange !== undefined && comparisonData.lcpChange !== 0 && (
                          <div className={`flex items-center gap-1 text-xs ${comparisonData.lcpChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {comparisonData.lcpChange < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                            <span>{Math.abs(comparisonData.lcpChange).toFixed(0)}ms</span>
                          </div>
                        )}
                      </div>

                      {/* FCP */}
                      <div className="flex flex-col gap-2 rounded-lg p-4 bg-slate-800 border border-slate-700">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getScoreColor('FCP', scores.FCP).replace('text-', 'bg-')}`}></div>
                          <p className="text-xs font-medium text-slate-400">FCP</p>
                        </div>
                        <p className="text-2xl font-bold text-white">{Math.round(scores.FCP)}<span className="text-sm text-slate-400 ml-1">ms</span></p>
                        {comparisonData?.fcpChange !== undefined && comparisonData.fcpChange !== 0 && (
                          <div className={`flex items-center gap-1 text-xs ${comparisonData.fcpChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {comparisonData.fcpChange < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                            <span>{Math.abs(comparisonData.fcpChange).toFixed(0)}ms</span>
                          </div>
                        )}
                      </div>

                      {/* CLS */}
                      <div className="flex flex-col gap-2 rounded-lg p-4 bg-slate-800 border border-slate-700">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getScoreColor('CLS', scores.CLS).replace('text-', 'bg-')}`}></div>
                          <p className="text-xs font-medium text-slate-400">CLS</p>
                        </div>
                        <p className="text-2xl font-bold text-white">{scores.CLS.toFixed(3)}</p>
                        {comparisonData?.clsChange !== undefined && comparisonData.clsChange !== 0 && (
                          <div className={`flex items-center gap-1 text-xs ${comparisonData.clsChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {comparisonData.clsChange < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                            <span>{Math.abs(comparisonData.clsChange).toFixed(3)}</span>
                          </div>
                        )}
                      </div>

                      {/* TBT */}
                      <div className="flex flex-col gap-2 rounded-lg p-4 bg-slate-800 border border-slate-700">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getScoreColor('TBT', scores.TBT).replace('text-', 'bg-')}`}></div>
                          <p className="text-xs font-medium text-slate-400">TBT</p>
                        </div>
                        <p className="text-2xl font-bold text-white">{Math.round(scores.TBT)}<span className="text-sm text-slate-400 ml-1">ms</span></p>
                        {comparisonData?.tbtChange !== undefined && comparisonData.tbtChange !== 0 && (
                          <div className={`flex items-center gap-1 text-xs ${comparisonData.tbtChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {comparisonData.tbtChange < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                            <span>{Math.abs(comparisonData.tbtChange).toFixed(0)}ms</span>
                          </div>
                        )}
                      </div>

                      {/* SI */}
                      <div className="flex flex-col gap-2 rounded-lg p-4 bg-slate-800 border border-slate-700">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getScoreColor('SI', scores.SpeedIndex).replace('text-', 'bg-')}`}></div>
                          <p className="text-xs font-medium text-slate-400">Speed Index</p>
                        </div>
                        <p className="text-2xl font-bold text-white">{Math.round(scores.SpeedIndex)}<span className="text-sm text-slate-400 ml-1">ms</span></p>
                        {comparisonData?.siChange !== undefined && comparisonData.siChange !== 0 && (
                          <div className={`flex items-center gap-1 text-xs ${comparisonData.siChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {comparisonData.siChange < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                            <span>{Math.abs(comparisonData.siChange).toFixed(0)}ms</span>
                          </div>
                        )}
                      </div>

                      {/* TTI */}
                      <div className="flex flex-col gap-2 rounded-lg p-4 bg-slate-800 border border-slate-700">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getScoreColor('TTI', scores.TimeToInteractive).replace('text-', 'bg-')}`}></div>
                          <p className="text-xs font-medium text-slate-400">TTI</p>
                        </div>
                        <p className="text-2xl font-bold text-white">{Math.round(scores.TimeToInteractive)}<span className="text-sm text-slate-400 ml-1">ms</span></p>
                        {comparisonData?.ttiChange !== undefined && comparisonData.ttiChange !== 0 && (
                          <div className={`flex items-center gap-1 text-xs ${comparisonData.ttiChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {comparisonData.ttiChange < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                            <span>{Math.abs(comparisonData.ttiChange).toFixed(0)}ms</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Assessment */}
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Nhận Xét Từ AI</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Đánh Giá Chung</h4>
                      <p className="text-sm text-slate-300 bg-slate-800 p-3 rounded-md">
                        {currentAnalysis.analysisCache.generalAssessment}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Khuyến Nghị</h4>
                      <p className="text-sm text-slate-300 bg-slate-800 p-3 rounded-md">
                        {currentAnalysis.analysisCache.suggestion}
                      </p>
                    </div>
                  </CardContent>
                  {/* Hiển thị nút khi chưa có AI suggestions */}
                  {!showDeepDive && (
                    <CardFooter className="border-t border-slate-800">
                      <Button
                        className="ml-auto bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleGenerateDeepDive}
                        disabled={generateDeepDiveMutation.isPending}
                      >
                        {generateDeepDiveMutation.isPending ? "Đang phân tích..." : "Phân Tích Chuyên Sâu"}
                      </Button>
                    </CardFooter>
                  )}
                </Card>

                {/* Deep Dive Analysis */}
                {(fetchDeepDiveMutation.isPending || generateDeepDiveMutation.isPending || showDeepDive) && (
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">Phân Tích Chi Tiết</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(fetchDeepDiveMutation.isPending || generateDeepDiveMutation.isPending) && (
                        <p className="text-slate-400">Đang phân tích các phần tử trang...</p>
                      )}

                      {deepDiveAnalysis && deepDiveAnalysis.length > 0 && (
                        <div className="space-y-6">
                          {/* Element Cards */}
                          <div className="h-[500px] overflow-y-auto space-y-4 pr-2">
                            {deepDiveAnalysis.map((item, index) => (
                              <div key={item.elementID || index} className="border border-slate-700 rounded-lg overflow-hidden bg-slate-950">
                                {/* Top Row: 4 columns */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-b border-slate-700">
                                  {/* ID Audit */}
                                  <div className="p-3 border-b md:border-b-0 md:border-r border-slate-700">
                                    <p className="text-xs text-slate-400 mb-1">ID Audit</p>
                                    <code className="text-sm text-blue-400 font-medium break-all">{item.auditId || "N/A"}</code>
                                  </div>

                                  {/* Tiêu đề */}
                                  <div className="p-3 border-b md:border-b-0 md:border-r border-slate-700">
                                    <p className="text-xs text-slate-400 mb-1">Tiêu đề</p>
                                    <p className="text-sm text-slate-200 font-semibold">{item.title}</p>
                                  </div>

                                  {/* Mô tả */}
                                  <div className="p-3 border-b md:border-b-0 md:border-r border-slate-700">
                                    <p className="text-xs text-slate-400 mb-1">Mô tả</p>
                                    <p className="text-sm text-slate-300">{item.description}</p>
                                  </div>

                                  {/* Mục tiêu (Formerly Evidence) */}
                                  <div className="p-3">
                                    <p className="text-xs text-slate-400 mb-1">Mục tiêu</p>
                                    {item.extractedEvidenceJson ? (
                                      <ScrollArea className="h-20 w-full rounded border border-slate-800 bg-slate-900 p-2">
                                        <code className="text-[10px] text-slate-400 block whitespace-pre-wrap font-mono">
                                          {item.extractedEvidenceJson}
                                        </code>
                                      </ScrollArea>
                                    ) : (
                                      <span className="text-xs text-slate-500 italic">Không có dữ liệu</span>
                                    )}
                                  </div>
                                </div>

                                {/* Bottom Row: Khuyến Nghị full width */}
                                <div className="p-3 bg-slate-800/30">
                                  <p className="text-xs text-slate-400 mb-1">Khuyến Nghị AI</p>
                                  {item.aiRecommendation ? (
                                    <p className="text-sm text-green-400 font-medium whitespace-pre-wrap">{item.aiRecommendation}</p>
                                  ) : (
                                    <span className="text-sm text-slate-500 italic">Chưa có khuyến nghị</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Auto Fix Section */}
                          <div className="border-t border-slate-800 pt-6 mt-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Tự động sửa lỗi (Auto Fix)</h3>

                            {/* Instructions */}
                            <div className="mb-6 p-4 rounded-lg bg-blue-950/20 border border-blue-900/30">
                              <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                                <div>
                                  <h4 className="text-sm font-semibold text-blue-300 mb-1">Hướng dẫn lấy thông tin Repository</h4>
                                  <p className="text-xs text-slate-300 mb-3">
                                    Để sử dụng tính năng tự động sửa lỗi, bạn cần cung cấp tên người dùng GitHub (Owner) và tên dự án (Repository Name).
                                  </p>
                                  {/* Placeholder for Video/Image */}
                                  <div className="aspect-video w-full max-w-md bg-black rounded border border-slate-800 overflow-hidden">
                                    <iframe
                                      width="100%"
                                      height="100%"
                                      src="https://www.youtube.com/embed/1xLNbEQ8haY"
                                      title="YouTube video player"
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                      allowFullScreen
                                    ></iframe>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 items-end">
                              <div className="space-y-2 flex-1 w-full">
                                <label className="text-sm text-slate-400">Github Username (Repo Owner)</label>
                                <Input
                                  value={repoOwner}
                                  onChange={(e) => setRepoOwner(e.target.value)}
                                  className="bg-slate-900 border-slate-700 text-white"
                                  placeholder="VD: GiaHeplBro"
                                />
                              </div>
                              <div className="space-y-2 flex-1 w-full">
                                <label className="text-sm text-slate-400">Repository Name</label>
                                <Input
                                  value={repoName}
                                  onChange={(e) => setRepoName(e.target.value)}
                                  className="bg-slate-900 border-slate-700 text-white"
                                  placeholder="VD: docs"
                                />
                              </div>
                              <Button
                                onClick={handleBatchFix}
                                disabled={batchFixMutation.isPending}
                                className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
                              >
                                {batchFixMutation.isPending ? "Đang xử lý..." : "Tự Động Sửa Lỗi"}
                              </Button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                              * Hệ thống sẽ tự động tạo Pull Request với các bản sửa lỗi được đề xuất trên kho lưu trữ Github của bạn.
                            </p>
                          </div>
                        </div>
                      )}
                      {deepDiveAnalysis && deepDiveAnalysis.length === 0 && !fetchDeepDiveMutation.isPending && !generateDeepDiveMutation.isPending && (
                        <p className="text-sm text-slate-400">Không tìm thấy chi tiết phần tử nào.</p>
                      )}
                      {!deepDiveAnalysis && !fetchDeepDiveMutation.isPending && !generateDeepDiveMutation.isPending && (
                        <p className="text-sm text-slate-400">Chưa có dữ liệu phân tích phần tử. Nhấn "Phân Tích Chuyên Sâu" để bắt đầu.</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

          </div>

          {/* Right Column: History Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-900 border-slate-800 sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <History className="h-5 w-5" /> Lịch Sử
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {historyQuery.isLoading && <p className="text-slate-400">Đang tải lịch sử...</p>}
                  {historyQuery.data && historyQuery.data.data && historyQuery.data.data.items.length > 0 ? (
                    <div className="space-y-2">
                      {historyQuery.data.data.items.map((item: HistoryItem) => (
                        <div
                          key={item.scanHistoryID}
                          className="p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-blue-500 cursor-pointer transition-colors"
                          onClick={() => handleLoadFromHistory(item.scanHistoryID)}
                        >
                          <p className="font-semibold text-sm text-white truncate">{item.analysisCache.normalizedUrl}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(item.scanTime).toLocaleString('vi-VN')}</p>
                          {singleReportMutation.isPending && singleReportMutation.variables === item.scanHistoryID && (
                            <p className="text-xs text-blue-400 mt-1">Đang tải...</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    !historyQuery.isLoading && <p className="text-sm text-slate-400 text-center py-4">Chưa có lịch sử</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
