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
import { History, Smartphone, Laptop, Search, RefreshCcw } from "lucide-react";

// --- Import from feature modules ---
import type {
  PerformanceHistoryPayload,
  UpdatePerformanceHistoryPayload,
  PageSpeedScores,
  ComparisonModel,
  PerformanceHistoryResponse,
  ElementSuggestion,
  HistoryItem
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

import { MetricsGrid } from "@/features/seo-audit/components/MetricsGrid";


// --- Component chính ---
// --- Component chính ---

export default function ContentOptimization() {
  // --- States ---
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState<"desktop" | "mobile">("desktop");

  const [currentAnalysis, setCurrentAnalysis] = useState<PerformanceHistoryResponse | null>(null);
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

  // Query 1: Lấy lịch sử (API 4)
  const historyQuery = useQuery({
    queryKey: ['performanceHistory', userId],
    queryFn: () => fetchPerformanceHistory(userId),
    enabled: !!userId,
  });

  // Mutation 1: Chạy phân tích (API 1)
  const analysisMutation = useMutation({
    mutationFn: analyzeWebsite,
    onSuccess: async (data) => {
      toast({ title: "Phân tích hoàn tất!", description: "Đã tải xong kết quả." });
      setCurrentAnalysis(data);
      setDeepDiveAnalysis(null);
      setShowDeepDive(false);
      setComparisonData(null);
      queryClient.invalidateQueries({ queryKey: ['performanceHistory', userId] });

      // Tải dữ liệu so sánh
      if (data.analysisCache.analysisCacheID) {
        try {
          const comparisonResult = await fetchComparisonResult(data.analysisCache.analysisCacheID);
          if (comparisonResult.data.comparisonModel) {
            setComparisonData(comparisonResult.data.comparisonModel);
          }
        } catch (error) {
          console.error("Không tải được dữ liệu so sánh:", error);
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
    onSuccess: async (data) => {
      toast({ title: "Cập nhật thành công!", description: "Kết quả phân tích đã được làm mới." });
      setCurrentAnalysis(data);
      setDeepDiveAnalysis(null);
      setShowDeepDive(false);
      queryClient.invalidateQueries({ queryKey: ['performanceHistory', userId] });

      // Tải dữ liệu so sánh
      if (data.analysisCache.analysisCacheID) {
        try {
          const comparisonResult = await fetchComparisonResult(data.analysisCache.analysisCacheID);
          if (comparisonResult.data.comparisonModel) {
            setComparisonData(comparisonResult.data.comparisonModel);
          }
        } catch (error) {
          console.error("Không tải được dữ liệu so sánh:", error);
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
      setDeepDiveAnalysis(data);
      // Khi chạy POST, dữ liệu trả về chắc chắn đã có AI Suggestion
      // nên ta có thể set showDeepDive = true luôn.
      // Tuy nhiên, để an toàn (trường hợp POST trả về element rỗng), ta vẫn set.
      setShowDeepDive(true);
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
      // SỬA: Logic hiển thị mới
      // Nếu có dữ liệu Element trả về (dù có suggestion hay chưa) -> LƯU VÀO STATE
      if (data && data.length > 0) {
        setDeepDiveAnalysis(data);

        // Kiểm tra xem đã có aiRecommendation nào chưa
        // Nếu CÓ ít nhất 1 cái -> Hiển thị Bảng 2 (đã chạy chuyên sâu)
        // Nếu KHÔNG có cái nào -> Ẩn Bảng 2 (chưa chạy chuyên sâu) -> Để hiện nút
        const hasAnalysis = data.some(item => item.aiRecommendation || item.description);

        setShowDeepDive(hasAnalysis);
      } else {
        // Nếu không có element nào -> Chưa chạy -> Ẩn bảng 2
        setShowDeepDive(false);
      }
    },
    onError: (error) => {
      console.error("Không tìm thấy phân tích chuyên sâu (an toàn):", error);
    },
  });

  // Mutation 4: Tải 1 báo cáo từ lịch sử (API 5)
  const singleReportMutation = useMutation<PerformanceHistoryResponse, Error, number>({
    mutationFn: fetchSingleReport,
    onSuccess: async (data) => {
      setCurrentAnalysis(data);
      setDeepDiveAnalysis(null);
      setShowDeepDive(false);
      setComparisonData(null);
      toast({ title: "Đã tải báo cáo", description: "Đã tải kết quả từ lịch sử." });
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (data.analysisCache.analysisCacheID) {
        fetchDeepDiveMutation.mutate(data.analysisCache.analysisCacheID);

        // Tải dữ liệu so sánh
        try {
          const comparisonResult = await fetchComparisonResult(data.analysisCache.analysisCacheID);
          if (comparisonResult.data.comparisonModel) {
            setComparisonData(comparisonResult.data.comparisonModel);
          }
        } catch (error) {
          console.error("Không tải được dữ liệu so sánh:", error);
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
    if (!userId) {
      toast({ title: "Lỗi", description: "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.", variant: "destructive" });
      return;
    }

    const payload: PerformanceHistoryPayload = {
      userId: parseInt(userId, 10),
      url: url,
      strategy: strategy,
      featureId: 3 // SỬA: Thêm featureId: 3 vào hàm POST (Tạo mới)
    };
    analysisMutation.mutate(payload);
  };

  // Hàm xử lý nút cập nhật
  const handleUpdateAnalysis = () => {
    if (!currentAnalysis || !userId) return;

    const payload: UpdatePerformanceHistoryPayload = {
      performanceHistoryId: currentAnalysis.scanHistoryID,
      userId: parseInt(userId, 10),
      featureId: 3 // Đã có featureId: 3 cho hàm PUT (Cập nhật)
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
                  <MetricsGrid scores={scores} comparisonData={comparisonData} />
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
                                <TableCell className="text-xs">{item.description || "Đã tối ưu"}</TableCell>
                                <TableCell className="text-xs font-medium text-blue-600">{item.aiRecommendation || "Đã phân tích, không cần điều chỉnh"}</TableCell>
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
