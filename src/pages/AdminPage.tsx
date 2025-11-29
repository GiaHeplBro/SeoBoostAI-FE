import React, { useRef, useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
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
  LogOut,
} from "lucide-react";
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

// ✅ IMPORT API
import api from '@/axiosInstance';

// =====================================================
// 🧩 STUB COMPONENTS (GIỮ NGUYÊN ĐỂ UI KHÔNG VỠ)
// =====================================================
const queryClient = new QueryClient();
// ... (Giữ nguyên Button, Card, Table, Badge như cũ)
const Button = ({ variant, size, className, children, ...props }: any) => {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors";
  const sz = size === "sm" ? "h-9 px-3" : "h-10 px-4 py-2";
  let clr = "bg-blue-600 text-white hover:bg-blue-700";
  if (variant === "destructive") clr = "bg-red-600 text-white";
  if (variant === "outline") clr = "border border-gray-300 hover:bg-gray-100";
  if (variant === "ghost") clr = "hover:bg-gray-100 text-gray-900";
  return <button className={`${base} ${sz} ${clr} ${className}`} {...props}>{children}</button>;
};
const Card = ({ children, className }: any) => <div className={`rounded-xl border bg-white text-gray-900 shadow ${className}`}>{children}</div>;
const CardHeader = ({ children, className }: any) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className }: any) => <h3 className={`font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardContent = ({ children, className }: any) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const Table = ({ children, className }: any) => <table className={`w-full caption-bottom text-sm ${className}`}>{children}</table>;
const TableHeader = ({ children, className }: any) => <thead className={`[&_tr]:border-b ${className}`}>{children}</thead>;
const TableBody = ({ children, className }: any) => <tbody className={`[&_tr:last-child]:border-0 ${className}`}>{children}</tbody>;
const TableRow = ({ children, className }: any) => <tr className={`border-b transition-colors hover:bg-gray-100 ${className}`}>{children}</tr>;
const TableHead = ({ children, className }: any) => <th className={`h-12 px-4 text-left align-middle font-medium text-gray-500 ${className}`}>{children}</th>;
const TableCell = ({ children, className }: any) => <td className={`p-4 align-middle ${className}`}>{children}</td>;
const Badge = ({ variant, className, children }: any) => {
  let clr = "bg-blue-600 text-white";
  if (variant === "destructive") clr = "bg-red-600 text-white";
  if (variant === "secondary") clr = "bg-gray-200 text-gray-800";
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${clr} ${className}`}>{children}</span>;
};
const useToast = () => ({ toast: (opts: any) => console.log("Toast:", opts) });

// ========================= 🧩 TYPES =========================
interface Transaction {
  id: number;
  walletId: number;
  money: number;
  description: string;
  type: "Deposit" | "Withdraw";
  status: "Pending" | "Completed" | "Failed";
  bankTransId: string;
  createdAt: string;
  wallet?: { user?: { fullName: string } };
}

interface User {
  id: number;
  fullName: string;
  email: string;
  role: "member" | "staff" | "admin";
  status: "active" | "banned";
}

interface FunctionUsage {
  id: number;
  name: string;
  usageCount: number;
  uniqueUsers: number;
  lastUsed: string;
}

// ========================= 🧩 API CALLS =========================
const fetchTransactions = async (): Promise<Transaction[]> => {
  const res = await api.get('/api/Transactions'); 
  return res.data || []; 
};

const fetchUsers = async (): Promise<User[]> => {
  const res = await api.get('/api/Users'); 
  return res.data || [];
};

const fetchFunctionUsage = async (): Promise<FunctionUsage[]> => {
  const res = await api.get('/api/Statistics/FunctionUsage'); 
  return res.data || [];
};

const updateTransactionStatus = async ({ id, status }: { id: number; status: string }) => {
  const res = await api.put(`/api/Transactions/${id}/status`, JSON.stringify(status), {
    headers: { 'Content-Type': 'application/json' }
  }); 
  return res.data;
};

