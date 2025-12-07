import React, { useState, useMemo } from "react";
import {
    useQuery,
    useMutation,
    useQueryClient,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Ban,
    Shield,
    Wallet,
    MessageSquare,
    Activity,
    Cpu,
    Save,
    Search,
    ChevronDown,
    History,
    Server,
    Zap,
    Lock,
    Unlock,
    Database,
    Trash2,
    Eye,
    EyeOff,
    ArrowUpDown // Icon mới cho Sort
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    CartesianGrid,
    AreaChart,
    Area,
    BarChart,
    Bar
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ✅ IMPORT API 
// [BACKEND NOTE]: Bạn cứ giữ import này, khi nào nối API thật thì bỏ comment ở dưới
import { adminApi, type AdminDashboard, type TransactionHistory, type FeedbackWithMessages, type UserDetailWithStats } from '@/lib/adminApi';

// =====================================================
// 🚨 KHU VỰC DỮ LIỆU GIẢ (MOCK DATA) 
// [BACKEND NOTE]: Xóa toàn bộ khu vực này khi nối API
// =====================================================

const MOCK_DASHBOARD_DATA = {
    totalUsers: 1250,
    totalRevenue: 250000000,
    activeFeedbacks: 12,
    totalFeedbacks: 45,
    totalMembers: 1100,
    totalStaff: 145,
    totalAdmins: 5,
    requestsUsedToday: 4521,
    tokensUsedToday: 1205000
};

const MOCK_USERS_DATA = [
    { userID: 1, fullName: "Nguyễn Văn A", email: "a@gmail.com", role: "Member", createdAt: "2023-01-15T00:00:00Z", isBanned: false, walletBalance: 500000 },
    { userID: 2, fullName: "Trần Thị B", email: "b@company.com", role: "Staff", createdAt: "2023-02-20T00:00:00Z", isBanned: false, walletBalance: 0 },
    { userID: 3, fullName: "Lê Văn C", email: "badguy@spam.com", role: "Member", createdAt: "2023-03-10T00:00:00Z", isBanned: true, walletBalance: 120000 },
    { userID: 4, fullName: "Phạm D", email: "pham.d@dev.io", role: "Admin", createdAt: "2022-12-01T00:00:00Z", isBanned: false, walletBalance: 99999999 },
    { userID: 5, fullName: "Hoàng E", email: "client_e@gmail.com", role: "Member", createdAt: "2023-11-05T00:00:00Z", isBanned: false, walletBalance: 25000 },
];

const MOCK_TRANSACTIONS_DATA = [
    { transactionID: 101, userName: "Nguyễn Văn A", type: "Deposit", money: 500000, status: "Completed", requestTime: "2023-10-25T10:30:00Z" },
    { transactionID: 102, userName: "Lê Văn C", type: "Withdraw", money: 200000, status: "Pending", requestTime: "2023-10-24T14:15:00Z" },
    { transactionID: 103, userName: "Hoàng E", type: "Deposit", money: 1000000, status: "Completed", requestTime: "2023-10-23T09:00:00Z" },
];

const MOCK_FEEDBACKS_DATA = [
    { feedbackID: 1, userID: 105, userEmail: "a@gmail.com", topic: "Lỗi đăng nhập", status: "Activity", description: "Hệ thống bị chậm lúc 9h sáng nay. Tôi đã thử reset lại mạng nhưng vẫn không vào được trang chủ. Mong admin kiểm tra gấp.", createdAt: "2023-10-26T08:30:00Z" },
    { feedbackID: 2, userID: 210, userEmail: "b@company.com", topic: "Góp ý giao diện", status: "Close", description: "Màu xanh của nút bấm hơi chói, nên đổi sang màu dịu hơn. Ngoài ra giao diện mobile bị vỡ nhẹ ở phần footer.", createdAt: "2023-10-25T14:20:00Z" },
    { feedbackID: 3, userID: 88, userEmail: "unknown@web.com", topic: "Nạp tiền lỗi", status: "Activity", description: "Tôi nạp 500k qua Momo nhưng tiền chưa vào ví. Mã giao dịch là MOMO12345678. Đã đợi 2 tiếng rồi.", createdAt: "2023-10-24T09:15:00Z" },
    { feedbackID: 4, userID: 99, userEmail: "test@web.com", topic: "Hỏi về API", status: "Activity", description: "Cho mình xin document tích hợp API với ạ. Mình tìm trên docs không thấy phần Authentication.", createdAt: "2023-10-23T11:00:00Z" },
];

// =====================================================
// 🎨 GEMINI STUDIO UI COMPONENTS
// =====================================================
const queryClient = new QueryClient();

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const Button = ({ variant, size, className, children, ...props }: any) => {
    const base = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
    const sz = size === "sm" ? "h-9 px-3 text-xs" : "h-11 px-5 py-2 text-sm";
    const variants: any = {
        default: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5",
        destructive: "bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 shadow-sm",
        outline: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
        ghost: "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        glass: "bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/10",
        success: "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 shadow-sm",
    };
    return <button className={cn(base, sz, variants[variant || "default"], className)} {...props}>{children}</button>;
};

const Card = ({ children, className }: any) => (
    <div className={cn("rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/40 overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/60", className)}>
        {children}
    </div>
);

const CardHeader = ({ children, className }: any) => <div className={cn("px-6 py-5 border-b border-slate-50", className)}>{children}</div>;
const CardTitle = ({ children, className }: any) => <h3 className={cn("text-lg font-bold text-slate-800 flex items-center gap-2", className)}>{children}</h3>;
const CardContent = ({ children, className }: any) => <div className={cn("p-6", className)}>{children}</div>;

const Input = ({ className, ...props }: any) => (
    <input className={cn("flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:bg-white transition-all", className)} {...props} />
);

const Select = ({ children, value, onChange, className }: any) => (
    <div className="relative">
        <select className={cn("h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:bg-white transition-all cursor-pointer", className)} value={value} onChange={onChange}>
            {children}
        </select>
        <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
    </div>
);

const Badge = ({ variant, className, children }: any) => {
    const variants: any = {
        default: "bg-slate-100 text-slate-700 border-slate-200",
        destructive: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20",
        warning: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20",
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20",
    };
    return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ring-1 ring-inset", variants[variant || "default"], className)}>{children}</span>;
};

const Dialog = ({ open, onClose, children }: any) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0" onClick={onClose}>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};
const DialogHeader = ({ children }: any) => <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">{children}</div>;
const DialogTitle = ({ children }: any) => <h2 className="text-lg font-bold text-slate-800">{children}</h2>;
const DialogContent = ({ children }: any) => <div className="p-6 space-y-4">{children}</div>;
const DialogFooter = ({ children }: any) => <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">{children}</div>;

const useToast = () => ({
    toast: (opts: any) => alert((opts.variant === 'destructive' ? '❌ ' : '✅ ') + opts.title + (opts.description ? '\n' + opts.description : ''))
});

// =====================================================
// 🧩 TYPES
// =====================================================
interface User extends UserDetailWithStats { }

interface ExtendedAdminDashboard extends AdminDashboard {
    requestsUsedToday?: number;
    tokensUsedToday?: number;
}

interface SystemConfigItem {
    settingKey: string;
    settingValue: string;
    description: string;
}

// =====================================================
// 🧩 ADMIN PAGE COMPONENT
// =====================================================
function AdminPage({ onLogout }: { onLogout: () => void }) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Navigation
    const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "transactions" | "config" | "feedback">("dashboard");

    // State Users
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // State Feedback Search & Sort
    const [feedbackStatus, setFeedbackStatus] = useState("Activity");
    const [feedbackSearch, setFeedbackSearch] = useState("");
    const [feedbackSort, setFeedbackSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });
    const [viewFeedback, setViewFeedback] = useState<any>(null); // State để hiển thị Dialog Feedback

    // Dialogs
    const [editDialog, setEditDialog] = useState<"role" | "wallet" | "ban" | null>(null);
    const [formData, setFormData] = useState<any>({});

    // State Config
    const [geminiConfig, setGeminiConfig] = useState({ rpmLimit: 60, tpmLimit: 100000, rpdLimit: 5000 });
    const [geminiKey, setGeminiKey] = useState("AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxx");
    const [showApiKey, setShowApiKey] = useState(false);
    const [systemConfig, setSystemConfig] = useState<SystemConfigItem[]>([
        { settingKey: "SITE_NAME", settingValue: "Gemini Studio", description: "Tên hiển thị của hệ thống" },
        { settingKey: "SUPPORT_EMAIL", settingValue: "admin@gemini.com", description: "Email hỗ trợ khách hàng" },
        { settingKey: "DEFAULT_QUOTA", settingValue: "100", description: "Quota mặc định cho user mới" }
    ]);

    // ==================== QUERIES (API & MOCK) ====================
    const { data: dashboardData } = useQuery<ExtendedAdminDashboard>({
        queryKey: ["adminDashboard"],
        queryFn: () => Promise.resolve(MOCK_DASHBOARD_DATA as unknown as ExtendedAdminDashboard),
    });
    const dashboard = dashboardData as ExtendedAdminDashboard | undefined;

    const { data: usersData } = useQuery({
        queryKey: ["adminUsers"],
        queryFn: () => Promise.resolve(MOCK_USERS_DATA),
    });

    const { data: recentTransactions = [], isLoading: loadingTransactions } = useQuery<TransactionHistory[]>({
        queryKey: ["recentTransactions"],
        queryFn: () => Promise.resolve(MOCK_TRANSACTIONS_DATA as unknown as TransactionHistory[]),
    });

    const { data: feedbacks = [] } = useQuery<FeedbackWithMessages[]>({
        queryKey: ["adminFeedbacks"], // Bỏ filter status ở key để client tự filter
        queryFn: () => Promise.resolve(MOCK_FEEDBACKS_DATA as unknown as FeedbackWithMessages[]),
    });

    const users: User[] = Array.isArray(usersData) ? (usersData as any[]) : [];

    // ==================== PROCESSED DATA (FILTER & SORT) ====================

    // Xử lý dữ liệu Feedback: Filter Search -> Filter Status -> Sort
    const processedFeedbacks = useMemo(() => {
        let data = [...feedbacks];

        // 1. Filter Search (Tìm theo Topic, Email, Content, ID)
        if (feedbackSearch) {
            const lowerSearch = feedbackSearch.toLowerCase();
            data = data.filter((fb: any) =>
                fb.topic?.toLowerCase().includes(lowerSearch) ||
                fb.userEmail?.toLowerCase().includes(lowerSearch) ||
                fb.description?.toLowerCase().includes(lowerSearch) ||
                fb.feedbackID.toString().includes(lowerSearch)
            );
        }

        // 2. Filter Status
        if (feedbackStatus !== 'All') {
            data = data.filter(fb => fb.status === feedbackStatus);
        }

        // 3. Sort
        data.sort((a: any, b: any) => {
            let valA = a[feedbackSort.key];
            let valB = b[feedbackSort.key];

            // Xử lý string để sort đúng
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return feedbackSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return feedbackSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return data;
    }, [feedbacks, feedbackStatus, feedbackSearch, feedbackSort]);

    // Xử lý Sort Click
    const handleFeedbackSort = (key: string) => {
        setFeedbackSort(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // ==================== CHART DATA ====================
    const cashFlowData = [
        { name: "T2", deposit: 1200000, spend: 800000 },
        { name: "T3", deposit: 1500000, spend: 1100000 },
        { name: "T4", deposit: 900000, spend: 1300000 },
        { name: "T5", deposit: 2000000, spend: 900000 },
        { name: "T6", deposit: 1800000, spend: 1500000 },
        { name: "T7", deposit: 2500000, spend: 2000000 },
        { name: "CN", deposit: 3100000, spend: 1800000 }
    ];
    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

    const userRoleData = dashboard ?
        [
            { name: "Members", value: dashboard.totalMembers },
            { name: "Staff", value: dashboard.totalStaff },
            { name: "Admins", value: dashboard.totalAdmins },
        ] : [];

    const feedbackStatsData = [
        { name: "Chờ xử lý", value: dashboard?.activeFeedbacks || 5, fill: "#f59e0b" },
        { name: "Đã xong", value: (dashboard?.totalFeedbacks || 20) - (dashboard?.activeFeedbacks || 5), fill: "#10b981" },
    ];

    // ==================== MUTATIONS (MOCKED SUCCESS) ====================
    const updateConfigMutation = useMutation({
        mutationFn: (data: any) => new Promise((resolve) => setTimeout(resolve, 500)),
        onSuccess: () => { toast({ title: "Cấu hình đã lưu", description: "Hệ thống đã cập nhật cài đặt mới." }); }
    });
    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: number; role: string }) => new Promise((resolve) => setTimeout(resolve, 500)),
        onSuccess: () => { toast({ title: "Thành công", description: "Đã cập nhật role (Giả lập)" }); queryClient.invalidateQueries({ queryKey: ["adminUsers"] }); setEditDialog(null); },
    });
    const banMutation = useMutation({
        mutationFn: ({ userId, isBanned }: { userId: number; isBanned: boolean }) => new Promise((resolve) => setTimeout(resolve, 500)),
        onSuccess: () => { toast({ title: "Thành công", description: "Đã cập nhật trạng thái User (Giả lập)" }); queryClient.invalidateQueries({ queryKey: ["adminUsers"] }); setEditDialog(null); },
    });
    const updateWalletMutation = useMutation({
        mutationFn: ({ userId, amount, description }: { userId: number; amount: number; description: string }) => new Promise((resolve) => setTimeout(resolve, 500)),
        onSuccess: () => { toast({ title: "Thành công", description: "Đã cập nhật số dư (Giả lập)" }); queryClient.invalidateQueries({ queryKey: ["adminUsers"] }); queryClient.invalidateQueries({ queryKey: ["recentTransactions"] }); setEditDialog(null); },
    });
    // Mutation này vẫn giữ để dùng trong Dialog View nếu cần (ví dụ Staff trả lời)
    const statusFeedbackMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => new Promise((resolve) => setTimeout(resolve, 500)),
        onSuccess: () => { toast({ title: "Updated", description: "Trạng thái feedback đã thay đổi (Giả lập)" }); queryClient.invalidateQueries({ queryKey: ["adminFeedbacks"] }); },
    });

    // ==================== HANDLERS ====================
    const handleEditRole = (user: User) => { setSelectedUser(user); setFormData({ role: user.role }); setEditDialog("role"); };
    const handleEditWallet = (user: User) => { setSelectedUser(user); setFormData({ amount: 0 }); setEditDialog("wallet"); };
    const handleBan = (user: User) => { setSelectedUser(user); setEditDialog("ban"); };

    const handleSubmit = () => {
        if (!selectedUser) return;
        switch (editDialog) {
            case "role": updateRoleMutation.mutate({ userId: selectedUser.userID, role: formData.role }); break;
            case "wallet": updateWalletMutation.mutate({ userId: selectedUser.userID, amount: parseFloat(formData.amount), description: "Admin changed balance (Quick Edit)" }); break;
            case "ban": banMutation.mutate({ userId: selectedUser.userID, isBanned: !selectedUser.isBanned }); break;
        }
    };
    const handleSystemConfigChange = (index: number, field: string, value: string) => {
        const newConfig = [...systemConfig]; (newConfig[index] as any)[field] = value; setSystemConfig(newConfig);
    };
    const handleDeleteSystemConfig = (index: number) => {
        const newConfig = [...systemConfig]; newConfig.splice(index, 1); setSystemConfig(newConfig);
    };
    const filteredUsers = users.filter((u) => {
        if (u.role === "Admin") return false;
        if (roleFilter !== "all" && u.role !== roleFilter) return false;
        if (searchQuery && !u.email.toLowerCase().includes(searchQuery.toLowerCase()) && !u.fullName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // ==================== DASHBOARD VIEW ====================
    const renderDashboard = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-indigo-500"><CardContent className="pt-6"><div className="flex justify-between"><div><p className="text-sm font-medium text-slate-500">Tổng Users</p><h3 className="text-3xl font-bold text-slate-900 mt-2">{dashboard?.totalUsers || 0}</h3></div><div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><Users size={24} /></div></div></CardContent></Card>
                <Card className="border-l-4 border-l-emerald-500"><CardContent className="pt-6"><div className="flex justify-between"><div><p className="text-sm font-medium text-slate-500">Doanh thu</p><h3 className="text-3xl font-bold text-emerald-600 mt-2">{(dashboard?.totalRevenue || 0).toLocaleString("vi-VN")}₫</h3></div><div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Wallet size={24} /></div></div></CardContent></Card>
                <Card className="border-l-4 border-l-amber-500"><CardContent className="pt-6"><div className="flex justify-between"><div><p className="text-sm font-medium text-slate-500">Feedback Mới</p><h3 className="text-3xl font-bold text-amber-600 mt-2">{dashboard?.activeFeedbacks || 0}</h3></div><div className="p-3 bg-amber-50 rounded-xl text-amber-600"><MessageSquare size={24} /></div></div></CardContent></Card>
                <Card className="border-l-4 border-l-violet-500"><CardContent className="pt-6"><div className="flex justify-between"><div><p className="text-sm font-medium text-slate-500">Hệ thống</p><h3 className="text-3xl font-bold text-violet-600 mt-2">Ổn định</h3></div><div className="p-3 bg-violet-50 rounded-xl text-violet-600"><Zap size={24} /></div></div></CardContent></Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle><Activity size={18} className="text-indigo-500" /> Biến động dòng tiền</CardTitle></CardHeader>
                    <CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={cashFlowData}><defs><linearGradient id="colorDeposit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient><linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} /><Legend /><Area type="monotone" name="Nạp" dataKey="deposit" stroke="#10b981" fill="url(#colorDeposit)" /><Area type="monotone" name="Chi" dataKey="spend" stroke="#ef4444" fill="url(#colorSpend)" /></AreaChart></ResponsiveContainer></CardContent>
                </Card>
                <Card><CardHeader><CardTitle>User Roles</CardTitle></CardHeader><CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={userRoleData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>{userRoleData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" /></PieChart></ResponsiveContainer></CardContent></Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle><Cpu size={18} className="text-rose-500" /> Mức độ sử dụng hôm nay</CardTitle></CardHeader><CardContent className="h-[300px] flex flex-col justify-center gap-6"><div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100"><div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600"><Server size={28} /></div><div><p className="text-sm font-medium text-slate-500">Requests Used Today</p><h3 className="text-3xl font-bold text-slate-800">{dashboard?.requestsUsedToday?.toLocaleString() || "1,245"}</h3><p className="text-xs text-indigo-500 font-medium">Requests</p></div></div><div className="flex items-center gap-4 p-4 bg-purple-50/50 rounded-2xl border border-purple-100"><div className="p-3 bg-white rounded-xl shadow-sm text-purple-600"><Database size={28} /></div><div><p className="text-sm font-medium text-slate-500">Tokens Used Today</p><h3 className="text-3xl font-bold text-slate-800">{dashboard?.tokensUsedToday?.toLocaleString() || "850,000"}</h3><p className="text-xs text-purple-500 font-medium">Tokens</p></div></div></CardContent></Card>
                <Card><CardHeader><CardTitle><MessageSquare size={18} className="text-amber-500" /> Trạng thái Feedback</CardTitle></CardHeader><CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={feedbackStatsData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} /><Bar dataKey="value" radius={[6, 6, 0, 0]}>{feedbackStatsData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}</Bar></BarChart></ResponsiveContainer></CardContent></Card>
            </div>
        </div>
    );

    // ==================== TRANSACTIONS VIEW ====================
    const renderTransactions = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><History className="text-slate-400" /> Lịch sử giao dịch</h1>
            <Card><CardContent>{loadingTransactions ? <div className="text-center py-8">Loading...</div> : (<div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50 text-slate-500 uppercase text-xs"><tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Type</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-right">Date</th></tr></thead><tbody className="divide-y divide-slate-50">{recentTransactions.map((tx) => (<tr key={tx.transactionID} className="hover:bg-slate-50/50"><td className="px-4 py-3">#{tx.transactionID}</td><td className="px-4 py-3">{tx.userName}</td><td className="px-4 py-3"><Badge variant={tx.type === "Deposit" ? "success" : "warning"}>{tx.type}</Badge></td><td className={cn("px-4 py-3 text-right font-bold", tx.type === "Deposit" ? "text-emerald-600" : "text-slate-700")}>{tx.type === "Deposit" ? "+" : "-"}{tx.money.toLocaleString()}đ</td><td className="px-4 py-3 text-center"><Badge variant={tx.status === "Completed" ? "success" : "warning"}>{tx.status}</Badge></td><td className="px-4 py-3 text-right text-xs">{new Date(tx.requestTime).toLocaleString()}</td></tr>))}</tbody></table></div>)}</CardContent></Card>
        </div>
    );

    // ==================== CONFIG VIEW ====================
    const renderConfig = () => (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Settings className="text-slate-400" /> System Configuration</h1>
            <Card>
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <CardHeader><CardTitle><Cpu size={20} className="text-indigo-500" /> Gemini Configuration</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div><label className="block text-sm font-medium text-slate-700 mb-2">Google Gemini API Key</label><div className="flex gap-4 relative"><Input type={showApiKey ? "text" : "password"} value={geminiKey} onChange={(e: any) => setGeminiKey(e.target.value)} className="font-mono text-slate-600 flex-1 pr-12" /><button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-[130px] top-3 text-slate-400 hover:text-indigo-600 transition-colors">{showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}</button><Button variant="outline" onClick={() => updateConfigMutation.mutate({ geminiKey })}><Save size={16} className="mr-2" /> Lưu Key</Button></div></div>
                    <div className="h-px bg-slate-100 my-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div><label className="block text-sm font-medium text-slate-700 mb-2">RPM Limit</label><Input type="number" value={geminiConfig.rpmLimit} onChange={(e: any) => setGeminiConfig({ ...geminiConfig, rpmLimit: e.target.value })} /></div><div><label className="block text-sm font-medium text-slate-700 mb-2">TPM Limit</label><Input type="number" value={geminiConfig.tpmLimit} onChange={(e: any) => setGeminiConfig({ ...geminiConfig, tpmLimit: e.target.value })} /></div><div><label className="block text-sm font-medium text-slate-700 mb-2">RPD Limit</label><Input type="number" value={geminiConfig.rpdLimit} onChange={(e: any) => setGeminiConfig({ ...geminiConfig, rpdLimit: e.target.value })} /></div></div>
                    <div className="flex justify-end"><Button onClick={() => updateConfigMutation.mutate(geminiConfig)}><Save size={16} className="mr-2" /> Cập nhật Limits</Button></div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle><Database size={20} className="text-emerald-500" /> General System Configuration</CardTitle></CardHeader>
                <CardContent><div className="overflow-x-auto border rounded-xl border-slate-200"><table className="w-full text-sm text-left"><thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs"><tr><th className="px-4 py-3 w-1/4">Setting Key</th><th className="px-4 py-3 w-1/3">Setting Value</th><th className="px-4 py-3">Description</th><th className="px-4 py-3 w-10 text-center">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{systemConfig.map((item, index) => (<tr key={index} className="hover:bg-slate-50/50 group"><td className="px-4 py-3 font-mono font-medium text-indigo-600"><Input value={item.settingKey} onChange={(e: any) => handleSystemConfigChange(index, 'settingKey', e.target.value)} className="h-8 text-xs font-mono bg-indigo-50/50 border-indigo-100 focus:bg-white" placeholder="KEY_NAME" /></td><td className="px-4 py-3"><Input value={item.settingValue} onChange={(e: any) => handleSystemConfigChange(index, 'settingValue', e.target.value)} className="h-8 text-sm" placeholder="Value" /></td><td className="px-4 py-3"><Input value={item.description} onChange={(e: any) => handleSystemConfigChange(index, 'description', e.target.value)} className="h-8 text-xs text-slate-500 border-dashed" placeholder="Mô tả..." /></td><td className="px-4 py-3 text-center"><Button variant="ghost" size="sm" className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 h-8 w-8 p-0" onClick={() => handleDeleteSystemConfig(index)}><Trash2 size={16} /></Button></td></tr>))}</tbody></table></div><div className="mt-4 flex justify-between items-center"><Button variant="outline" size="sm" onClick={() => setSystemConfig([...systemConfig, { settingKey: "", settingValue: "", description: "" }])}>+ Thêm Setting</Button><Button onClick={() => updateConfigMutation.mutate({ systemConfig })}><Save size={16} className="mr-2" /> Lưu Cấu Hình Hệ Thống</Button></div></CardContent>
            </Card>
        </div>
    );

    // ==================== FEEDBACK VIEW (UPDATED) ====================
    const renderFeedback = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><MessageSquare className="text-slate-400" /> Feedback Center</h1>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <CardTitle>Danh sách Feedback</CardTitle>
                        <div className="flex gap-3 w-full md:w-auto">
                            {/* SEARCH INPUT */}
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                                <Input
                                    placeholder="Search topic, email, id..."
                                    className="pl-9 h-9"
                                    value={feedbackSearch}
                                    onChange={(e: any) => setFeedbackSearch(e.target.value)}
                                />
                            </div>
                            {/* STATUS SELECT */}
                            <Select value={feedbackStatus} onChange={(e: any) => setFeedbackStatus(e.target.value)} className="w-32 h-9">
                                <option value="Activity">Mới</option>
                                <option value="Close">Đã đóng</option>
                                <option value="All">Tất cả</option>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {processedFeedbacks.length === 0 ? <div className="text-center py-10 text-slate-400">Không tìm thấy dữ liệu feedback phù hợp</div> : (
                        <div className="overflow-x-auto border rounded-xl border-slate-200">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                    <tr>
                                        {/* SORTABLE HEADERS */}
                                        <th className="px-4 py-3 w-20 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleFeedbackSort('feedbackID')}>
                                            <div className="flex items-center gap-1">ID <ArrowUpDown size={12} /></div>
                                        </th>
                                        <th className="px-4 py-3 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleFeedbackSort('topic')}>
                                            <div className="flex items-center gap-1">Topic <ArrowUpDown size={12} /></div>
                                        </th>
                                        <th className="px-4 py-3">Người gửi (UserID)</th>
                                        <th className="px-4 py-3 text-center cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleFeedbackSort('status')}>
                                            <div className="flex items-center justify-center gap-1">Trạng thái <ArrowUpDown size={12} /></div>
                                        </th>
                                        <th className="px-4 py-3 text-right cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleFeedbackSort('createdAt')}>
                                            <div className="flex items-center justify-end gap-1">Ngày tạo <ArrowUpDown size={12} /></div>
                                        </th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {processedFeedbacks.map((fb: any) => (
                                        <tr key={fb.feedbackID} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-slate-500">#{fb.feedbackID}</td>
                                            <td className="px-4 py-3 font-medium text-slate-800">{fb.topic || "No Topic"}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">ID: {fb.userID || "N/A"}</span>
                                                    <span className="text-xs text-slate-400 truncate max-w-[120px]">{fb.userEmail}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant={fb.status === 'Activity' ? 'warning' : 'success'}>{fb.status}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right text-xs text-slate-500">
                                                {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {/* ACTIONS: CHỈ CÒN XEM */}
                                                <Button size="sm" variant="ghost" className="h-7 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" onClick={() => setViewFeedback(fb)}>
                                                    Xem chi tiết
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    // ==================== USERS VIEW ====================
    const renderUsers = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between gap-4">
                <div className="relative w-96"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><Input placeholder="Tìm kiếm user..." className="pl-10" value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} /></div>
                <Select value={roleFilter} onChange={(e: any) => setRoleFilter(e.target.value)} className="w-60"><option value="all">Tất cả (Member & Staff)</option><option value="Member">Member</option><option value="Staff">Staff</option></Select>
            </div>
            <Card>
                <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50 text-slate-500 uppercase text-xs"><tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Ngày tạo</th><th className="p-4">Status</th><th className="p-4">Wallet</th><th className="p-4 text-center">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredUsers.map((user) => (<tr key={user.userID} className="hover:bg-slate-50/50"><td className="p-4"><div className="font-medium">{user.fullName}</div><div className="text-xs text-slate-500">{user.email}</div></td><td className="p-4"><Badge variant={user.role === "Admin" ? "destructive" : user.role === "Staff" ? "indigo" : "default"}>{user.role}</Badge></td><td className="p-4 text-slate-500 text-sm">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}</td><td className="p-4"><Badge variant={user.isBanned ? "destructive" : "success"}>{user.isBanned ? "Banned" : "Active"}</Badge></td><td className="p-4 font-mono">{user.walletBalance?.toLocaleString()}đ</td><td className="p-4 text-center flex justify-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEditRole(user)}><Shield size={16} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEditWallet(user)}><Wallet size={16} /></Button>
                    <Button size="sm" variant={user.isBanned ? "success" : "destructive"} onClick={() => handleBan(user)}>{user.isBanned ? <Unlock size={16} /> : <Ban size={16} />}</Button></td></tr>))}</tbody></table></div>
            </Card>
        </div>
    );

    return (
        <div className="flex bg-[#F8FAFC] min-h-screen font-sans">
            <aside className="fixed left-0 top-0 h-full w-72 bg-[#0F172A] text-slate-300 p-6 flex flex-col shadow-2xl z-20">
                <div className="flex items-center gap-3 mb-10 px-2"><div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg text-white"><Shield size={20} /></div><div><h2 className="text-lg font-bold text-white">Admin Portal</h2><p className="text-[10px] text-slate-500 font-medium uppercase">Manager</p></div></div>
                <nav className="flex flex-col space-y-2 flex-grow">
                    {[{ id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' }, { id: 'users', icon: Users, label: 'Quản lý Users' }, { id: 'transactions', icon: History, label: 'Giao dịch' }, { id: 'config', icon: Settings, label: 'Cấu hình System' }, { id: 'feedback', icon: MessageSquare, label: 'Feedback' }].map((item) => (
                        <Button key={item.id} variant={activeTab === item.id ? "glass" : "ghost"} onClick={() => setActiveTab(item.id as any)} className={cn("justify-start gap-3 px-4 py-3 rounded-xl text-sm font-medium", activeTab === item.id ? "bg-indigo-600/20 text-white shadow-lg" : "hover:text-white")}><item.icon size={18} /> {item.label}</Button>
                    ))}
                </nav>
                <div className="mt-auto pt-6 border-t border-slate-800/50">
                    <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold text-xs shadow-md">AD</div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">Admin Account</p>
                            <p className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online</p>
                        </div>
                    </div>
                    <Button variant="destructive" className="w-full justify-start gap-3 pl-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40" onClick={onLogout}><LogOut size={18} /> Sign Out</Button>
                </div>
            </aside>
            <main className="ml-72 w-full min-h-screen p-8 lg:p-10">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'transactions' && renderTransactions()}
                {activeTab === 'config' && renderConfig()}
                {activeTab === 'feedback' && renderFeedback()}
            </main>

            {/* Other Dialogs */}
            <Dialog open={editDialog === "role"} onClose={() => setEditDialog(null)}>
                <DialogHeader><DialogTitle>Thay đổi quyền hạn</DialogTitle></DialogHeader>
                <DialogContent>
                    <div className="mb-4 text-center">User: <b className="text-indigo-600">{selectedUser?.fullName}</b></div>
                    <Select value={formData.role || ""} onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}><option value="Member">Member</option><option value="Staff">Staff</option><option value="Admin">Admin</option></Select>
                    <p className="text-xs text-slate-500 text-center mt-2">Bấm Lưu để xác nhận thay đổi.</p>
                </DialogContent>
                <DialogFooter><Button variant="outline" onClick={() => setEditDialog(null)}>Hủy</Button><Button onClick={handleSubmit}>Lưu</Button></DialogFooter>
            </Dialog>

            <Dialog open={editDialog === "wallet"} onClose={() => setEditDialog(null)}>
                <DialogHeader><DialogTitle>Điều chỉnh số dư ví</DialogTitle></DialogHeader>
                <DialogContent>
                    <div className="text-center mb-2">User: <b>{selectedUser?.fullName}</b></div>
                    <Input type="number" placeholder="Nhập số tiền" value={formData.amount || ""} onChange={(e: any) => setFormData({ ...formData, amount: e.target.value })} />
                    <p className="text-sm text-slate-500 text-center">Bạn có chắc chắn muốn thay đổi số dư này không?</p>
                </DialogContent>
                <DialogFooter><Button variant="outline" onClick={() => setEditDialog(null)}>Không (Hủy)</Button><Button onClick={handleSubmit}>Có (Lưu)</Button></DialogFooter>
            </Dialog>

            <Dialog open={editDialog === "ban"} onClose={() => setEditDialog(null)}>
                <DialogHeader><DialogTitle>{selectedUser?.isBanned ? "Mở khóa tài khoản" : "Khóa tài khoản"}</DialogTitle></DialogHeader>
                <DialogContent>
                    <div className="flex flex-col items-center justify-center p-4">
                        {selectedUser?.isBanned ? (<div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600"><Unlock size={32} /></div>) : (<div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600"><Ban size={32} /></div>)}
                        <p className="text-center text-slate-600">Bạn có chắc chắn muốn <strong>{selectedUser?.isBanned ? "MỞ KHÓA" : "KHÓA"}</strong> user <br /><span className="font-bold text-slate-900">{selectedUser?.fullName}</span>?</p>
                    </div>
                </DialogContent>
                <DialogFooter><Button variant="outline" onClick={() => setEditDialog(null)}>Hủy bỏ</Button><Button variant={selectedUser?.isBanned ? "success" : "destructive"} onClick={handleSubmit}>{selectedUser?.isBanned ? "Xác nhận Mở khóa" : "Xác nhận Khóa"}</Button></DialogFooter>
            </Dialog>

            {/* ✅ VIEW FEEDBACK DIALOG (MỚI) */}
            <Dialog open={!!viewFeedback} onClose={() => setViewFeedback(null)}>
                <DialogHeader>
                    <DialogTitle>Chi tiết Feedback #{viewFeedback?.feedbackID}</DialogTitle>
                </DialogHeader>
                <DialogContent>
                    <div className="space-y-4">
                        {/* Info Block */}
                        <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex justify-between">
                                <span className="text-xs text-slate-500 uppercase font-bold">Người gửi</span>
                                <span className="text-xs font-mono text-slate-700">{viewFeedback?.userEmail}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-slate-500 uppercase font-bold">Chủ đề</span>
                                <span className="text-sm font-medium text-slate-900">{viewFeedback?.topic}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-slate-500 uppercase font-bold">Ngày tạo</span>
                                <span className="text-xs text-slate-700">{viewFeedback?.createdAt ? new Date(viewFeedback.createdAt).toLocaleString("vi-VN") : "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 uppercase font-bold">Trạng thái</span>
                                <Badge variant={viewFeedback?.status === 'Activity' ? 'warning' : 'success'}>{viewFeedback?.status}</Badge>
                            </div>
                        </div>

                        {/* User Description (Full) */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Users size={14} className="text-indigo-500" /> Nội dung User phản ánh:</h4>
                            <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 leading-relaxed shadow-sm max-h-40 overflow-y-auto">
                                {viewFeedback?.description}
                            </div>
                        </div>

                        {/* Staff Reply (Mock UI) */}
                        <div className="space-y-2 pt-2 border-t border-dashed border-slate-200">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Shield size={14} className="text-emerald-500" /> Staff Support:</h4>
                            {viewFeedback?.status === 'Close' ? (
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800 leading-relaxed">
                                    Chào bạn, vấn đề của bạn đã được đội ngũ kỹ thuật ghi nhận và xử lý. Cảm ơn bạn đã phản hồi.
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-400 italic text-center">
                                    Chưa có phản hồi từ Staff.
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setViewFeedback(null)}>Đóng cửa sổ</Button>
                    {viewFeedback?.status === 'Activity' && (
                        <Button onClick={() => {
                            // Mock Action Close
                            statusFeedbackMutation.mutate({ id: viewFeedback.feedbackID, status: 'Close' });
                            setViewFeedback(null);
                        }}>
                            Đánh dấu đã xử lý
                        </Button>
                    )}
                </DialogFooter>
            </Dialog>

        </div>
    );
}

export default function AdminPageWrapper({ onLogout }: { onLogout: () => void }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AdminPage onLogout={onLogout} />
        </QueryClientProvider>
    );
}