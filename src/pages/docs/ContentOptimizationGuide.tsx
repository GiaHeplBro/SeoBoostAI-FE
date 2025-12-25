import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft,
    Brain,
    Target,
    AlertTriangle,
    CheckCircle,
    HelpCircle,
    FileText,
    Lightbulb,
    TrendingUp
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
export default function ContentOptimizationGuide() {
    return (
        <div className="min-h-screen bg-black text-white">
            <DocsHeader />

            {/* Hero Section */}
            <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
                <div className="container mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6">
                        <Brain className="h-5 w-5" />
                        <span className="font-medium">Hướng dẫn sử dụng</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Tối Ưu Hóa Nội Dung với AI
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Hiểu cách công nghệ AI của chúng tôi hoạt động, đặc biệt về cách chấm điểm nội dung.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 bg-black">
                <div className="container mx-auto px-6 max-w-4xl">

                    {/* Intro Alert */}
                    <div className="bg-gradient-to-r from-primary/10 to-purple-900/10 border border-primary/30 rounded-xl p-6 mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="h-6 w-6 text-yellow-400" />
                            Thông báo quan trọng về điểm số AI
                        </h2>
                        <p className="text-gray-300 leading-relaxed">
                            Khi sử dụng hệ thống, bạn có thể nhận thấy sự dao động nhỏ trong điểm số, ngay cả khi nhập cùng một nội dung.
                            <strong className="text-white"> Đây không phải là lỗi</strong>, mà là một đặc tính cố hữu của các Mô hình Ngôn ngữ Lớn (LLM) tiên tiến.
                        </p>
                    </div>

                    {/* Section 1: AI không phải là Máy tính */}
                    <SectionCard
                        icon={<Brain className="h-6 w-6 text-primary" />}
                        title="1. AI không phải là Máy tính, AI là một Chuyên gia"
                    >
                        <p className="mb-4">Điều quan trọng đầu tiên cần hiểu là AI (LLM) không phải là một máy tính toán (calculator).</p>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="font-semibold text-white">Máy tính (Tất định)</span>
                                </div>
                                <p className="text-sm">Hoạt động theo logic cứng. Nếu bạn nhập 2 + 2, nó sẽ luôn trả về 4.</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                    <span className="font-semibold text-white">AI (Xác suất)</span>
                                </div>
                                <p className="text-sm">Hoạt động như một chuyên gia. Nó "dự đoán" câu trả lời tốt nhất dựa trên hàng tỷ mẫu dữ liệu.</p>
                            </div>
                        </div>

                        <div className="bg-gray-950/50 border border-gray-700 rounded-lg p-4">
                            <p className="text-gray-400 italic">
                                💡 Hãy tưởng tượng bạn đưa một bài viết cho hai chuyên gia SEO. Cả hai đều đồng ý bài viết "tốt",
                                nhưng một người có thể chấm 8/10, người kia chấm 9/10. AI cũng tương tự; nó có một "sai số" (margin of error)
                                nhỏ vì nó đang đưa ra một ước tính chuyên nghiệp, không phải là một phép đo cố định.
                            </p>
                        </div>
                    </SectionCard>

                    {/* Section 2: Tình huống thường gặp */}
                    <SectionCard
                        icon={<HelpCircle className="h-6 w-6 text-yellow-400" />}
                        title="2. Phân tích các Tình huống Thường gặp"
                        variant="warning"
                    >
                        <p className="mb-6">Bạn sẽ gặp hai trường hợp chính gây ra sự dao động về điểm số:</p>

                        {/* Tình huống A */}
                        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700 mb-4">
                            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">A</span>
                                Cùng nội dung, cùng yêu cầu (chạy nhiều lần)
                            </h4>
                            <p className="mb-3">
                                <strong className="text-white">Giả sử:</strong> Bạn nhập nội dung "G435 của logitech" và yêu cầu "Ngắn".
                                Bạn chạy 2 lần liên tiếp. Lần 1 AI chấm điểm gốc là <span className="text-green-400 font-bold">90</span>,
                                lần 2 nó chấm là <span className="text-green-400 font-bold">88</span>.
                            </p>
                            <p className="mb-3">
                                <strong className="text-white">Tại sao?</strong> AI hoạt động dựa trên xác suất. Mỗi khi bạn chạy một yêu cầu,
                                nó sẽ chọn một "con đường suy nghĩ" hơi khác nhau.
                            </p>
                            <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3">
                                <p className="text-green-300 text-sm">
                                    ✅ <strong>Cách diễn giải:</strong> Sự dao động nhỏ này là bình thường. Tập trung vào khoảng điểm (85-95) thay vì con số tuyệt đối.
                                </p>
                            </div>
                        </div>

                        {/* Tình huống B */}
                        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
                            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">B</span>
                                Cùng nội dung, khác yêu cầu (rất quan trọng)
                            </h4>
                            <p className="mb-3">
                                <strong className="text-white">Giả sử:</strong> Bạn nhập nội dung "G435 của logitech".
                            </p>
                            <ul className="space-y-2 mb-3 ml-4">
                                <li>• <strong className="text-white">Lần 1:</strong> Yêu cầu ContentLength: "Dài" → AI chấm điểm: <span className="text-yellow-400 font-bold">80</span></li>
                                <li>• <strong className="text-white">Lần 2:</strong> Yêu cầu ContentLength: "Ngắn" → AI chấm điểm: <span className="text-green-400 font-bold">90</span></li>
                            </ul>
                            <p className="mb-3">
                                <strong className="text-white">Tại sao?</strong> AI không chấm điểm nội dung gốc một cách biệt lập.
                                Nó đọc toàn bộ prompt (bao gồm cả Yêu cầu Tối ưu) để hiểu ngữ cảnh.
                            </p>
                            <div className="bg-orange-900/30 border border-orange-700/50 rounded-lg p-3">
                                <p className="text-orange-300 text-sm">
                                    ⚠️ <strong>Lưu ý:</strong> Sự thay đổi trong ngữ cảnh yêu cầu (context) là lý do chính gây ra sự thay đổi điểm số.
                                </p>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Section 3: Điểm số có đáng tin cậy? */}
                    <SectionCard
                        icon={<Target className="h-6 w-6 text-green-400" />}
                        title="3. Vậy, Điểm số AI có đáng tin cậy không?"
                        variant="success"
                    >
                        <p className="mb-4 text-xl font-semibold text-white">Câu trả lời là "Có, nếu bạn sử dụng nó đúng cách."</p>

                        <div className="grid gap-4 mb-4">
                            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                                <p className="text-red-300">
                                    ❌ <strong>KHÔNG đáng tin cậy</strong> nếu bạn coi con số tuyệt đối là chân lý (ví dụ: tranh luận về 80 hay 85 điểm).
                                </p>
                            </div>
                            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                                <p className="text-green-300 mb-3">
                                    ✅ <strong>RẤT đáng tin cậy</strong> khi bạn sử dụng cho 2 mục đích sau:
                                </p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex items-start gap-2">
                                        <TrendingUp className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span><strong className="text-white">Để So sánh Tương đối (Before vs. After):</strong> Đây là giá trị cốt lõi.
                                            Sự chênh lệch "Trước - Sau" khổng lồ (ví dụ: 5 → 85) là cực kỳ đáng tin cậy.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <FileText className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span><strong className="text-white">Để lấy "Lý do Giải thích" (Justification):</strong> Phần giá trị nhất
                                            không phải là con số, mà là các lời giải thích tại sao nội dung tốt/chưa tốt.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Section 4: Kết luận */}
                    <SectionCard
                        icon={<Lightbulb className="h-6 w-6 text-yellow-400" />}
                        title="4. Kết luận"
                        variant="info"
                    >
                        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
                            <p className="text-lg mb-4">
                                🤖 <strong className="text-white">Hãy coi AI của SEOBoostAI là một trợ lý chuyên gia</strong>, không phải một máy đo lường cứng nhắc.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                    <span>Sử dụng điểm số để xem <strong className="text-white">mức độ cải thiện</strong> (chênh lệch Trước - Sau)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                    <span>Đọc kỹ <strong className="text-white">lý do giải thích</strong> (justification) để hiểu tại sao</span>
                                </li>
                            </ul>
                        </div>
                    </SectionCard>

                </div>
            </section>

            <DocsFooter />
        </div>
    );
}