// ========================= 🧩 COMPONENT =========================
function AdminPage({ onLogout }: { onLogout: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Lấy dữ liệu thật
  const { data: transactions = [] } = useQuery({ queryKey: ["adminTransactions"], queryFn: fetchTransactions });
  const { data: users = [] } = useQuery({ queryKey: ["adminUsers"], queryFn: fetchUsers });
  const { data: functionUsage = [] } = useQuery({ queryKey: ["adminFunctionUsage"], queryFn: fetchFunctionUsage });

  const statusMutation = useMutation({
    mutationFn: updateTransactionStatus,
    onSuccess: () => {
      toast({ title: "✅ Thành công", description: "Đã cập nhật trạng thái." });
      queryClient.invalidateQueries({ queryKey: ["adminTransactions"] });
    },
    onError: (error) => {
       console.error(error);
       toast({ title: "❌ Lỗi", description: "Không thể cập nhật trạng thái", variant: "destructive" });
    },
  });

  const handleStatusUpdate = (id: number, status: "Completed" | "Failed") => {
    statusMutation.mutate({ id, status });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status?.toLowerCase()) {
      case "completed": return <Badge className="bg-green-500/80 hover:bg-green-600 text-white">Hoàn thành</Badge>;
      case "failed": return <Badge variant="destructive">Thất bại</Badge>;
      default: return <Badge className="bg-yellow-500/80 hover:bg-yellow-600 text-white">Đang chờ</Badge>;
    }
  };

  // Scroll Refs
  const dashboardRef = useRef<HTMLDivElement>(null);
  const usersRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);
  const functionRef = useRef<HTMLDivElement>(null);
  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => ref.current?.scrollIntoView({ behavior: "smooth" });

  // ===========================================
  // 🌟 TÍNH TOÁN DATA CHO BIỂU ĐỒ (REAL-TIME) 🌟
  // ===========================================
  
  // 1. KPI Stats
  const kpiStats = useMemo(() => ({
    totalRevenue: transactions
      .filter(tx => tx.status === "Completed" && tx.type === "Deposit")
      .reduce((sum, tx) => sum + tx.money, 0),
    totalUsers: users.length,
    pendingTxs: transactions.filter(tx => tx.status === "Pending").length,
    newUsers: users.length, // Cần API trả về createdAt để lọc user mới chính xác
  }), [transactions, users]);

  // 2. Biểu đồ tròn User Role
  const userRoleData = useMemo(() => {
    const counts = users.reduce((acc, user) => {
      const r = user.role?.toLowerCase() || 'member';
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name: name==='member'?'Member':'Staff', value }));
  }, [users]);

  // 3. Biểu đồ tròn Transaction Type
  const transactionTypeData = useMemo(() => {
    const counts = transactions.filter(tx => tx.status === 'Completed').reduce((acc, tx) => {
      acc[tx.type] = (acc[tx.type] || 0) + tx.money;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name: name === 'Deposit' ? 'Nạp tiền' : 'Rút tiền', value }));
  }, [transactions]);

  // 4. Biểu đồ Line Balance (Số dư theo thời gian)
  const balanceOverTimeData = useMemo(() => {
    let balance = 0;
    return transactions
      .filter(tx => tx.status === 'Completed')
      // Sắp xếp theo ngày
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(tx => {
        balance += (tx.type === 'Deposit' ? tx.money : -tx.money);
        return {
          date: new Date(tx.createdAt).toLocaleDateString('vi-VN'),
          Balance: balance,
        };
      });
  }, [transactions]);

  // 5. Biểu đồ Top Function Usage
  const sortedFunctionUsage = useMemo(() => {
    return [...functionUsage].sort((a, b) => a.usageCount - b.usageCount);
  }, [functionUsage]);

  // 6. Biểu đồ Area Chart (Doanh thu theo tháng - Tính từ Data thật)
  const revenueByMonthData = useMemo(() => {
      const monthMap: Record<string, number> = {};
      transactions
        .filter(tx => tx.status === "Completed" && tx.type === "Deposit")
        .forEach(tx => {
           const date = new Date(tx.createdAt);
           const key = `T${date.getMonth() + 1}`; // VD: T11
           monthMap[key] = (monthMap[key] || 0) + tx.money;
        });
      
      // Chuyển map thành array và sort theo tháng
      return Object.keys(monthMap).map(key => ({
          name: key,
          "Doanh Thu": monthMap[key]
      })).sort((a,b) => parseInt(a.name.substring(1)) - parseInt(b.name.substring(1)));
  }, [transactions]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-6 shadow-lg flex flex-col">
        <div className="flex-grow">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Settings className="text-blue-400" /> Admin Panel</h2>
          <nav className="flex flex-col space-y-3">
            <Button variant="ghost" className="text-white justify-start gap-2" onClick={() => scrollTo(dashboardRef)}><LayoutDashboard size={18} /> Dashboard</Button>
            <Button variant="ghost" className="text-white justify-start gap-2" onClick={() => scrollTo(usersRef)}><Users size={18} /> Người dùng</Button>
            <Button variant="ghost" className="text-white justify-start gap-2" onClick={() => scrollTo(walletRef)}><Wallet size={18} /> Ví & Giao dịch</Button>
            <Button variant="ghost" className="text-white justify-start gap-2" onClick={() => scrollTo(functionRef)}><Settings size={18} /> Lượt sử dụng</Button>
          </nav>
        </div>
        <div className="mt-auto">
          <Button variant="destructive" className="w-full justify-start gap-2" onClick={onLogout}><LogOut size={18} /> Đăng xuất</Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 w-[calc(100%-16rem)] px-10 py-10 space-y-16 scroll-smooth min-h-screen">
        
        {/* --- Dashboard Section --- */}
        <section ref={dashboardRef}>
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3"><LayoutDashboard className="text-blue-600" /> Dashboard tổng quan</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card><CardHeader><CardTitle className="text-sm">Tổng Doanh Thu</CardTitle><DollarSign className="h-4 w-4 text-green-500"/></CardHeader><CardContent><div className="text-2xl font-bold">{kpiStats.totalRevenue.toLocaleString("vi-VN")}₫</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Tổng Người Dùng</CardTitle><Users className="h-4 w-4 text-blue-500"/></CardHeader><CardContent><div className="text-2xl font-bold">{kpiStats.totalUsers}</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Giao dịch chờ</CardTitle><Clock className="h-4 w-4 text-yellow-500"/></CardHeader><CardContent><div className="text-2xl font-bold">{kpiStats.pendingTxs}</div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">User mới</CardTitle><UserPlus className="h-4 w-4 text-indigo-500"/></CardHeader><CardContent><div className="text-2xl font-bold">{kpiStats.newUsers}</div></CardContent></Card>
          </div>
          
          {/* BIỂU ĐỒ DOANH THU THẬT */}
          <Card className="shadow-lg">
            <CardHeader><CardTitle>Doanh thu theo tháng (Thực tế)</CardTitle></CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByMonthData.length > 0 ? revenueByMonthData : [{name: 'Chưa có GD', "Doanh Thu": 0}]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value:any)=>value.toLocaleString()+"₫"}/><Area type="monotone" dataKey="Doanh Thu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* --- Users Section --- */}
        <section ref={usersRef}>
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3"><Users className="text-blue-600" /> Quản lý người dùng</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-lg">
              <CardHeader><CardTitle>Danh sách người dùng</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Họ tên</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Trạng thái</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {users.slice(0, 10).map((u) => ( // Chỉ hiện 10 user đầu tiên để demo table
                      <TableRow key={u.id}>
                        <TableCell>{u.fullName}</TableCell><TableCell>{u.email}</TableCell>
                        <TableCell><Badge className="bg-gray-500 text-white">{u.role}</Badge></TableCell>
                        <TableCell><Badge variant={u.status==='active'?'default':'destructive'}>{u.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            {/* BIỂU ĐỒ TRÒN USER */}
            <Card className="lg:col-span-1 shadow-lg">
              <CardHeader><CardTitle>Tỷ lệ Member / Staff</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={userRoleData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({name, percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                      {userRoleData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                    </Pie>
                    <Tooltip/><Legend/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* --- Wallet Section --- */}
        <section ref={walletRef}>
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3"><Wallet className="text-blue-600" /> Ví & Giao dịch</h1>
          <Card className="mb-6 shadow-lg">
            <CardHeader><CardTitle>Giao dịch</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Nội dung</TableHead><TableHead>Số tiền</TableHead><TableHead>Trạng thái</TableHead><TableHead>Hành động</TableHead></TableRow></TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.wallet?.user?.fullName || "N/A"}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>{tx.money.toLocaleString()}₫</TableCell>
                      <TableCell><StatusBadge status={tx.status} /></TableCell>
                      <TableCell>
                        {tx.status === "Pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-green-600" onClick={()=>handleStatusUpdate(tx.id, "Completed")}><CheckCircle size={16}/></Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={()=>handleStatusUpdate(tx.id, "Failed")}><XCircle size={16}/></Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* BIỂU ĐỒ LINE VÀ PIE CỦA VÍ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader><CardTitle>Biến động số dư</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={balanceOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
                    <Line type="monotone" dataKey="Balance" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader><CardTitle>Tỷ lệ Nạp / Rút</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={transactionTypeData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                      {transactionTypeData.map((entry, i) => (<Cell key={i} fill={entry.name === 'Nạp tiền' ? COLORS[1] : COLORS[3]} />))}
                    </Pie>
                    <Tooltip formatter={(val:number)=>val.toLocaleString()+"₫"} /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* --- Function Usage Section --- */}
        <section ref={functionRef}>
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3"><Settings className="text-blue-600" /> Lượt sử dụng chức năng</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <Card className="lg:col-span-2 shadow-lg">
                <CardHeader><CardTitle>Danh sách</CardTitle></CardHeader>
                <CardContent>
                   <Table>
                      <TableHeader><TableRow><TableHead>Tên</TableHead><TableHead>Lượt dùng</TableHead><TableHead>User duy nhất</TableHead></TableRow></TableHeader>
                      <TableBody>{functionUsage.map(f => (<TableRow key={f.id}><TableCell>{f.name}</TableCell><TableCell>{f.usageCount}</TableCell><TableCell>{f.uniqueUsers}</TableCell></TableRow>))}</TableBody>
                   </Table>
                </CardContent>
             </Card>
             {/* BIỂU ĐỒ BAR CHART FUNCTION */}
             <Card className="lg:col-span-1 shadow-lg">
                <CardHeader><CardTitle>Top chức năng</CardTitle></CardHeader>
                <CardContent className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sortedFunctionUsage} layout="vertical">
                         <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" scale="band" width={100} />
                         <Tooltip /><Bar dataKey="usageCount" fill="#f59e0b" />
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

export default function AdminPageWrapper({ onLogout }: { onLogout: () => void }) {
  return <QueryClientProvider client={queryClient}><AdminPage onLogout={onLogout} /></QueryClientProvider>;
}