import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft,
    CreditCard,
    Shield,
    Clock,
    FileText,
    AlertTriangle,
    CheckCircle
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
export default function PaymentTermsGuide() {
    return (
        <div className="min-h-screen bg-black text-white">
            <DocsHeader />

            {/* Hero Section */}
            <section className="py-16 bg-gradient-to-b from-gray-900 to-black">
                <div className="container mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6">
                        <CreditCard className="h-5 w-5" />
                        <span className="font-medium">Điều khoản dịch vụ</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Điều Khoản Thanh Toán
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Các điều khoản và điều kiện thanh toán khi sử dụng dịch vụ SEOBoostAI.
                    </p>
                    <p className="text-sm text-gray-500 mt-4">
                        Ngày hiệu lực: 22/11/2025 | Đơn vị vận hành: SEOBoostAI Team
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 bg-black">
                <div className="container mx-auto px-6 max-w-4xl">

                    <SectionCard
                        icon={<FileText className="h-6 w-6 text-primary" />}
                        title="1. Quy định chung"
                    >
                        <p>
                            Bằng việc thực hiện giao dịch thanh toán trên hệ thống SEOBoostAI, Khách hàng đồng ý tuân thủ các điều khoản
                            và điều kiện dưới đây. Các điều khoản này nhằm đảm bảo quyền lợi của cả hai bên và tính chính xác của dữ liệu giao dịch.
                        </p>
                    </SectionCard>

                    <SectionCard
                        icon={<CreditCard className="h-6 w-6 text-blue-400" />}
                        title="2. Phương thức thanh toán"
                        variant="info"
                    >
                        <p className="mb-4">Hệ thống chấp nhận thanh toán qua cổng thanh toán trung gian <strong className="text-white">PayOS</strong>, hỗ trợ:</p>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-400" />
                                <span>Quét mã VietQR (Napas 24/7) từ ứng dụng ngân hàng</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-400" />
                                <span>Chuyển khoản nhanh 24/7</span>
                            </li>
                        </ul>
                    </SectionCard>

                    <SectionCard
                        icon={<Clock className="h-6 w-6 text-yellow-400" />}
                        title="3. Quy trình xác nhận thanh toán"
                    >
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-white mb-2">3.1. Thời gian xử lý</h4>
                                <ul className="space-y-2 ml-4">
                                    <li>• Giao dịch thường được xác nhận tự động trong vòng <strong className="text-white">1-5 phút</strong> sau khi Khách hàng hoàn tất chuyển khoản.</li>
                                    <li>• Trạng thái đơn hàng sẽ chuyển từ "Đang chờ" (Pending) sang "Thành công" (Completed) ngay khi hệ thống nhận được tín hiệu từ cổng thanh toán.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-2">3.2. Dữ liệu giao dịch</h4>
                                <p className="mb-2">Để đảm bảo đối soát, hệ thống sẽ lưu trữ các thông tin sau (nếu được ngân hàng cung cấp):</p>
                                <ul className="space-y-1 ml-4 mb-3">
                                    <li>• Mã đơn hàng (Order Code)</li>
                                    <li>• Mã tham chiếu cổng thanh toán (Gateway Transaction ID)</li>
                                    <li>• Thông tin người chuyển (Số tài khoản hoặc Tên) để hỗ trợ tra cứu khiếu nại</li>
                                </ul>
                                <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
                                    <p className="text-yellow-300 text-sm">
                                        ⚠️ <strong>Lưu ý:</strong> Đối với các giao dịch mà ngân hàng không trả về thông tin người chuyển do chính sách bảo mật,
                                        hệ thống sẽ ghi nhận là "Không xác định" hoặc "Ẩn danh". Việc này không ảnh hưởng đến giá trị pháp lý của giao dịch.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard
                        icon={<AlertTriangle className="h-6 w-6 text-orange-400" />}
                        title="4. Chính sách xử lý lỗi và hoàn tiền"
                        variant="warning"
                    >
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-white mb-2">4.1. Trường hợp lỗi từ hệ thống</h4>
                                <p className="mb-2">Nếu tài khoản của Khách hàng đã bị trừ tiền nhưng trạng thái đơn hàng trên SEOBoostAI vẫn là "Đang chờ" quá 15 phút, Khách hàng vui lòng liên hệ bộ phận hỗ trợ và cung cấp:</p>
                                <ul className="space-y-1 ml-4 mb-2">
                                    <li>• Ảnh chụp màn hình giao dịch thành công (có mã giao dịch ngân hàng)</li>
                                    <li>• Mã đơn hàng (Order Code)</li>
                                </ul>
                                <p className="text-green-300">→ Chúng tôi sẽ kiểm tra thủ công và cập nhật trạng thái trong vòng 24h làm việc.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-2">4.2. Trường hợp lỗi từ phía Khách hàng</h4>
                                <p className="mb-2">Khách hàng chịu trách nhiệm hoàn toàn nếu:</p>
                                <ul className="space-y-1 ml-4 text-red-300">
                                    <li>• Chuyển khoản sai số tiền</li>
                                    <li>• Chuyển khoản sai nội dung (không đúng Mã đơn hàng/Memo yêu cầu)</li>
                                    <li>• Chuyển khoản vào số tài khoản cũ hoặc không chính chủ của SEOBoostAI</li>
                                </ul>
                                <p className="mt-2 text-gray-400 text-sm">Trong các trường hợp này, SEOBoostAI sẽ nỗ lực hỗ trợ tra soát nhưng không cam kết hoàn tiền 100% hoặc xử lý ngay lập tức.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-2">4.3. Chính sách Hoàn tiền (Refund)</h4>
                                <ul className="space-y-2 ml-4">
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400">•</span>
                                        <span>Các gói dịch vụ đã mua và kích hoạt thành công <strong className="text-red-300">sẽ không được hoàn tiền</strong>.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">•</span>
                                        <span>Trường hợp hệ thống thu tiền sai (double charge) do lỗi kỹ thuật, số tiền thừa sẽ được hoàn lại vào Ví tín dụng (Wallet) của Khách hàng trên hệ thống hoặc tài khoản ngân hàng gốc trong vòng 7-14 ngày làm việc.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard
                        icon={<Shield className="h-6 w-6 text-green-400" />}
                        title="5. Bảo mật thông tin thanh toán"
                        variant="success"
                    >
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                <span>SEOBoostAI <strong className="text-white">không lưu trữ</strong> bất kỳ thông tin nhạy cảm nào về thẻ quốc tế (số thẻ, CVV) hoặc mật khẩu ngân hàng của Khách hàng.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                <span>Mọi giao dịch được xử lý qua hạ tầng bảo mật của <strong className="text-white">PayOS</strong> và các Ngân hàng đối tác.</span>
                            </li>
                        </ul>
                    </SectionCard>

                    <SectionCard
                        icon={<AlertTriangle className="h-6 w-6 text-gray-400" />}
                        title="6. Miễn trừ trách nhiệm"
                    >
                        <p className="mb-3">SEOBoostAI được miễn trừ trách nhiệm trong các trường hợp bất khả kháng:</p>
                        <ul className="space-y-1 ml-4">
                            <li>• Hệ thống ngân hàng bảo trì, lỗi đường truyền mạng quốc gia</li>
                            <li>• Thiên tai, sự cố kỹ thuật diện rộng nằm ngoài tầm kiểm soát</li>
                        </ul>
                    </SectionCard>

                    {/* Contact */}
                    <div className="text-center bg-gray-900 border border-gray-700 rounded-xl p-6">
                        <p className="text-gray-400">
                            Mọi thắc mắc về thanh toán, vui lòng liên hệ qua mục <strong className="text-primary">"Hỗ trợ"</strong> trong ứng dụng.
                        </p>
                    </div>

                </div>
            </section>

            <DocsFooter />
        </div>
    );
}
