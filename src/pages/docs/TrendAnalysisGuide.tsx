import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft,
    TrendingUp,
    Search,
    MapPin,
    Calendar,
    DollarSign,
    BarChart3,
    Target,
    Lightbulb,
    AlertTriangle,
    CheckCircle,
    Info,
    Globe
} from "lucide-react";

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
                    <Button className="bg-gray-800 border border-gray-600 text-white hover:bg-gray-700 hover:text-white">
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
// Section Card Component
// =========================================
interface SectionCardProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    variant?: 'default' | 'warning' | 'success' | 'info';
}

function SectionCard({ icon, title, children, variant = 'default' }: SectionCardProps) {
    const variantStyles = {
        default: 'bg-gray-900 border-gray-700',
        warning: 'bg-yellow-900/20 border-yellow-700/50',
        success: 'bg-green-900/20 border-green-700/50',
        info: 'bg-blue-900/20 border-blue-700/50'
    };

    return (
        <Card className={`${variantStyles[variant]} mb-6`}>
            <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-3">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 leading-relaxed">
                {children}
            </CardContent>
        </Card>
    );
}

// =========================================
// TRANG CHÍNH
// =========================================
export default function TrendAnalysisGuide() {
    return (
        <div className="min-h-screen bg-black text-white">
            <DocsHeader />

            {/* Hero Section */}
            <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
                <div className="container mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6">
                        <TrendingUp className="h-5 w-5" />
                        <span className="font-medium">Hướng dẫn sử dụng</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Phân Tích Xu Hướng Từ Khóa
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Hiểu cách đọc và sử dụng dữ liệu từ Google Trends và Google Ads để tối ưu chiến lược SEO của bạn.
                    </p>
                </div>
            </section>

            {/* Data Sources */}
            <section className="py-12 bg-black">
                <div className="container mx-auto px-6 max-w-4xl">

                    {/* Intro */}
                    <div className="bg-gradient-to-r from-primary/10 to-purple-900/10 border border-primary/30 rounded-xl p-6 mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Globe className="h-6 w-6 text-primary" />
                            Nguồn dữ liệu
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            SEOBoostAI sử dụng dữ liệu từ <strong className="text-white">2 nguồn chính thức của Google</strong> để phân tích xu hướng từ khóa:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="h-5 w-5 text-blue-400" />
                                    <span className="font-semibold text-white">Google Trends</span>
                                </div>
                                <p className="text-sm text-gray-400">Xu hướng tìm kiếm, so sánh từ khóa, phân tích theo khu vực</p>
                                <p className="text-xs text-green-400 mt-2">🔄 Cập nhật: <strong>Hàng ngày</strong></p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="h-5 w-5 text-green-400" />
                                    <span className="font-semibold text-white">Google Ads</span>
                                </div>
                                <p className="text-sm text-gray-400">Lượt tìm kiếm trung bình, chi phí quảng cáo (CPC), độ cạnh tranh</p>
                                <p className="text-xs text-yellow-400 mt-2">🔄 Cập nhật: <strong>Hàng tháng</strong></p>
                            </div>
                        </div>
                    </div>

                    {/* Google Trends Section */}
                    <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
                        <TrendingUp className="h-8 w-8 text-blue-400" />
                        Google Trends
                    </h2>

                    <SectionCard
                        icon={<Search className="h-6 w-6 text-blue-400" />}
                        title="Google Trends là gì?"
                        variant="info"
                    >
                        <p className="mb-4">
                            <strong className="text-white">Google Trends</strong> là công cụ miễn phí của Google cho phép bạn xem xu hướng tìm kiếm
                            của bất kỳ từ khóa nào theo thời gian và địa điểm.
                        </p>
                        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-4">
                            <p className="text-yellow-300 text-sm">
                                ⚠️ <strong>Lưu ý quan trọng:</strong> Google Trends chỉ thống kê lượt tìm kiếm trên <strong>Google Search</strong>,
                                không bao gồm các công cụ tìm kiếm khác như Bing, Yahoo, DuckDuckGo, v.v.
                            </p>
                        </div>
                        <p>
                            Dữ liệu từ Google Trends giúp bạn hiểu được:
                        </p>
                        <ul className="space-y-2 mt-3 ml-4">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                                <span>Từ khóa đang <strong className="text-white">tăng hay giảm</strong> quan tâm theo thời gian</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                                <span>Khu vực nào <strong className="text-white">tìm kiếm nhiều nhất</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                                <span>So sánh <strong className="text-white">độ phổ biến</strong> giữa các từ khóa</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                                <span>Phát hiện <strong className="text-white">xu hướng mùa vụ</strong> (seasonal trends)</span>
                            </li>
                        </ul>
                    </SectionCard>

                    <SectionCard
                        icon={<BarChart3 className="h-6 w-6 text-purple-400" />}
                        title="Cách đọc thang điểm 0-100"
                        variant="warning"
                    >
                        <p className="mb-4">
                            Đây là phần <strong className="text-white">quan trọng nhất</strong> cần hiểu khi sử dụng Google Trends.
                            Con số bạn thấy <strong className="text-red-300">không phải là số lượt tìm kiếm thực tế</strong>.
                        </p>

                        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700 mb-4">
                            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-400" />
                                Thang điểm tương đối (0-100)
                            </h4>
                            <ul className="space-y-2">
                                <li><strong className="text-green-400">100</strong> = Mức độ quan tâm <strong className="text-white">cao nhất</strong> trong phạm vi được chọn</li>
                                <li><strong className="text-yellow-400">50</strong> = Mức độ quan tâm bằng <strong className="text-white">một nửa</strong> so với cao nhất</li>
                                <li><strong className="text-red-400">0</strong> = Không đủ dữ liệu hoặc mức độ quan tâm <strong className="text-white">rất thấp</strong></li>
                            </ul>
                        </div>

                        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-5 mb-4">
                            <h4 className="font-bold text-white mb-3">📍 Ví dụ: Tìm kiếm "Thức ăn cho mèo" tại Việt Nam</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left py-2 text-gray-400">Khu vực</th>
                                            <th className="text-center py-2 text-gray-400">Điểm</th>
                                            <th className="text-left py-2 text-gray-400">Ý nghĩa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-800">
                                            <td className="py-2 text-white">🥇 TP. Hồ Chí Minh</td>
                                            <td className="py-2 text-center"><span className="bg-green-500 text-white px-2 py-1 rounded font-bold">100</span></td>
                                            <td className="py-2 text-green-300">Cao nhất - chuẩn so sánh</td>
                                        </tr>
                                        <tr className="border-b border-gray-800">
                                            <td className="py-2 text-white">🥈 Bắc Ninh</td>
                                            <td className="py-2 text-center"><span className="bg-yellow-500 text-black px-2 py-1 rounded font-bold">70</span></td>
                                            <td className="py-2 text-yellow-300">Bằng 70% so với HCM</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 text-white">🥉 An Giang</td>
                                            <td className="py-2 text-center"><span className="bg-orange-500 text-white px-2 py-1 rounded font-bold">50</span></td>
                                            <td className="py-2 text-orange-300">Bằng 50% so với HCM</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-gray-400 text-sm mt-3 italic">
                                → TP.HCM có lượt tìm kiếm "Thức ăn cho mèo" nhiều gấp đôi An Giang
                            </p>
                        </div>

                        <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                            <p className="text-green-300">
                                ✅ <strong>Cách hiểu đúng:</strong> Dùng để so sánh tương đối giữa các khu vực hoặc từ khóa,
                                không phải để biết số lượt tìm kiếm chính xác.
                            </p>
                        </div>
                    </SectionCard>

                    <SectionCard
                        icon={<Calendar className="h-6 w-6 text-orange-400" />}
                        title="Phân tích theo thời gian"
                    >
                        <p className="mb-4">
                            Google Trends cho phép bạn xem xu hướng tìm kiếm theo nhiều khoảng thời gian khác nhau:
                        </p>
                        <div className="grid md:grid-cols-3 gap-3 mb-4">
                            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 text-center">
                                <div className="text-2xl mb-1">📅</div>
                                <div className="font-semibold text-white">7 ngày qua</div>
                                <div className="text-xs text-gray-400">Xu hướng ngắn hạn</div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 text-center">
                                <div className="text-2xl mb-1">📆</div>
                                <div className="font-semibold text-white">12 tháng qua</div>
                                <div className="text-xs text-gray-400">Xu hướng theo mùa</div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 text-center">
                                <div className="text-2xl mb-1">📊</div>
                                <div className="font-semibold text-white">5 năm qua</div>
                                <div className="text-xs text-gray-400">Xu hướng dài hạn</div>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm">
                            💡 <strong className="text-white">Mẹo:</strong> Xem dữ liệu 12 tháng để phát hiện xu hướng mùa vụ
                            (ví dụ: "áo len" tăng vào mùa đông, "đồ bơi" tăng vào mùa hè).
                        </p>
                    </SectionCard>

                    <SectionCard
                        icon={<MapPin className="h-6 w-6 text-red-400" />}
                        title="So sánh từ khóa"
                    >
                        <p className="mb-4">
                            Bạn có thể so sánh tối đa <strong className="text-white">5 từ khóa cùng lúc</strong>.
                            Cách tính điểm tương tự như so sánh khu vực:
                        </p>
                        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700 mb-4">
                            <h4 className="font-bold text-white mb-3">📊 Ví dụ: So sánh "iPhone" vs "Samsung"</h4>
                            <div className="flex items-center gap-4 mb-3">
                                <div className="flex-1 bg-blue-900/30 rounded-lg p-3 border border-blue-700/50 text-center">
                                    <div className="text-lg font-bold text-blue-400">iPhone</div>
                                    <div className="text-3xl font-bold text-white">100</div>
                                </div>
                                <div className="text-gray-500 text-2xl">vs</div>
                                <div className="flex-1 bg-green-900/30 rounded-lg p-3 border border-green-700/50 text-center">
                                    <div className="text-lg font-bold text-green-400">Samsung</div>
                                    <div className="text-3xl font-bold text-white">65</div>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm italic">
                                → "iPhone" được tìm kiếm nhiều hơn "Samsung" khoảng 35% trong khoảng thời gian được chọn
                            </p>
                        </div>
                    </SectionCard>

                    {/* Divider */}
                    <div className="border-t border-gray-800 my-12"></div>

                    {/* Google Ads Section */}
                    <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
                        <DollarSign className="h-8 w-8 text-green-400" />
                        Google Ads (Keyword Planner)
                    </h2>

                    <SectionCard
                        icon={<Search className="h-6 w-6 text-green-400" />}
                        title="Dữ liệu từ Google Ads"
                        variant="success"
                    >
                        <p className="mb-4">
                            <strong className="text-white">Google Ads Keyword Planner</strong> cung cấp dữ liệu chi tiết hơn về từ khóa,
                            bao gồm lượt tìm kiếm trung bình và thông tin quảng cáo.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <BarChart3 className="h-5 w-5 text-blue-400" />
                                    <span className="font-semibold text-white">Lượt tìm kiếm TB/tháng</span>
                                </div>
                                <p className="text-sm text-gray-400">Số lượt tìm kiếm trung bình hàng tháng của từ khóa (ví dụ: 10K-100K)</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="h-5 w-5 text-red-400" />
                                    <span className="font-semibold text-white">Độ cạnh tranh</span>
                                </div>
                                <p className="text-sm text-gray-400">Mức độ cạnh tranh quảng cáo: Thấp, Trung bình, Cao</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="h-5 w-5 text-green-400" />
                                    <span className="font-semibold text-white">CPC (Cost Per Click)</span>
                                </div>
                                <p className="text-sm text-gray-400">Chi phí quảng cáo cho mỗi lượt click (VNĐ hoặc USD)</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="h-5 w-5 text-yellow-400" />
                                    <span className="font-semibold text-white">Xu hướng 3 tháng</span>
                                </div>
                                <p className="text-sm text-gray-400">Sự thay đổi lượt tìm kiếm trong 3 tháng gần nhất</p>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard
                        icon={<DollarSign className="h-6 w-6 text-yellow-400" />}
                        title="CPC (Cost Per Click) là gì?"
                        variant="warning"
                    >
                        <p className="mb-4">
                            <strong className="text-white">CPC (Cost Per Click)</strong> là chi phí mà nhà quảng cáo phải trả cho Google
                            mỗi khi có người click vào quảng cáo của họ cho từ khóa đó.
                        </p>

                        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700 mb-4">
                            <h4 className="font-bold text-white mb-3">💰 Ví dụ về CPC</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left py-2 text-gray-400">Từ khóa</th>
                                            <th className="text-right py-2 text-gray-400">CPC</th>
                                            <th className="text-left py-2 text-gray-400">Nhận xét</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-800">
                                            <td className="py-2 text-white">"Mua bảo hiểm nhân thọ"</td>
                                            <td className="py-2 text-right"><span className="text-red-400 font-bold">150.000đ</span></td>
                                            <td className="py-2 text-red-300">CPC cao - Lợi nhuận cao</td>
                                        </tr>
                                        <tr className="border-b border-gray-800">
                                            <td className="py-2 text-white">"Mua laptop gaming"</td>
                                            <td className="py-2 text-right"><span className="text-yellow-400 font-bold">25.000đ</span></td>
                                            <td className="py-2 text-yellow-300">CPC trung bình</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 text-white">"Công thức nấu phở"</td>
                                            <td className="py-2 text-right"><span className="text-green-400 font-bold">2.000đ</span></td>
                                            <td className="py-2 text-green-300">CPC thấp - Ít thương mại</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <h4 className="font-bold text-white mb-3">🎯 CPC quan trọng như thế nào trong SEO?</h4>
                        <div className="space-y-3">
                            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                                <p className="text-green-300">
                                    <strong>✅ CPC cao = Từ khóa có giá trị thương mại cao</strong>
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Nếu nhà quảng cáo sẵn sàng trả nhiều tiền cho một click, nghĩa là từ khóa đó có khả năng
                                    chuyển đổi thành doanh thu cao. Đây là từ khóa đáng để đầu tư SEO.
                                </p>
                            </div>
                            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                                <p className="text-blue-300">
                                    <strong>📊 CPC giúp đánh giá ROI của SEO</strong>
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Nếu bạn rank #1 cho từ khóa có CPC 50.000đ và nhận 1000 click/tháng,
                                    bạn đang "tiết kiệm" 50 triệu đồng tiền quảng cáo mỗi tháng!
                                </p>
                            </div>
                            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                                <p className="text-yellow-300">
                                    <strong>⚠️ CPC cao cũng đồng nghĩa với cạnh tranh cao</strong>
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Những từ khóa CPC cao thường khó rank hơn vì nhiều website khác cũng đang nhắm đến chúng.
                                </p>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard
                        icon={<Target className="h-6 w-6 text-red-400" />}
                        title="Độ cạnh tranh từ khóa"
                    >
                        <p className="mb-4">
                            Google Ads chia độ cạnh tranh thành 3 mức:
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4 text-center">
                                <div className="text-3xl mb-2">🟢</div>
                                <div className="font-bold text-green-400">Thấp (Low)</div>
                                <p className="text-xs text-gray-400 mt-2">Ít nhà quảng cáo cạnh tranh. Dễ phát triển SEO hơn.</p>
                            </div>
                            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 text-center">
                                <div className="text-3xl mb-2">🟡</div>
                                <div className="font-bold text-yellow-400">TB (Medium)</div>
                                <p className="text-xs text-gray-400 mt-2">Cạnh tranh vừa phải. Cần chiến lược tốt.</p>
                            </div>
                            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 text-center">
                                <div className="text-3xl mb-2">🔴</div>
                                <div className="font-bold text-red-400">Cao (High)</div>
                                <p className="text-xs text-gray-400 mt-2">Nhiều nhà quảng cáo. Khó phát triển, cần nội dung chất lượng cao.</p>
                            </div>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <p className="text-gray-400 text-sm">
                                💡 <strong className="text-white">Mẹo SEO:</strong> Tìm từ khóa có
                                <strong className="text-green-400"> lượt tìm kiếm cao</strong> nhưng
                                <strong className="text-yellow-400"> độ cạnh tranh thấp-trung bình</strong>.
                                Đây là "cơ hội vàng" để phát triển nhanh!
                            </p>
                        </div>
                    </SectionCard>

                    {/* Divider */}
                    <div className="border-t border-gray-800 my-12"></div>

                    {/* Tips Section */}
                    <SectionCard
                        icon={<Lightbulb className="h-6 w-6 text-yellow-400" />}
                        title="Mẹo sử dụng hiệu quả"
                        variant="info"
                    >
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg flex-shrink-0">
                                    <span className="text-xl">1️⃣</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">Kết hợp cả hai nguồn dữ liệu</h4>
                                    <p className="text-gray-400 text-sm">
                                        Dùng Google Trends để xem xu hướng, dùng Google Ads để biết lượt tìm kiếm cụ thể và CPC.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg flex-shrink-0">
                                    <span className="text-xl">2️⃣</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">Chú ý xu hướng mùa vụ</h4>
                                    <p className="text-gray-400 text-sm">
                                        Chuẩn bị nội dung trước mùa cao điểm 2-3 tháng để kịp index và rank.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg flex-shrink-0">
                                    <span className="text-xl">3️⃣</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">Nhắm theo khu vực nếu kinh doanh địa phương</h4>
                                    <p className="text-gray-400 text-sm">
                                        Nếu bạn kinh doanh tại TP.HCM, hãy xem dữ liệu riêng cho TP.HCM thay vì cả nước.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg flex-shrink-0">
                                    <span className="text-xl">4️⃣</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">Tìm từ khóa "ngách" có CPC cao</h4>
                                    <p className="text-gray-400 text-sm">
                                        Từ khóa dài (long-tail) thường ít cạnh tranh hơn nhưng vẫn có CPC tốt và tỷ lệ chuyển đổi cao.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Summary */}
                    <div className="bg-gradient-to-r from-primary/10 to-purple-900/10 border border-primary/30 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <CheckCircle className="h-6 w-6 text-green-400" />
                            Tóm tắt
                        </h3>
                        <ul className="space-y-2 text-gray-300">
                            <li>• <strong className="text-white">Google Trends:</strong> Xem xu hướng tương đối (thang 0-100), cập nhật hàng ngày</li>
                            <li>• <strong className="text-white">Google Ads:</strong> Xem lượt tìm kiếm cụ thể, CPC, độ cạnh tranh, cập nhật hàng tháng</li>
                            <li>• <strong className="text-white">CPC cao:</strong> Từ khóa có giá trị thương mại cao, đáng đầu tư SEO</li>
                            <li>• <strong className="text-white">Kết hợp cả hai:</strong> Để có cái nhìn toàn diện về tiềm năng từ khóa</li>
                        </ul>
                    </div>

                </div>
            </section>

            <DocsFooter />
        </div>
    );
}
