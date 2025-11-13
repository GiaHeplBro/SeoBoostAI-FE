import React, { useRef, useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import axios from "axios";
// ⛔️ Sửa lỗi: Import 'LogOut' icon
import {
  CheckCircle,
  XCircle,
  LayoutDashboard,
  Users,
  Wallet,
  Settings,
  DollarSign,
  Clock,
  UserPlus,
  LogOut, // 👈 THÊM ICON NÀY
} from "lucide-react";
// ⛔️ Sửa lỗi: Import 'recharts'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

// =====================================================
// 🧩 STUB COMPONENTS (Để fix lỗi imports)
// =====================================================
const queryClient = new QueryClient();

// Stub for @/components/ui/button
const Button = ({
  variant,
  size,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "ghost" | "destructive" | "outline" | "default" | "secondary";
  size?: "sm" | "icon" | "default";
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-colors";
  const sizeStyle = size === "sm" ? "h-9 px-3" : "h-10 px-4 py-2";
  let variantStyle = "bg-blue-600 text-white hover:bg-blue-700";
  if (variant === "outline") variantStyle = "border border-gray-300 hover:bg-gray-100";
  if (variant === "ghost") variantStyle = "hover:bg-gray-100";
  if (variant === "destructive") variantStyle = "bg-red-600 text-white hover:bg-red-700";
  return (
    <button className={`${baseStyle} ${sizeStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};

// Stub for @/components/ui/card
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border bg-white text-gray-900 shadow ${className}`}>{children}</div>
);
const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);
const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

// Stub for @/components/ui/table
const Table = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <table className={`w-full caption-bottom text-sm ${className}`}>{children}</table>
);
const TableHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <thead className={`[&_tr]:border-b ${className}`}>{children}</thead>
);
const TableBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <tbody className={`[&_tr:last-child]:border-0 ${className}`}>{children}</tbody>
);
const TableRow = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <tr className={`border-b transition-colors hover:bg-gray-100 ${className}`}>{children}</tr>
);
const TableHead = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <th className={`h-12 px-4 text-left align-middle font-medium text-gray-500 ${className}`}>{children}</th>
);
const TableCell = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td className={`p-4 align-middle ${className}`}>{children}</td>
);

