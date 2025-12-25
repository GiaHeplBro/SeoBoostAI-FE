import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Zap, Clock, Eye, Move, Gauge, MousePointer } from "lucide-react";

// =========================================
// Header đơn giản cho trang docs
// =========================================
function DocsHeader() {
    return (
        <header className="sticky top-0 w-full bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 z-50">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="text-2xl font-bold text-white tracking-wide">
                    SEO-Boost <span className="text-primary">AI</span>
                </div>
                <Link href="/">
                    <Button
                        className="bg-gray-800 border border-gray-600 text-white hover:bg-gray-700 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Về trang chủ
                    </Button>
                </Link>
            </div>
        </header>
    );
}

// =========================================
// Footer đơn giản
// =========================================
function DocsFooter() {
    return (
        <footer className="w-full bg-gray-950 text-gray-400 py-8 border-t border-gray-800">
            <div className="container mx-auto text-center">
                <p>© {new Date().getFullYear()} SEO-Boost AI. Bảo lưu mọi quyền.</p>
                <Link href="/">
                    <span className="text-primary hover:underline cursor-pointer mt-2 inline-block">
                        Quay lại trang chủ
                    </span>
                </Link>
            </div>
        </footer>
    );
}

// =========================================
// Component hiển thị bảng đánh giá
// =========================================
interface RatingTableProps {
    good: string;
    needsImprovement: string;
    poor: string;
}

function RatingTable({ good, needsImprovement, poor }: RatingTableProps) {
    return (
        <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3 text-center">
                <div className="text-green-400 font-semibold text-sm mb-1">Tốt</div>
                <div className="text-white text-sm">{good}</div>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3 text-center">
                <div className="text-yellow-400 font-semibold text-sm mb-1">Cần cải thiện</div>
                <div className="text-white text-sm">{needsImprovement}</div>
            </div>
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 text-center">
                <div className="text-red-400 font-semibold text-sm mb-1">Kém</div>
                <div className="text-white text-sm">{poor}</div>
            </div>
        </div>
    );
}

// =========================================
// Component Card cho mỗi metric
// =========================================
interface MetricCardProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    description: string;
    formula: string;
    formulaExplanation?: string;
    ratings: RatingTableProps;
}

function MetricCard({ icon, title, subtitle, description, formula, formulaExplanation, ratings }: MetricCardProps) {
    return (
        <Card className="bg-gray-900/70 border-gray-800 hover:bg-gray-800/90 transition-all duration-300">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-3 rounded-lg">
                        {icon}
                    </div>
                    <div>
                        <CardTitle className="text-white text-xl">{title}</CardTitle>
                        <p className="text-primary text-sm font-medium">{subtitle}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-gray-300 leading-relaxed">{description}</p>

                {/* Formula Section */}
                <div className="bg-gray-950/50 border border-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-2 font-medium">Công thức:</div>
                    <div className="text-white font-mono text-lg text-center py-2 bg-gray-800/50 rounded">
                        {formula}
                    </div>
                    {formulaExplanation && (
                        <p className="text-gray-400 text-sm mt-2 italic">{formulaExplanation}</p>
                    )}
                </div>

                {/* Rating Table */}
                <RatingTable {...ratings} />
            </CardContent>
        </Card>
    );
}

