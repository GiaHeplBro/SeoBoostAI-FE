import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// SỬA: Dùng nháy đơn chuẩn
import { jwtDecode } from 'jwt-decode';
// SỬA: Thử đường dẫn tương đối cùng thư mục (nếu file này nằm ở root src)
import api from '@/axiosInstance';

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
// Đảm bảo RefreshCcw đã được import
import { History, Smartphone, Laptop, Search, Info, RefreshCcw } from "lucide-react";

// --- 1. Định nghĩa các kiểu dữ liệu (Types) ---

// Payload cho API 1 (Phân tích - POST)
interface PerformanceHistoryPayload {
  userId: number;
  url: string;
  strategy: "desktop" | "mobile";
}

// Payload cho API Update (Phân tích lại - PUT)
interface UpdatePerformanceHistoryPayload {
  performanceHistoryId: number;
  userId: number;
}

// Các điểm số (bên trong `pageSpeedResponse` đã được parse)
interface PageSpeedScores {
  PerformanceScore: number;
  FCP: number;
  LCP: number;
  CLS: number;
  TBT: number;
  SpeedIndex: number;
  TimeToInteractive: number;
}

// Dữ liệu cache (trong response API 1)
interface AnalysisCache {
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
interface PerformanceHistoryResponse {
  scanHistoryID: number;
  userID: number;
  analysisCacheID: number;
  scanTime: string;
  analysisCache: AnalysisCache;
}

// Response từ API 2 (Chuyên sâu)
interface ElementSuggestion {
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
interface HistoryApiResponse {
  totalItems: number;
  totalPages: number;
  pageSize: number;
  items: PerformanceHistoryResponse[]; // Mảng items
}

// Kiểu dữ liệu cho một mục trong danh sách
type HistoryItem = PerformanceHistoryResponse;


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
  switch(metric) {
    case 'CLS':
      return '';
    case 'PerformanceScore':
      return '';
    default:
      return 'ms';
  }
}

const getMetricInfo = (metric: string) => {
  switch(metric) {
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
const PerformanceScoreCircle = ({ metric, score }: { metric: string, score: number }) => {
  const roundedScore = Math.round(score);
  const colorClass = getScoreColor(metric as keyof typeof METRIC_THRESHOLDS, metric === 'CLS' ? score : roundedScore);
  const unit = getMetricUnit(metric);
  const info = getMetricInfo(metric);
  const displayScore = metric === 'CLS' ? score.toFixed(2) : roundedScore;

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
          </div>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
};


// --- 4. Các hàm gọi API ---

// API 1: Phân tích URL (POST)
const analyzeWebsite = async (payload: PerformanceHistoryPayload): Promise<PerformanceHistoryResponse> => {
  const { data } = await api.post('/performance-histories', payload);
  return data;
};

// API UPDATE: Chạy lại phân tích (PUT)
const updateWebsiteAnalysis = async (payload: UpdatePerformanceHistoryPayload): Promise<PerformanceHistoryResponse> => {
  const { data } = await api.put('/performance-histories', payload);
  return data;
};

// API 2: Tải Element đã có (GET)
const fetchExistingElements = async (analysisCacheID: number): Promise<ElementSuggestion[]> => {
  const { data } = await api.get(`/element/analysis/${analysisCacheID}`);
  return data;
}

// API 3: Tạo mới Element (POST)
const generateDeepDiveAnalysis = async (analysisCacheID: number): Promise<ElementSuggestion[]> => {
  const { data } = await api.post(`/element/suggestion`, analysisCacheID, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return data;
}

// API 4: Lấy lịch sử (GET List)
const fetchPerformanceHistory = async (userId: string | null): Promise<HistoryItem[]> => {
  if (!userId) return [];
  try {
    const { data } = await api.get(`/performance-histories`, {
      params: {
        CurrentPage: 1,
        PageSize: 20, 
        UserId: userId
      }
    });
    return data.items || [];
  } catch (error) {
    console.error("Lỗi khi tải lịch sử:", error);
    return []; 
  }
};

// API 5: Lấy 1 báo cáo (GET by ID)
const fetchSingleReport = async (id: number): Promise<PerformanceHistoryResponse> => {
  const { data } = await api.get(`/performance-histories/${id}`);
  return data;
};


// --- 5. Component chính ---

export default function ContentOptimization() {
  // --- States ---
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState<"desktop" | "mobile">("desktop");
  
  const [currentAnalysis, setCurrentAnalysis] = useState<PerformanceHistoryResponse | null>(null);
  const [deepDiveAnalysis, setDeepDiveAnalysis] = useState<ElementSuggestion[] | null>(null);
  const [showDeepDive, setShowDeepDive] = useState(false);

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

  // Query 1: Lấy lịch sử (API 4)
  const historyQuery = useQuery({
    queryKey: ['performanceHistory', userId],
    queryFn: () => fetchPerformanceHistory(userId),
    enabled: !!userId, 
  });

  // Mutation 1: Chạy phân tích (API 1)
  const analysisMutation = useMutation({
    mutationFn: analyzeWebsite,
    onSuccess: (data) => {
      toast({ title: "Phân tích hoàn tất!", description: "Đã tải xong kết quả." });
      setCurrentAnalysis(data);
      setDeepDiveAnalysis(null);
      setShowDeepDive(false);
      queryClient.invalidateQueries({ queryKey: ['performanceHistory', userId] });
    },
    onError: (error) => {
      toast({ title: "Lỗi phân tích", description: error.message, variant: "destructive" });
    },
  });

  // Mutation Update: Chạy lại phân tích (PUT)
  const updateAnalysisMutation = useMutation({
    mutationFn: updateWebsiteAnalysis,
    onSuccess: (data) => {
      toast({ title: "Cập nhật thành công!", description: "Kết quả phân tích đã được làm mới." });
      setCurrentAnalysis(data);
      // Reset phần chuyên sâu vì nội dung đã thay đổi
      setDeepDiveAnalysis(null); 
      setShowDeepDive(false);
      queryClient.invalidateQueries({ queryKey: ['performanceHistory', userId] });
    },
    onError: (error) => {
      toast({ title: "Lỗi cập nhật", description: error.message, variant: "destructive" });
    },
  });

  // Mutation 2: Tạo mới Element (API 3)
  const generateDeepDiveMutation = useMutation<ElementSuggestion[], Error, number>({
    mutationFn: generateDeepDiveAnalysis,
    onSuccess: (data) => {
      setDeepDiveAnalysis(data);
      setShowDeepDive(true); // Hiển thị bảng 2
      toast({ title: "Phân tích chuyên sâu hoàn tất!" });
    },
    onError: (error) => {
      toast({ title: "Lỗi phân tích chuyên sâu", description: error.message, variant: "destructive" });
    },
  });

  // Mutation 3: Tải Element đã có (API 2)
  const fetchDeepDiveMutation = useMutation<ElementSuggestion[], Error, number>({
    mutationFn: fetchExistingElements,
    onSuccess: (data) => {
      if (data && data.length > 0 && (data[0].aiRecommendation || data[0].description)) {
        setDeepDiveAnalysis(data);
        setShowDeepDive(true);
      }
    },
    onError: (error) => {
      console.error("Không tìm thấy phân tích chuyên sâu (an toàn):", error);
    },
  });

  // Mutation 4: Tải 1 báo cáo từ lịch sử (API 5)
  const singleReportMutation = useMutation<PerformanceHistoryResponse, Error, number>({
    mutationFn: fetchSingleReport,
    onSuccess: (data) => {
      setCurrentAnalysis(data);
      setDeepDiveAnalysis(null);
      setShowDeepDive(false); 
      toast({ title: "Đã tải báo cáo", description: "Đã tải kết quả từ lịch sử." });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      if (data.analysisCache.analysisCacheID) {
        fetchDeepDiveMutation.mutate(data.analysisCache.analysisCacheID);
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
    if (!userId) {
      toast({ title: "Lỗi", description: "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.", variant: "destructive" });
      return;
    }

    const payload: PerformanceHistoryPayload = {
      userId: parseInt(userId, 10),
      url: url,
      strategy: strategy
    };
    analysisMutation.mutate(payload);
  };

  // Hàm xử lý nút cập nhật
  const handleUpdateAnalysis = () => {
    if (!currentAnalysis || !userId) return;

    const payload: UpdatePerformanceHistoryPayload = {
      performanceHistoryId: currentAnalysis.scanHistoryID, 
      userId: parseInt(userId, 10)
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
                {historyQuery.data && historyQuery.data.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {historyQuery.data.map(item => (
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
              {/* --- 7 Ô ĐIỂM SỐ --- */}
              <Card>
                <CardHeader>
                  <CardTitle>Điểm hiệu suất (Core Web Vitals)</CardTitle>
                  <CardDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span>
                      Điểm số dựa trên phân tích của Google PageSpeed Insights cho <strong>{currentAnalysis.analysisCache.strategy}</strong>
                    </span>
                    
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
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap justify-center gap-2">
                  <PerformanceScoreCircle metric="PerformanceScore" score={scores.PerformanceScore} />
                  <PerformanceScoreCircle metric="LCP" score={scores.LCP} />
                  <PerformanceScoreCircle metric="FCP" score={scores.FCP} />
                  <PerformanceScoreCircle metric="CLS" score={scores.CLS} />
                  <PerformanceScoreCircle metric="TBT" score={scores.TBT} />
                  <PerformanceScoreCircle metric="SI" score={scores.SpeedIndex} />
                  <PerformanceScoreCircle metric="TTI" score={scores.TimeToInteractive} />
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
              {(fetchDeepDiveMutation.isPending || (showDeepDive && deepDiveAnalysis)) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Bảng thông tin 2: Phân tích chuyên sâu (Elements)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {fetchDeepDiveMutation.isPending && <p>Đang tải dữ liệu chuyên sâu...</p>}
                    
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
                                <TableCell className="text-xs">{item.description}</TableCell>
                                <TableCell className="text-xs font-medium text-blue-600">{item.aiRecommendation}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    )}
                    {deepDiveAnalysis && deepDiveAnalysis.length === 0 && (
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