// Stub for @/components/ui/badge
const Badge = ({
  variant,
  className,
  children,
}: {
  variant?: "destructive" | "default" | "secondary" | "outline";
  className?: string;
  children: React.ReactNode;
}) => {
  let variantStyle = "bg-blue-600 text-white";
  if (variant === "destructive") variantStyle = "bg-red-600 text-white";
  if (variant === "secondary") variantStyle = "bg-gray-200 text-gray-800";
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantStyle} ${className}`}>
      {children}
    </span>
  );
};

// Stub for @/hooks/use-toast
const useToast = () => {
  return {
    toast: ({ title, description }: { title: string; description: string }) => {
      console.log(`TOAST: ${title} - ${description}`);
    },
  };
};

// =====================================================
// 🧩 HẾT STUB COMPONENTS
// =====================================================


// ========================= 🧩 API SETUP =========================
const adminApi = axios.create({
  baseURL: "https://localhost:7144", // chỉnh URL backend thật tại đây
});

// ========================= 🧩 TYPES =========================
interface Transaction {
  id: number;
  walletId: number;
  money: number;
  description: string;
  type: "Deposit" | "Withdraw"; // Type
  status: "Pending" | "Completed" | "Failed";
  bankTransId: string;
  createdAt: string;
  wallet?: { user?: { fullName: string } };
}

interface User {
  id: number;
  fullName: string;
  email: string;
  role: "member" | "staff";
  status: "active" | "banned";
}

interface FunctionUsage {
  id: number;
  name: string;
  usageCount: number;
  uniqueUsers: number;
  lastUsed: string;
}

// ========================= 🧩 MOCK DATA (Đã thêm nhiều) =========================
const mockUsers: User[] = [
  { id: 1, fullName: "Nguyễn Văn A", email: "a@gmail.com", role: "member", status: "active" },
  { id: 2, fullName: "Trần Thị B", email: "b@gmail.com", role: "staff", status: "active" },
  { id: 3, fullName: "Phạm Văn C", email: "c@gmail.com", role: "member", status: "banned" },
  { id: 4, fullName: "Lê Thị D", email: "d@gmail.com", role: "member", status: "active" },
  { id: 5, fullName: "Hoàng Văn E", email: "e@gmail.com", role: "member", status: "active" },
  { id: 6, fullName: "Đỗ Thị F", email: "f@gmail.com", role: "staff", status: "active" },
  { id: 7, fullName: "Vũ Văn G", email: "g@gmail.com", role: "member", status: "active" },
  { id: 8, fullName: "Bùi Thị H", email: "h@gmail.com", role: "member", status: "banned" },
  { id: 9, fullName: "Lý Văn I", email: "i@gmail.com", role: "member", status: "active" },
  { id: 10, fullName: "Trịnh Thị K", email: "k@gmail.com", role: "member", status: "active" },
];

const mockTransactions: Transaction[] = [
  { id: 1, walletId: 101, money: 500000, description: "Nạp ví Momo", type: "Deposit", status: "Pending", bankTransId: "TX1001", createdAt: "2025-11-10T10:00:00Z", wallet: { user: { fullName: "Nguyễn Văn A" } } },
  { id: 2, walletId: 102, money: 300000, description: "Thanh toán Premium", type: "Withdraw", status: "Completed", bankTransId: "TX1002", createdAt: "2025-11-09T15:30:00Z", wallet: { user: { fullName: "Trần Thị B" } } },
  { id: 3, walletId: 103, money: 100000, description: "Nạp VNPay", type: "Deposit", status: "Completed", bankTransId: "TX1003", createdAt: "2025-11-08T12:00:00Z", wallet: { user: { fullName: "Phạm Văn C" } } },
  { id: 4, walletId: 104, money: 50000, description: "Mua lượt tải", type: "Withdraw", status: "Completed", bankTransId: "TX1004", createdAt: "2025-11-07T08:00:00Z", wallet: { user: { fullName: "Lê Thị D" } } },
  { id: 5, walletId: 105, money: 200000, description: "Nạp ví Momo", type: "Deposit", status: "Failed", bankTransId: "TX1005", createdAt: "2025-11-06T14:20:00Z", wallet: { user: { fullName: "Hoàng Văn E" } } },
  { id: 6, walletId: 106, money: 1000000, description: "Nạp ZaloPay", type: "Deposit", status: "Pending", bankTransId: "TX1006", createdAt: "2025-11-05T18:10:00Z", wallet: { user: { fullName: "Vũ Văn G" } } },
  { id: 7, walletId: 107, money: 250000, description: "Thanh toán AI", type: "Withdraw", status: "Completed", bankTransId: "TX1007", createdAt: "2025-11-04T09:30:00Z", wallet: { user: { fullName: "Bùi Thị H" } } },
  { id: 8, walletId: 108, money: 150000, description: "Nạp VNPay", type: "Deposit", status: "Completed", bankTransId: "TX1008", createdAt: "2025-10-20T11:00:00Z", wallet: { user: { fullName: "Lý Văn I" } } },
  { id: 9, walletId: 109, money: 500000, description: "Nạp ví Momo", type: "Deposit", status: "Completed", bankTransId: "TX1009", createdAt: "2025-10-15T16:45:00Z", wallet: { user: { fullName: "Trịnh Thị K" } } },
  { id: 10, walletId: 110, money: 300000, description: "Thanh toán Premium", type: "Withdraw", status: "Pending", bankTransId: "TX1010", createdAt: "2025-09-30T10:00:00Z", wallet: { user: { fullName: "Nguyễn Văn A" } } },
  { id: 11, walletId: 111, money: 750000, description: "Nạp ZaloPay", type: "Deposit", status: "Completed", bankTransId: "TX1011", createdAt: "2025-09-15T13:00:00Z", wallet: { user: { fullName: "Trần Thị B" } } },
  { id: 12, walletId: 112, money: 100000, description: "Mua lượt tải", type: "Withdraw", status: "Completed", bankTransId: "TX1012", createdAt: "2025-08-25T07:00:00Z", wallet: { user: { fullName: "Lê Thị D" } } },
];

const mockFunctionUsage: FunctionUsage[] = [
  { id: 1, name: "Tải video (HD)", usageCount: 1234, uniqueUsers: 512, lastUsed: "2025-11-13T09:00:00Z" },
  { id: 2, name: "Tạo ảnh AI (Nâng cao)", usageCount: 856, uniqueUsers: 421, lastUsed: "2025-11-12T13:20:00Z" },
  { id: 3, name: "Dịch thuật (Văn bản)", usageCount: 450, uniqueUsers: 312, lastUsed: "2025-11-11T08:40:00Z" },
  { id: 4, name: "Phân tích SEO (Từ khóa)", usageCount: 720, uniqueUsers: 250, lastUsed: "2025-11-13T01:15:00Z" },
  { id: 5, name: "Kiểm tra Backlink", usageCount: 310, uniqueUsers: 180, lastUsed: "2025-11-12T05:00:00Z" },
];

// Dữ liệu cho Thẻ KPI Dashboard
const kpiStats = {
  totalRevenue: mockTransactions
    .filter(tx => tx.status === "Completed" && tx.type === "Deposit")
    .reduce((sum, tx) => sum + tx.money, 0),
  totalUsers: mockUsers.length,
  pendingTxs: mockTransactions.filter(tx => tx.status === "Pending").length,
  newUsers: 2, // Dữ liệu giả định
};

// Dữ liệu cho Biểu đồ Doanh thu Dashboard
const mockRevenueByMonth = [
  { name: "T8", "Doanh Thu": 600000 },
  { name: "T9", "Doanh Thu": 1050000 },
  { name: "T10", "Doanh Thu": 650000 },
  { name: "T11", "Doanh Thu": 850000 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// ========================= 🧩 API FAKE FUNCTIONS =========================
const fetchTransactions = async (): Promise<Transaction[]> => Promise.resolve(mockTransactions);
const fetchUsers = async (): Promise<User[]> => Promise.resolve(mockUsers);
const fetchFunctionUsage = async (): Promise<FunctionUsage[]> => Promise.resolve(mockFunctionUsage);
const updateTransactionStatus = async ({ id, status }: { id: number; status: string }) => {
  console.log(`(Giả lập) Cập nhật transaction ${id} -> ${status}`);
  // Giả lập việc cập nhật
  const index = mockTransactions.findIndex(tx => tx.id === id);
  if (index !== -1) {
    mockTransactions[index].status = status as "Completed" | "Failed";
  }
  return Promise.resolve({ success: true });
};

// ========================= 🧩 COMPONENT =========================
// ⛔️ Sửa lỗi: Nhận 'onLogout' prop
function AdminPage({ onLogout }: { onLogout: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: transactions } = useQuery({ queryKey: ["adminTransactions"], queryFn: fetchTransactions });
  const { data: users } = useQuery({ queryKey: ["adminUsers"], queryFn: fetchUsers });
  const { data: functionUsage } = useQuery({ queryKey: ["adminFunctionUsage"], queryFn: fetchFunctionUsage });

  const statusMutation = useMutation({
    mutationFn: updateTransactionStatus,
    onSuccess: () => {
      toast({ title: "✅ Thành công", description: "Đã cập nhật trạng thái giao dịch." });
      queryClient.invalidateQueries({ queryKey: ["adminTransactions"] });
    },
    onError: (error) => {
      toast({ title: "❌ Lỗi", description: (error as Error).message, variant: "destructive" });
    },
  });

  const handleStatusUpdate = (id: number, status: "Completed" | "Failed") => {
    statusMutation.mutate({ id, status });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <Badge className="bg-green-500/80 hover:bg-green-600 text-white">Hoàn thành</Badge>;
      case "failed":
        return <Badge variant="destructive">Thất bại</Badge>;
      default:
        return <Badge className="bg-yellow-500/80 hover:bg-yellow-600 text-white">Đang chờ</Badge>;
    }
  };

  // ===== Scroll Refs =====
  const dashboardRef = useRef<HTMLDivElement>(null);
  const usersRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);
  const functionRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) =>
    ref.current?.scrollIntoView({ behavior: "smooth" });

  // ===========================================
  // 🌟 DỮ LIỆU TÍNH TOÁN CHO BIỂU ĐỒ (useMemo) 🌟
  // ===========================================

  // Tính toán dữ liệu cho biểu đồ tròn (PieChart) Tỷ lệ User
  const userRoleData = useMemo(() => {
    if (!users) return [];
    const counts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<"member" | "staff", number>);
    return Object.entries(counts).map(([name, value]) => ({ name: name === 'member' ? 'Member' : 'Staff', value }));
  }, [users]);

  // Tính toán dữ liệu cho biểu đồ Tỷ lệ Nạp/Rút
  const transactionTypeData = useMemo(() => {
    if (!transactions) return [];
    const counts = transactions.filter(tx => tx.status === 'Completed').reduce((acc, tx) => {
      acc[tx.type] = (acc[tx.type] || 0) + tx.money;
      return acc;
    }, {} as Record<"Deposit" | "Withdraw", number>);
    return Object.entries(counts).map(([name, value]) => ({ name: name === 'Deposit' ? 'Nạp tiền' : 'Rút tiền', value }));
  }, [transactions]);

  // Tính toán dữ liệu cho Biến động số dư
  const balanceOverTimeData = useMemo(() => {
    if (!transactions) return [];
    let balance = 0;
    return transactions
      .filter(tx => tx.status === 'Completed')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(tx => {
        balance += (tx.type === 'Deposit' ? tx.money : -tx.money);
        return {
          date: new Date(tx.createdAt).toLocaleDateString('vi-VN'),
          Balance: balance,
        };
      });
  }, [transactions]);

  // Sắp xếp dữ liệu cho Biểu đồ Lượt sử dụng
  const sortedFunctionUsage = useMemo(() => {
    if (!functionUsage) return [];
    return [...functionUsage].sort((a, b) => a.usageCount - b.usageCount);
  }, [functionUsage]);

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900">
      {/* ===== Sidebar ===== */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-6 shadow-lg flex flex-col"> {/* 👈 Thêm flex-col */}
        <div className="flex-grow"> {/* 👈 Wrapper cho nội dung chính của sidebar */}
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Settings className="text-blue-400" />
            Admin Panel
          </h2>
          <nav className="flex flex-col space-y-3">
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-gray-700 justify-start gap-2" onClick={() => scrollTo(dashboardRef)}>
              <LayoutDashboard size={18} /> Dashboard
            </Button>
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-gray-700 justify-start gap-2" onClick={() => scrollTo(usersRef)}>
              <Users size={18} /> Người dùng
            </Button>
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-gray-700 justify-start gap-2" onClick={() => scrollTo(walletRef)}>
              <Wallet size={18} /> Ví & Giao dịch
            </Button>
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-gray-700 justify-start gap-2" onClick={() => scrollTo(functionRef)}>
              <Settings size={18} /> Lượt sử dụng
            </Button>
          </nav>
        </div>
        {/* ⛔️ Sửa lỗi: Thêm nút Logout ở cuối sidebar */}
        <div className="mt-auto">
          <Button 
            variant="destructive" 
            className="w-full justify-start gap-2 bg-red-600/80 hover:bg-red-600 text-white" 
            onClick={onLogout}
          >
            <LogOut size={18} /> Đăng xuất
          </Button>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <main className="ml-64 w-[calc(100%-16rem)] px-10 py-10 space-y-16 scroll-smooth min-h-screen">

        {/* --- 1. Dashboard --- */}
        <section ref={dashboardRef}>
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <LayoutDashboard className="text-blue-600" />
            Dashboard tổng quan
          </h1>
          
          {/* === Thẻ KPI === */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpiStats.totalRevenue.toLocaleString("vi-VN")}₫</div>
                <p className="text-xs text-gray-500">+10.2% so với tháng trước</p>
              </CardContent>
            </Card>
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng Người Dùng</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpiStats.totalUsers}</div>
                <p className="text-xs text-gray-500">+2 người dùng mới tuần này</p>
              </CardContent>
            </Card>
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Giao dịch chờ</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpiStats.pendingTxs}</div>
                <p className="text-xs text-gray-500">Tổng {mockTransactions.filter(tx => tx.status === 'Pending').reduce((sum, tx) => sum + tx.money, 0).toLocaleString("vi-VN")}₫</p>
              </CardContent>
            </Card>
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Người dùng mới (W)</CardTitle>
                <UserPlus className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{kpiStats.newUsers}</div>
                <p className="text-xs text-gray-500">Trong 7 ngày qua</p>
              </CardContent>
            </Card>
          </div>

          {/* === Biểu đồ Doanh thu === */}
          <Card className="shadow-lg">
            <CardHeader><CardTitle>Doanh thu theo tháng (2025)</CardTitle></CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockRevenueByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toLocaleString("vi-VN")}tr`} />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString("vi-VN")}₫`} />
                  <Legend />
                  <Area type="monotone" dataKey="Doanh Thu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* --- 2. Quản lý người dùng --- */}
        <section ref={usersRef}>
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Users className="text-blue-600" />
            Quản lý người dùng ({users?.length || 0})
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* === Bảng Người dùng === */}
            <Card className="lg:col-span-2 shadow-lg">
              <CardHeader><CardTitle>Danh sách người dùng</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.fullName}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge className={u.role === "staff" ? "bg-blue-500 text-white" : "bg-gray-400"}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.status === "active" ? "default" : "destructive"}
                            className={u.status === "active" ? "bg-green-500 text-white" : "bg-red-500 text-white"}
                          >
                            {u.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* === Biểu đồ Tỷ lệ User === */}
            <Card className="lg:col-span-1 shadow-lg">
              <CardHeader><CardTitle>Tỷ lệ Member / Staff</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={userRoleData} dataKey="value" cx="50%" cy="50%" outerRadius={80} labelLine={false}
                         label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {userRoleData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value} người`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* --- 3. Quản lý ví & giao dịch --- */}
        <section ref={walletRef}>
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Wallet className="text-blue-600" />
            Ví & Giao dịch
          </h1>
          {/* === Bảng Giao dịch === */}
          <Card className="mb-6 shadow-lg">
            <CardHeader><CardTitle>Giao dịch gần đây</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Nội dung</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.wallet?.user?.fullName}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell className={tx.type === 'Deposit' ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {tx.type === 'Deposit' ? '+' : '-'}
                        {tx.money.toLocaleString("vi-VN")}₫
                      </TableCell>
                      <TableCell>
                        <Badge variant={tx.type === 'Deposit' ? 'default' : 'secondary'} className={tx.type === 'Deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(tx.createdAt).toLocaleString("vi-VN")}</TableCell>
                      <TableCell><StatusBadge status={tx.status} /></TableCell>
                      <TableCell>
                        {tx.status === "Pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-green-500 text-green-600" onClick={() => handleStatusUpdate(tx.id, "Completed")}>
                              <CheckCircle className="h-4 w-4 mr-1" /> Duyệt
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-500 text-red-600" onClick={() => handleStatusUpdate(tx.id, "Failed")}>
                              <XCircle className="h-4 w-4 mr-1" /> Hủy
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* === Biểu đồ Ví & Giao dịch === */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader><CardTitle>Biến động số dư (Giao dịch đã hoàn thành)</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={balanceOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toLocaleString("vi-VN")}k`} />
                    <Tooltip formatter={(value: number) => `${value.toLocaleString("vi-VN")}₫`} />
                    <Legend />
                    <Line type="monotone" dataKey="Balance" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader><CardTitle>Tỷ lệ Nạp / Rút (Đã hoàn thành)</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={transactionTypeData} dataKey="value" cx="50%" cy="50%" outerRadius={80} labelLine={false}
                         label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {transactionTypeData.map((entry, i) => (
                        <Cell key={i} fill={entry.name === 'Nạp tiền' ? COLORS[1] : COLORS[3]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toLocaleString("vi-VN")}₫`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* --- 4. Lượt sử dụng chức năng --- */}
        <section ref={functionRef}>
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Settings className="text-blue-600" />
            Lượt sử dụng chức năng
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* === Bảng Chức năng === */}
            <Card className="lg:col-span-2 shadow-lg">
              <CardHeader><CardTitle>Thống kê chức năng</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chức năng</TableHead>
                      <TableHead>Lượt sử dụng</TableHead>
                      <TableHead>Người dùng duy nhất</TableHead>
                      <TableHead>Lần gần nhất</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {functionUsage?.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.name}</TableCell>
                        <TableCell>{f.usageCount.toLocaleString("vi-VN")}</TableCell>
                        <TableCell>{f.uniqueUsers.toLocaleString("vi-VN")}</TableCell>
                        <TableCell>{new Date(f.lastUsed).toLocaleString("vi-VN")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* === Biểu đồ Top Chức năng === */}
            <Card className="lg:col-span-1 shadow-lg">
              <CardHeader><CardTitle>Top chức năng (Lượt sử dụng)</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedFunctionUsage} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" scale="band" />
                    <Tooltip formatter={(value: number) => `${value.toLocaleString("vi-VN")} lượt`} />
                    <Legend />
                    <Bar dataKey="usageCount" name="Lượt sử dụng" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

// ✅ ĐÂY LÀ EXPORT DEFAULT DUY NHẤT: Bọc component trong QueryClientProvider
export default function AdminPageWrapper({ onLogout }: { onLogout: () => void }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminPage onLogout={onLogout} />
    </QueryClientProvider>
  );
}