// =========================================
// TRANG CHÍNH
// =========================================
export default function PerformanceAnalysisGuide() {
    const metrics: MetricCardProps[] = [
        {
            icon: <Clock className="h-6 w-6 text-primary" />,
            title: "First Contentful Paint (FCP)",
            subtitle: "Thời gian hiển thị nội dung đầu tiên",
            description: "Mốc thời gian tính từ khi người dùng bắt đầu truy cập cho đến khi trình duyệt hiển thị bất kỳ nội dung nào đầu tiên trên màn hình (văn bản, hình ảnh, SVG, v.v.). Nó trả lời câu hỏi: \"Trang web có đang hoạt động không?\".",
            formula: "FCP = T_first_render − T_navigation_start",
            ratings: {
                good: "0 - 1800ms",
                needsImprovement: "1800 - 3000ms",
                poor: "> 3000ms"
            }
        },
        {
            icon: <Eye className="h-6 w-6 text-primary" />,
            title: "Largest Contentful Paint (LCP)",
            subtitle: "Thời gian hiển thị nội dung lớn nhất",
            description: "Thời gian để phần tử nội dung lớn nhất (thường là ảnh banner chính hoặc khối văn bản lớn) hiển thị hoàn toàn. Đây là chỉ số quan trọng nhất trong Core Web Vitals. Nó trả lời câu hỏi: \"Nội dung chính đã sẵn sàng chưa?\".",
            formula: "LCP = T_largest_element_render − T_navigation_start",
            formulaExplanation: "Trình duyệt theo dõi các phần tử khi trang load. Khi phần tử lớn nhất được render xong.",
            ratings: {
                good: "0 - 2500ms",
                needsImprovement: "2500 - 4000ms",
                poor: "> 4000ms"
            }
        },
        {
            icon: <Zap className="h-6 w-6 text-primary" />,
            title: "Total Blocking Time (TBT)",
            subtitle: "Tổng thời gian ngăn chặn",
            description: "Tổng thời gian mà trang web bị \"đơ\", không thể phản hồi cú click chuột hay nhập liệu của người dùng do trình duyệt đang bận xử lý các tác vụ nặng (thường là JavaScript). TBT đo khoảng thời gian giữa FCP và TTI.",
            formula: "TBT = Σ (Duration_task − 50ms)",
            formulaExplanation: "Là tổng thời gian của tất cả các \"Tác vụ dài\" (Long Task - tác vụ chạy > 50ms). Chỉ tính phần thời gian vượt quá 50ms.",
            ratings: {
                good: "0 - 200ms",
                needsImprovement: "200 - 600ms",
                poor: "> 600ms"
            }
        },
        {
            icon: <Move className="h-6 w-6 text-primary" />,
            title: "Cumulative Layout Shift (CLS)",
            subtitle: "Điểm thay đổi bố cục tích lũy",
            description: "Đo lường độ ổn định của giao diện. Nó xem xét các phần tử có bị \"nhảy\" lung tung khi đang load hay không (ví dụ: đang định bấm nút thì quảng cáo hiện ra đẩy nút xuống chỗ khác).",
            formula: "CLS = Σ (Impact Fraction × Distance Fraction)",
            ratings: {
                good: "0 - 0.1",
                needsImprovement: "0.1 - 0.25",
                poor: "> 0.25"
            }
        },
        {
            icon: <Gauge className="h-6 w-6 text-primary" />,
            title: "Speed Index (SI)",
            subtitle: "Chỉ số tốc độ",
            description: "Tốc độ hiển thị trực quan của nội dung trong quá trình tải trang. Nó không chỉ tính mốc thời gian mà tính tốc độ \"lấp đầy\" màn hình.",
            formula: "SI = ∫ (1 − VisualCompleteness(t)) dt",
            formulaExplanation: "Dựa trên phân tích video quá trình tải trang, tính diện tích dưới đường cong tiến độ hiển thị.",
            ratings: {
                good: "0 - 3.4s",
                needsImprovement: "3.4 - 5.8s",
                poor: "> 5.8s"
            }
        },
        {
            icon: <MousePointer className="h-6 w-6 text-primary" />,
            title: "Time to Interactive (TTI)",
            subtitle: "Thời gian tương tác",
            description: "Thời gian từ khi bắt đầu tải đến khi trang web có đầy đủ chức năng và có thể phản hồi nhanh chóng (trong vòng 50ms) với thao tác người dùng.",
            formula: "TTI = Thời điểm bắt đầu khoảng \"yên tĩnh\" 5 giây",
            formulaExplanation: "Xác định thời điểm FCP → Tìm một khoảng thời gian \"yên tĩnh\" (không có request mạng và tác vụ dài) kéo dài ít nhất 5 giây → TTI là điểm bắt đầu của khoảng yên tĩnh đó.",
            ratings: {
                good: "0 - 3.8s",
                needsImprovement: "3.8 - 7.3s",
                poor: "> 7.3s"
            }
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            <DocsHeader />

            {/* Hero Section */}
            <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
                <div className="container mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6">
                        <Zap className="h-5 w-5" />
                        <span className="font-medium">Hướng dẫn đánh giá</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Phân Tích Hiệu Suất Website
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Hiểu rõ các chỉ số Core Web Vitals và cách chúng ảnh hưởng đến trải nghiệm người dùng cũng như thứ hạng SEO của website.
                    </p>
                </div>
            </section>

            {/* Core Web Vitals Overview */}
            <section className="py-12 bg-black">
                <div className="container mx-auto px-6">
                    <div className="bg-gradient-to-r from-primary/10 to-purple-900/10 border border-primary/30 rounded-xl p-6 mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Gauge className="h-6 w-6 text-primary" />
                            Core Web Vitals là gì?
                        </h2>
                        <p className="text-gray-300 leading-relaxed">
                            Core Web Vitals là một bộ chỉ số do Google đưa ra để đo lường trải nghiệm người dùng thực tế trên website.
                            Các chỉ số này tập trung vào 3 khía cạnh chính: <strong className="text-primary">tốc độ tải</strong>,
                            <strong className="text-primary"> khả năng tương tác</strong>, và <strong className="text-primary">độ ổn định hình ảnh</strong>.
                            Điểm số tốt trong các chỉ số này không chỉ cải thiện trải nghiệm người dùng mà còn là yếu tố xếp hạng quan trọng của Google.
                        </p>
                    </div>
                </div>
            </section>

            {/* Metrics Grid */}
            <section className="py-12 bg-gray-950">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Các chỉ số hiệu suất chi tiết
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {metrics.map((metric, index) => (
                            <MetricCard key={index} {...metric} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Tips Section */}
            <section className="py-16 bg-black">
                <div className="container mx-auto px-6">
                    <Card className="bg-gray-900 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-2xl text-white flex items-center gap-2">
                                💡 Mẹo cải thiện hiệu suất
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-gray-300">
                                <li className="flex items-start gap-3">
                                    <span className="text-primary mt-1">•</span>
                                    <span><strong className="text-white">Tối ưu hình ảnh:</strong> Sử dụng định dạng WebP, nén ảnh và lazy loading để giảm thời gian tải.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary mt-1">•</span>
                                    <span><strong className="text-white">Giảm JavaScript blocking:</strong> Defer hoặc async các script không quan trọng để cải thiện TBT.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary mt-1">•</span>
                                    <span><strong className="text-white">Đặt kích thước cố định cho ảnh/video:</strong> Tránh layout shift bằng cách định nghĩa width/height cho media elements.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary mt-1">•</span>
                                    <span><strong className="text-white">Sử dụng CDN:</strong> Phân phối nội dung gần người dùng hơn để cải thiện Speed Index.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-primary mt-1">•</span>
                                    <span><strong className="text-white">Preload tài nguyên quan trọng:</strong> Sử dụng &lt;link rel="preload"&gt; cho fonts và critical CSS.</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <DocsFooter />
        </div>
    );
}
