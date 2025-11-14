import React, { useState, useEffect, useRef } from "react";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Edit,
  CheckCircle,
  Ban,
  MessageSquare,
  Users,
  PieChart as PieChartIcon, // Đổi tên để tránh xung đột
  UserX,
  LogOut, // ✅ THÊM: Import icon LogOut
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// =====================================================
// 🧩 STUB COMPONENTS (Giữ nguyên)
// =====================================================
const queryClient = new QueryClient();
// ... (Tất cả stub components của bạn giữ nguyên)
// Stub for @/hooks/use-toast
const useToast = () => {
  return {
    toast: (options: { title: string; description?: string }) => {
      console.log("TOAST:", options.title, options.description || "");
    },
  };
};

// Stub for @/components/ui/button
const Button = ({
  variant,
  size,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "ghost" | "destructive" | "outline" | "default";
  size?: "sm" | "icon" | "default";
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-colors";
  const sizeStyle = size === "sm" ? "h-9 px-3" : size === "icon" ? "h-10 w-10" : "h-10 px-4 py-2";
  
  let variantStyle = "bg-blue-600 text-white hover:bg-blue-700"; // default
  if (variant === "ghost") variantStyle = "text-gray-900 hover:bg-gray-100";
  if (variant === "destructive") variantStyle = "bg-red-600 text-white hover:bg-red-700";
  if (variant === "outline") variantStyle = "border border-gray-300 hover:bg-gray-100";

  return (
    <button className={`${baseStyle} ${sizeStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};

// ... (Các stub components khác Card, Input, Select... giữ nguyên)
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border bg-white text-gray-900 shadow-lg ${className}`}>{children}</div>
);
const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`font-semibold leading-none tracking-tight text-xl flex items-center gap-2 ${className}`}>{children}</h3>
);
const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm ${className}`}
      {...props}
    />
  )
);
const Select = ({ children, value, onValueChange }: { children: React.ReactNode; value?: string; onValueChange?: (value: string) => void; }) => (
  <select className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm" value={value} onChange={(e) => onValueChange?.(e.target.value)}>
    {children}
  </select>
);
const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => <option value={value}>{children}</option>;
const Badge = ({ variant, className, children }: { variant?: "destructive" | "default"; className?: string; children: React.ReactNode; }) => {
  let colorClass = "bg-gray-100 text-gray-800"; // default
  if (variant === "destructive") colorClass = "bg-red-100 text-red-800";
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>{children}</span>;
};
const Avatar = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>
);
const AvatarFallback = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-gray-700 ${className}`}>{children}</span>
);
const DataTable = ({
  columns,
  data,
  page,
  pageSize,
  pageCount,
  onPageChange,
  onPageSizeChange,
  loading,
}: {
  columns: { accessorKey: string; header: string; cell?: (row: any) => React.ReactNode }[];
  data: any[];
  page: number;
  pageSize: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading?: boolean;
}) => {
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.accessorKey} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading && (
            <tr><td colSpan={columns.length} className="text-center p-4">Đang tải...</td></tr>
          )}
          {!loading && paginatedData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col) => (
                <td key={col.accessorKey} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {col.cell ? col.cell(row) : row[col.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <Select value={pageSize.toString()} onValueChange={(val) => onPageSizeChange(Number(val))}>
          <SelectItem value="10">10 / trang</SelectItem>
          <SelectItem value="20">20 / trang</SelectItem>
          <SelectItem value="50">50 / trang</SelectItem>
        </Select>
        <div className="flex gap-2">
          <Button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>Trước</Button>
          <span className="p-2">Trang {page} / {pageCount}</span>
          <Button onClick={() => onPageChange(page + 1)} disabled={page >= pageCount}>Sau</Button>
        </div>
      </div>
    </div>
  );
};
// =====================================================
// 🧩 HẾT STUB COMPONENTS
// =====================================================

// Hàm định dạng tiền
const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

// ✅ SỬA 1: Nhận prop 'onLogout'
function StaffPage({ onLogout }: { onLogout: () => void }) {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [feedbackFilterStatus, setFeedbackFilterStatus] = useState<"activity" | "close" | "both">("activity");

  const staffRef = useRef<HTMLDivElement | null>(null);
  const banRef = useRef<HTMLDivElement | null>(null);
  const feedbackRef = useRef<HTMLDivElement | null>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ... (useQuery và data ảo giữ nguyên)
  const { data, isLoading } = useQuery({
    queryKey: ["staffPageData", { page, pageSize, query: debouncedSearchQuery }],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 500)); // Giả lập loading
      const roles = ["user", "moderator", "admin"];
      const emails = ["alice@example.com", "bob@example.com", "carol@example.com", "dan@example.com", "eva@example.com", "frank@example.com", "gina@example.com", "harry@example.com"];
      const allUsers = Array.from({ length: 40 }, (_, i) => {
        const email = emails[i % emails.length].replace("@", `+${i}@`);
        const name = `User ${i + 1}`;
        const role = roles[i % roles.length];
        const usage = Math.floor(Math.random() * 100);
        const wallet = Math.random() * 200000;
        const initials = name.split(" ").map((s) => s[0]).join("").toUpperCase();
        const topups = Array.from({ length: Math.floor(Math.random() * 3) }, () => ({ time: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString(), amount: Math.floor(Math.random() * 500000) + 10000 }));
        const purchases = Array.from({ length: Math.floor(Math.random() * 3) }, () => ({ time: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 60).toISOString(), qty: Math.ceil(Math.random() * 5), total: Math.floor(Math.random() * 200000) + 5000 }));
        const banned = Math.random() > 0.85;
        return { id: i + 1, email, name, role, usage, wallet, initials, topups, purchases, banned };
      });
      const allFeedbacks = Array.from({ length: 30 }, (_, i) => {
        const user = allUsers[i % allUsers.length];
        const time = new Date(Date.now() - i * 3600 * 1000).toISOString();
        const status = Math.random() > 0.7 ? "close" : "activity";
        return { id: i + 1, email: user.email, name: user.name, status, message: `Đây là nội dung feedback số ${i + 1}`, time };
      });
      const filteredUsers = allUsers.filter(u => 
        u.email.includes(debouncedSearchQuery) || 
        u.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
      const filteredFeedbacks = allFeedbacks.filter(f => 
        (f.email.includes(debouncedSearchQuery) || 
         f.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) &&
        (feedbackFilterStatus === 'both' ? true : f.status === feedbackFilterStatus)
      );
      return { users: filteredUsers, feedbacks: filteredFeedbacks };
    },
    placeholderData: (previousData) => previousData, // Giữ data cũ khi đang load data mới
  });

  const users = data?.users || [];
  const feedbacks = data?.feedbacks || [];
  const totalUsers = data?.users?.length || 0;
  const totalFeedbacks = data?.feedbacks?.length || 0;

  const scrollTo = (ref: any) => ref.current?.scrollIntoView({ behavior: "smooth" });

  // ... (Định nghĩa các cột 'staffColumns', 'banColumns', 'feedbackColumns' giữ nguyên)
  const staffColumns = [
    { 
      accessorKey: "name", 
      header: "Name", 
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{row.initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.name}</span>
        </div>
      )
    },
    { accessorKey: "email", header: "Email" },
    { 
      accessorKey: "role", 
      header: "Role", 
      cell: (row: any) => (
        <Badge className={
          row.role === 'admin' ? 'bg-red-100 text-red-800' :
          row.role === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }>{row.role}</Badge>
      )
    },
    { accessorKey: "usage", header: "Usage" },
    { 
      accessorKey: "wallet", 
      header: "Wallet", 
      cell: (row: any) => formatCurrency(row.wallet)
    },
    { 
      accessorKey: "topups", 
      header: "Topups", 
      cell: (row: any) => `${row.topups.length} lần`
    },
    { 
      accessorKey: "purchases", 
      header: "Purchases", 
      cell: (row: any) => `${row.purchases.length} lần`
    },
  ];

  const banColumns = [
    { 
      accessorKey: "name", 
      header: "Name", 
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{row.initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.name}</span>
        </div>
      )
    },
    { accessorKey: "email", header: "Email" },
    { 
      accessorKey: "banned", 
      header: "Status", 
      cell: (row: any) => (
        <Badge variant={row.banned ? 'destructive' : 'default'} className={row.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
          {row.banned ? 'Banned' : 'Active'}
        </Badge> 
      )
    },
    { 
      accessorKey: "actions", 
      header: "Actions", 
      cell: (row: any) => (
        row.banned ? (
          <Button size="sm" variant="outline" className="text-green-600 border-green-500" onClick={() => toast({ title: 'Đã unban (mock)' })}>
            <CheckCircle className="mr-2 h-4 w-4" /> Unban
          </Button>
        ) : (
          <Button size="sm" variant="destructive" onClick={() => toast({ title: 'Đã ban (mock)' })}>
            <Ban className="mr-2 h-4 w-4" /> Ban User
          </Button>
        )
      )
    }
  ];

  const feedbackColumns = [
    { accessorKey: "email", header: "Email" },
    { 
      accessorKey: "status", 
      header: "Status", 
      cell: (row: any) => (
        <Badge className={row.status === 'activity' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>
          {row.status}
        </Badge> 
      )
    },
    { 
      accessorKey: "time", 
      header: "Time", 
      cell: (row: any) => format(new Date(row.time), 'MMM d, yyyy h:mm a') 
    },
    { accessorKey: "message", header: "Message", cell: (row: any) => (
      <span className="truncate w-32 block">{row.message}</span>
    )},
    { 
      accessorKey: "actions", 
      header: "Actions", 
      cell: (row: any) => (
        <Button size="icon" variant="ghost" onClick={() => toast({ title: 'Reply mock', description: row.message })}>
          <MessageSquare className="h-5 w-5 text-blue-600" />
        </Button>
      )
    }
  ];

  return (
    <div className="flex gap-6 p-6 bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 sticky top-6 self-start">
        <Card className="shadow-none border-0">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2">
              <Button variant="ghost" className="justify-start gap-2" onClick={() => scrollTo(staffRef)}><Users className="mr-2 h-4 w-4 text-blue-500" /> Staff Info</Button>
              <Button variant="ghost" className="justify-start gap-2" onClick={() => scrollTo(banRef)}><UserX className="mr-2 h-4 w-4 text-red-500" /> Ban/Unban</Button>
              <Button variant="ghost" className="justify-start gap-2" onClick={() => scrollTo(feedbackRef)}><MessageSquare className="mr-2 h-4 w-4 text-green-500" /> Feedback</Button>
            </div>
            
            {/* ✅ SỬA 2: Thêm nút Logout vào đây */}
            <Button 
              variant="destructive" 
              className="justify-start gap-2 mt-10 w-full" 
              onClick={onLogout}
            >
              <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
            </Button>
          </CardContent>
        </Card>
      </aside>

      {/* Main content */}
      <main className="flex-1 space-y-8">
        
        {/* ... (Toàn bộ nội dung chính <main> giữ nguyên) ... */}
        {/* === Thanh tìm kiếm chung === */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Tìm kiếm email hoặc tên user..."
            className="pl-10 h-12 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Staff Info Section */}
        <div ref={staffRef} id="staff">
          <Card>
            <CardHeader>
              <CardTitle><Users className="text-blue-600"/> Staff Information ({totalUsers})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <DataTable
                columns={staffColumns}
                data={users}
                page={page}
                pageSize={pageSize}
                pageCount={Math.ceil(totalUsers / pageSize)}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                loading={isLoading}
              />
              <div className="mt-4 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={users.map(u => ({ name: u.name, usage: u.usage }))}>
                    <XAxis dataKey="name" hide={true} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ban/Unban Section */}
        <div ref={banRef} id="ban">
          <Card>
            <CardHeader>
              <CardTitle><UserX className="text-red-600" /> Ban / Unban Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <DataTable
                columns={banColumns}
                data={users}
                page={page}
                pageSize={pageSize}
                pageCount={Math.ceil(totalUsers / pageSize)}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                loading={isLoading}
              />
              <div className="mt-4 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'Banned', value: users.filter(u=>u.banned).length }, { name: 'Active', value: users.filter(u=>!u.banned).length }]}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ff4d4f" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Section */}
        <div ref={feedbackRef} id="feedback">
          <Card>
            <CardHeader>
              <CardTitle><MessageSquare className="text-green-600" /> User Feedback ({totalFeedbacks})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* === Filter Bar === */}
              <div className="w-1/3">
                <Select value={feedbackFilterStatus} onValueChange={(val) => setFeedbackFilterStatus(val as any)}>
                  <SelectItem value="activity">Đang hoạt động (Activity)</SelectItem>
                  <SelectItem value="close">Đã đóng (Close)</SelectItem>
                  <SelectItem value="both">Tất cả (Both)</SelectItem>
                </Select>
              </div>
              <DataTable
                columns={feedbackColumns}
                data={feedbacks}
                page={page}
                pageSize={pageSize}
                pageCount={Math.ceil(totalFeedbacks / pageSize)}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                loading={isLoading}
              />
              <div className="mt-4 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Activity', value: feedbacks.filter(f => f.status === 'activity').length },
                    { name: 'Close', value: feedbacks.filter(f => f.status === 'close').length }
                  ]}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// ✅ SỬA 3: Chấp nhận 'onLogout' và truyền nó xuống cho 'StaffPage'
export default function StaffPageWrapper({ onLogout }: { onLogout: () => void }) {
  return (
    <QueryClientProvider client={queryClient}>
      <StaffPage onLogout={onLogout} />
    </QueryClientProvider>
  );
}