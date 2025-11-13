import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, BarChart, Wand2, ArrowRight, Facebook, Instagram } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// =========================================
// NOTE: HEADER — thanh đầu trang Landing
// =========================================
function LandingHeader() {
  return (
    <header className="absolute top-0 left-0 w-full p-6 z-20">
      <div className="container mx-auto flex justify-between items-center">
        {/* NOTE: Logo chính */}
        <div className="text-3xl font-bold text-white tracking-wide drop-shadow-lg">
          SEO-Boost <span className="text-primary">AI</span>
        </div>

        {/* NOTE: Nút điều hướng đến trang đăng nhập */}
        <Link href="/login">
          <Button
            variant="secondary"
            className="bg-white/90 text-gray-900 font-semibold hover:bg-white hover:text-black transition-all duration-300 shadow-md"
          >
            Đăng nhập
          </Button>
        </Link>
      </div>
    </header>
  );
}

// =========================================
// NOTE: FOOTER — phần cuối trang Landing
// =========================================
function LandingFooter() {
  return (
    <footer className="w-full bg-gray-950 text-gray-400 py-10 border-t border-gray-800">
      <div className="container mx-auto text-center space-y-4">
        {/* NOTE: Liên kết mạng xã hội */}
        <div className="flex justify-center gap-6 mb-4">
          <a
            href="https://www.facebook.com/profile.php?id=61576582503642"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hover:text-white transition-colors"
          >
            <Facebook className="h-6 w-6" />
          </a>
          <a
            href="https://www.instagram.com/seoboostai/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-white transition-colors"
          >
            <Instagram className="h-6 w-6" />
          </a>
        </div>

        {/* NOTE: Bản quyền + Liên kết điều khoản */}
        <p>&copy; {new Date().getFullYear()} SEO-Boost AI. Bảo lưu mọi quyền.</p>
        <div className="flex justify-center gap-4 text-sm">
          <a href="#" className="hover:text-white">
            Chính sách bảo mật
          </a>
          <a href="#" className="hover:text-white">
            Điều khoản dịch vụ
          </a>
        </div>
      </div>
    </footer>
  );
}

// =========================================
// NOTE: TRANG LANDING PAGE CHÍNH
// =========================================
export default function LandingPage() {
  // NOTE: Danh sách tính năng hiển thị
  const features = [
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: "Kiểm tra SEO chuyên sâu",
      description:
        "Phân tích SEO kỹ thuật và on-page của trang web để tìm ra các lỗi nghiêm trọng và cơ hội tối ưu.",
    },
    {
      icon: <BarChart className="h-8 w-8 text-primary" />,
      title: "Phân tích từ khóa nâng cao",
      description:
        "Khám phá các từ khóa có lượng tìm kiếm cao, cạnh tranh thấp để chiếm ưu thế trên bảng xếp hạng.",
    },
    {
      icon: <Wand2 className="h-8 w-8 text-primary" />,
      title: "Tối ưu hóa nội dung bằng AI",
      description:
        "Nâng cao nội dung của bạn với đề xuất AI giúp cải thiện khả năng đọc, tương tác và điểm SEO.",
    },
  ];

  return (
    <div className="bg-black text-white overflow-hidden">
      {/* NOTE: Header luôn hiển thị đầu trang */}
      <LandingHeader />

      {/* =====================================
          NOTE: HERO SECTION — phần giới thiệu chính
      ===================================== */}
      <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
        {/* NOTE: Nền video chính */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover brightness-[0.7] contrast-[1.2] saturate-[1.3]"
        >
          <source
            src="https://videos.pexels.com/video-files/3254012/3254012-hd_1920_1080_25fps.mp4"
            type="video/mp4"
          />
        </video>

        {/* NOTE: Lớp phủ gradient giúp dễ đọc chữ */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/40 via-black/20 to-black/80" />

        {/* NOTE: Nội dung chính */}
        <div className="z-10 px-6 max-w-3xl text-center animate-fade-up">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-md">
            Khai phá toàn bộ tiềm năng trang web của bạn
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 leading-relaxed">
            Tận dụng sức mạnh của AI để phân tích, tối ưu hóa và thống trị bảng xếp hạng tìm kiếm.
            SEO-Boost AI là nền tảng tất cả trong một cho thành công kỹ thuật số của bạn.
          </p>

          {/* NOTE: Nút "Bắt đầu miễn phí" */}
          <div className="mt-10">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-lg shadow-lg hover:shadow-primary/40 transition-all"
              >
                Bắt đầu miễn phí
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================
          NOTE: SECTION TÍNH NĂNG
      ===================================== */}
      <section className="py-20 bg-gray-950 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-3">
              Mọi thứ bạn cần để thành công
            </h2>
            <p className="text-lg text-gray-400">
              Một nền tảng, tất cả các công cụ SEO mạnh mẽ.
            </p>
          </div>

          {/* NOTE: Hiển thị danh sách card tính năng */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-gray-900/70 border-gray-800 text-center backdrop-blur-sm hover:bg-gray-800/90 transition-all duration-300 shadow-lg hover:shadow-primary/20"
              >
                <CardHeader>
                  <div className="mx-auto bg-gray-800/70 rounded-full h-16 w-16 flex items-center justify-center shadow-md">
                    {feature.icon}
                  </div>
                  <CardTitle className="mt-4 text-white font-semibold text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-400 text-base leading-relaxed">
                  {feature.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* NOTE: Footer cuối trang */}
      <LandingFooter />
    </div>
  );
}
