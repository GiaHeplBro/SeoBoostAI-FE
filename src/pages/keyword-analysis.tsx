import { useState } from "react";
import { ArrowUp, History, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// --- Types ---
type ViewState = 'empty' | 'loading' | 'results';

interface KeywordData {
    keyword: string;
    searchVolume: number;
    difficulty: number;
    cpc: number;
    competition: string;
    intent: string;
    trend: boolean;
}

interface AnalysisResult {
    query: string;
    aiResponse: string;
    primaryData: KeywordData[];
    secondaryData: KeywordData[];
}

interface HistoryItem {
    id: string;
    query: string;
    timestamp: Date;
    result?: AnalysisResult;
}

// --- Mock Data ---
const MOCK_RESULT: AnalysisResult = {
    query: "tai nghe bluetooth",
    aiResponse: "Từ khóa 'tai nghe bluetooth' là một từ khóa rất có tiềm năng trong thị trường Việt Nam. Với lượng tìm kiếm hàng tháng ổn định và mức cạnh tranh trung bình, đây là cơ hội tốt để tối ưu hóa nội dung. Từ khóa này có ý định mua hàng cao, phù hợp cho các chiến dịch e-commerce. Xu hướng tìm kiếm đang tăng đặc biệt trong quý 4 hàng năm.",
    primaryData: [
        { keyword: "tai nghe bluetooth", searchVolume: 45000, difficulty: 55, cpc: 0.85, competition: "Medium", intent: "Commercial", trend: true },
        { keyword: "tai nghe bluetooth không dây", searchVolume: 33000, difficulty: 48, cpc: 0.75, competition: "Medium", intent: "Commercial", trend: true },
        { keyword: "tai nghe bluetooth giá rẻ", searchVolume: 27000, difficulty: 42, cpc: 0.65, competition: "Low", intent: "Transactional", trend: true },
        { keyword: "tai nghe bluetooth chống ồn", searchVolume: 18000, difficulty: 58, cpc: 1.20, competition: "High", intent: "Commercial", trend: true },
        { keyword: "tai nghe bluetooth sony", searchVolume: 15000, difficulty: 62, cpc: 1.50, competition: "High", intent: "Transactional", trend: false },
        { keyword: "tai nghe bluetooth apple", searchVolume: 22000, difficulty: 68, cpc: 2.10, competition: "High", intent: "Transactional", trend: true },
        { keyword: "tai nghe bluetooth samsung", searchVolume: 12000, difficulty: 54, cpc: 1.10, competition: "Medium", intent: "Transactional", trend: false },
        { keyword: "tai nghe bluetooth jbl", searchVolume: 9000, difficulty: 51, cpc: 0.95, competition: "Medium", intent: "Transactional", trend: false },
    ],
    secondaryData: [
        { keyword: "cách kết nối tai nghe bluetooth", searchVolume: 8000, difficulty: 28, cpc: 0.25, competition: "Low", intent: "Informational", trend: false },
        { keyword: "tai nghe bluetooth bị hư", searchVolume: 5000, difficulty: 22, cpc: 0.15, competition: "Low", intent: "Informational", trend: false },
        { keyword: "review tai nghe bluetooth", searchVolume: 11000, difficulty: 35, cpc: 0.45, competition: "Low", intent: "Informational", trend: true },
        { keyword: "so sánh tai nghe bluetooth", searchVolume: 7000, difficulty: 32, cpc: 0.40, competition: "Low", intent: "Commercial", trend: false },
        { keyword: "tai nghe bluetooth tốt nhất", searchVolume: 14000, difficulty: 45, cpc: 0.90, competition: "Medium", intent: "Commercial", trend: true },
        { keyword: "tai nghe bluetooth pin trâu", searchVolume: 6000, difficulty: 38, cpc: 0.55, competition: "Low", intent: "Commercial", trend: false },
    ]
};

export default function KeywordAnalysis() {
    const [viewState, setViewState] = useState<ViewState>('empty');
    const [searchQuery, setSearchQuery] = useState("");
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
    const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);

    // Handle search submission
    const handleSearch = () => {
        if (!searchQuery.trim()) return;

        // Set loading state
        setViewState('loading');

        // Simulate API call (2-3 seconds for demo, will be 2-3 min in real)
        setTimeout(() => {
            const newResult = {
                ...MOCK_RESULT,
                query: searchQuery
            };

            const newHistoryItem: HistoryItem = {
                id: Date.now().toString(),
                query: searchQuery,
                timestamp: new Date(),
                result: newResult
            };

            setHistory(prev => [newHistoryItem, ...prev]);
            setCurrentResult(newResult);
            setActiveHistoryId(newHistoryItem.id);
            setViewState('results');
            setSearchQuery("");
        }, 3000); // 3 seconds for demo
    };

    // Handle history item click
    const handleHistoryClick = (item: HistoryItem) => {
        if (item.result) {
            setCurrentResult(item.result);
            setActiveHistoryId(item.id);
            setViewState('results');
        }
    };

    // Handle new chat
    const handleNewChat = () => {
        setViewState('empty');
        setSearchQuery("");
        setActiveHistoryId(null);
        setCurrentResult(null);
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-200/10 bg-slate-900/30 p-4 flex flex-col">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-primary/20 rounded-full p-2">
                            <History className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-base font-medium text-white">Lịch sử tìm kiếm</h2>
                        </div>
                    </div>

                    {/* History List */}
                    <ScrollArea className="flex-1">
                        {history.length === 0 ? (
                            <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-slate-700 px-4 py-12 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-white text-sm font-semibold">Chưa có lịch sử</p>
                                    <p className="text-slate-400 text-xs">Các tìm kiếm của bạn sẽ xuất hiện ở đây</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {history.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleHistoryClick(item)}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${activeHistoryId === item.id
                                            ? 'bg-primary/20 text-primary'
                                            : 'text-slate-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <History className="h-4 w-4 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.query}</p>
                                            <p className="text-xs opacity-70">
                                                {item.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    {/* New Chat Button */}
                    <Button
                        onClick={handleNewChat}
                        className="mt-4 w-full flex items-center justify-center gap-2"
                        variant="default"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Tìm kiếm mới</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {viewState === 'empty' && (
                    <div className="flex flex-1 flex-col justify-center items-center p-6 h-full">
                        <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-8">
                            <h1 className="text-white text-4xl font-bold text-center">
                                Chào bạn, tôi có thể giúp gì cho bạn?
                            </h1>

                            <div className="w-full max-w-xl">
                                <div className="relative flex items-center">
                                    <Input
                                        className="w-full h-16 pr-14 text-base bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                                        placeholder="Nhập từ khóa bạn muốn phân tích..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button
                                        size="icon"
                                        className="absolute right-2 h-10 w-10 rounded-lg"
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
                            <h2 className="text-2xl font-bold text-white mb-2">Đang phân tích từ khóa...</h2>
                            <p className="text-slate-400">Quá trình này có thể mất 2-3 phút. Vui lòng chờ...</p>
                        </div>
                        <div className="w-full max-w-md space-y-2">
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary animate-pulse w-2/3"></div>
                            </div>
                            <p className="text-xs text-slate-500 text-center">Đang thu thập dữ liệu...</p>
                        </div>
                    </div>
                )}

                {viewState === 'results' && currentResult && (
                    <div className="p-6 md:p-8 lg:p-12">
                        <div className="mx-auto max-w-4xl flex flex-col gap-6">
                            {/* Page Heading */}
                            <h1 className="text-4xl font-black text-white">{currentResult.query}</h1>

                            {/* Card 1: User Question */}
                            <Card className="border-slate-200/10 bg-white/5">
                                <CardHeader>
                                    <CardTitle className="text-primary">Câu hỏi của bạn</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-300">
                                        Phân tích từ khóa: <span className="font-semibold text-white">{currentResult.query}</span>
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Card 2: AI Response */}
                            <Card className="border-slate-200/10 bg-white/5">
                                <CardHeader>
                                    <CardTitle className="text-primary">Phân tích từ AI</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-300 leading-relaxed">{currentResult.aiResponse}</p>
                                </CardContent>
                            </Card>

                            {/* Card 3: Primary Data Table */}
                            <Card className="border-slate-200/10 bg-white/5">
                                <CardHeader>
                                    <CardTitle className="text-primary">Từ khóa chính</CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Các từ khóa có liên quan trực tiếp với mục đích thương mại
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[400px] w-full rounded-md border border-slate-700 p-4">
                                        <div className="space-y-4">
                                            {currentResult.primaryData.map((item, idx) => (
                                                <div key={idx} className="border-b border-slate-700 pb-4 last:border-0">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h4 className="font-semibold text-white">{item.keyword}</h4>
                                                        {item.trend && <Badge variant="outline" className="text-green-500">Trending</Badge>}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-slate-400">Search Volume:</span>
                                                            <span className="ml-2 text-white font-medium">{item.searchVolume.toLocaleString()}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400">Difficulty:</span>
                                                            <span className="ml-2 text-white font-medium">{item.difficulty}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400">CPC:</span>
                                                            <span className="ml-2 text-white font-medium">${item.cpc}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400">Competition:</span>
                                                            <Badge variant={item.competition === "High" ? "destructive" : item.competition === "Medium" ? "secondary" : "outline"} className="ml-2">
                                                                {item.competition}
                                                            </Badge>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="text-slate-400">Intent:</span>
                                                            <Badge variant="outline" className="ml-2">{item.intent}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            {/* Card 4: Secondary Data Table */}
                            <Card className="border-slate-200/10 bg-white/5">
                                <CardHeader>
                                    <CardTitle className="text-primary">Từ khóa bổ sung</CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Các từ khóa liên quan với mục đích thông tin và nghiên cứu
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[400px] w-full rounded-md border border-slate-700 p-4">
                                        <div className="space-y-4">
                                            {currentResult.secondaryData.map((item, idx) => (
                                                <div key={idx} className="border-b border-slate-700 pb-4 last:border-0">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h4 className="font-semibold text-white">{item.keyword}</h4>
                                                        {item.trend && <Badge variant="outline" className="text-green-500">Trending</Badge>}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-slate-400">Search Volume:</span>
                                                            <span className="ml-2 text-white font-medium">{item.searchVolume.toLocaleString()}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400">Difficulty:</span>
                                                            <span className="ml-2 text-white font-medium">{item.difficulty}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400">CPC:</span>
                                                            <span className="ml-2 text-white font-medium">${item.cpc}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400">Competition:</span>
                                                            <Badge variant={item.competition === "High" ? "destructive" : item.competition === "Medium" ? "secondary" : "outline"} className="ml-2">
                                                                {item.competition}
                                                            </Badge>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="text-slate-400">Intent:</span>
                                                            <Badge variant="outline" className="ml-2">{item.intent}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
