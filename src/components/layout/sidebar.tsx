import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Search,
  FileSearch,
  Sparkles,
  Rocket,
  History,
  MessageSquare,
} from "lucide-react";

const menuItems = [
  {
    category: "Công Cụ SEO",
    items: [
      { name: "Trang Chủ", icon: <LayoutDashboard className="mr-3 h-5 w-5" />, path: "/dashboard" },
      { name: "Phân tích Xu hướng", icon: <Search className="mr-3 h-5 w-5" />, path: "/keyword-analysis" },
      { name: "Tối ưu hóa Website", icon: <FileSearch className="mr-3 h-5 w-5" />, path: "/seo-audit" },
      { name: "Tối Ưu Hóa Nội Dung", icon: <Sparkles className="mr-3 h-5 w-5" />, path: "/content-optimization" },
    ],
  },
  {
    category: "Tài Khoản",
    items: [
      { name: "Lịch sử giao dịch", icon: <History className="mr-3 h-5 w-5" />, path: "/transaction-history" },
      { name: "Hỗ trợ", icon: <MessageSquare className="mr-3 h-5 w-5" />, path: "/support" },
    ],
  },
];

// SỬA Ở ĐÂY 1: Sidebar giờ sẽ nhận props để điều khiển trạng thái
export default function Sidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void; }) {
  const [location] = useLocation();

  return (
    <>
      {/* Lớp phủ cho di động, chỉ hiện khi sidebar mở */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 md:hidden ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* SỬA Ở ĐÂY 2: Cập nhật lại class để có hiệu ứng trượt */}
      <aside
        className={`w-64 h-full shadow-md fixed md:relative z-50
                   transform transition-transform duration-300 ease-in-out
                   ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                   md:translate-x-0 overflow-y-auto`}
        style={{ backgroundColor: '#1F1F1F' }}
      >
        <div className="p-4 border-b" style={{ borderColor: '#333333' }}>
          {/* Bọc logo trong Link và thêm onClick để đóng sidebar */}
          <Link href="/dashboard" onClick={() => setSidebarOpen(false)}>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent flex items-center cursor-pointer">
              <Rocket className="mr-2 h-6 w-6 text-blue-500" />
              SEOBoostAI
            </h1>
          </Link>
          <p className="text-xs text-slate-400 mt-1">
            AI-powered SEO Platform
          </p>
        </div>

        <div className="py-2">
          {menuItems.map((category, idx) => (
            <div key={idx}>
              <p className="px-4 py-2 text-xs uppercase text-slate-400 font-medium mt-2">
                {category.category}
              </p>
              {category.items.map((item, i) => {
                const isActive = location === item.path;
                return (
                  // SỬA Ở ĐÂY 3: Thêm onClick để đóng sidebar khi chọn một mục
                  <Link
                    key={i}
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div
                      className={`sidebar-menu-item flex items-center px-4 py-3 transition-colors ${isActive ? "" : "hover:bg-gray-700"
                        }`}
                      style={{
                        backgroundColor: isActive ? '#333333' : 'transparent',
                        color: isActive ? '#FFFFFF' : '#D1D5DB'
                      }}
                    >
                      {item.icon}
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Nút bấm nổi đã được xóa và chuyển thành hamburger menu trong Header */}
    </>
  );
}
