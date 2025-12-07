import React, { useState, useMemo } from "react";
import {
    useQuery,
    useMutation,
    useQueryClient,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import {
    Users,
    UserX,
    MessageSquare,
    LogOut,
    Ban,
    Send,
    ChevronDown,
    ChevronUp,
    Search,
    LayoutDashboard,
    PieChart as PieChartIcon,
    Wallet,
    UserPlus,
    RefreshCcw,
    Filter,
    CheckCircle2,
    AlertTriangle,
    User,
    MessageCircle,
    DollarSign,
    BellRing,
    BarChart3,
    Activity,
    ShoppingCart
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

// ✅ 1. IMPORT API THẬT
import { staffApi } from '@/lib/adminApi';

// --- KHỞI TẠO QUERY CLIENT ---
const queryClient = new QueryClient();

// =================================================================================
// ⚠️ VÙNG DỮ LIỆU GIẢ CHO CHI TIẾT USER (Do Backend có thể chưa có các field mới này)
// =================================================================================

const MOCK_USER_DETAILS: any = {
    deposits: [
        { id: 1, amount: 500000, method: "Momo", status: "Success", time: "2024-05-20T10:30:00Z" },
        { id: 2, amount: 200000, method: "Banking", status: "Success", time: "2024-05-15T08:00:00Z" },
        { id: 3, amount: 100000, method: "Card", status: "Failed", time: "2024-05-01T14:20:00Z" },
    ],
    purchases: [
        { id: 1, itemName: "Gói Premium 1 Tháng", quantity: 1, total: 50000, time: "2024-05-21T09:00:00Z" },
        { id: 2, itemName: "Credit AI (100 lượt)", quantity: 2, total: 200000, time: "2024-05-18T15:30:00Z" },
        { id: 3, itemName: "Xóa phông nền", quantity: 50, total: 25000, time: "2024-05-10T11:15:00Z" },
    ],
    // ✅ CẬP NHẬT TÊN CHỨC NĂNG THEO YÊU CẦU
    featureUsage: [
        { name: "AI Content Optimization", count: 125, lastUsed: "2024-05-22" },
        { name: "AI-Powered Trend Analysis & Strategy Module", count: 42, lastUsed: "2024-05-20" },
        { name: "SEO Performance Analysis", count: 89, lastUsed: "2024-05-21" },
    ]
};

// Hàm giả lập delay cho phần chi tiết User
const fakeApiCall = (data: any): Promise<any> => new Promise((resolve) => setTimeout(() => resolve(data), 600));

// =================================================================================
// UI COMPONENTS HELPERS
// =================================================================================
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(" ");
const Button = ({ variant, size, className, children, ...props }: any) => {
    const base = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
    const sz = size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 py-2 text-sm";
    const variants: any = {
        default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
        destructive: "bg-rose-500 text-white hover:bg-rose-600 shadow-sm",
        outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
        ghost: "hover:bg-slate-800/50 text-slate-300 hover:text-white",
        ghostLight: "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
        warning: "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    };
    return <button className={cn(base, sz, variants[variant || "default"], className)} {...props}>{children}</button>;
};
const Card = ({ children, className }: any) => <div className={cn("rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm", className)}>{children}</div>;
const CardHeader = ({ children, className }: any) => <div className={cn("flex flex-col space-y-1.5 p-6 border-b border-slate-100/50", className)}>{children}</div>;
const CardContent = ({ children, className }: any) => <div className={cn("p-6", className)}>{children}</div>;
const Input = ({ className, ...props }: any) => <input className={cn("flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none", className)} {...props} />;
const Badge = ({ variant, className, children }: any) => {
    const variants: any = {
        default: "bg-slate-100 text-slate-800",
        destructive: "bg-rose-100 text-rose-700 border border-rose-200",
        success: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        warning: "bg-amber-100 text-amber-700 border border-amber-200",
        info: "bg-blue-100 text-blue-700 border border-blue-200",
    };
    return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", variants[variant || "default"], className)}>{children}</span>;
};
const Textarea = ({ className, ...props }: any) => <textarea className={cn("flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 resize-none", className)} {...props} />;
const Dialog = ({ open, onClose, children }: any) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>{children}</div>
        </div>
    );
};
const DialogHeader = ({ children }: any) => <div className="p-6 pb-4 border-b border-slate-100">{children}</div>;
const DialogTitle = ({ children }: any) => <h2 className="text-xl font-bold text-slate-800">{children}</h2>;
const DialogContent = ({ children }: any) => <div className="p-6 space-y-4">{children}</div>;
const useToast = () => ({ toast: (opts: any) => alert(`${opts.title} \n${opts.description || ''}`) });

// =================================================================================
// 1. DASHBOARD VIEW
// =================================================================================
const DashboardView = ({ stats, feedbacks }: any) => {
    return (
        <section className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <LayoutDashboard className="text-indigo-600" /> Dashboard Tổng quan
            </h1>

            {/* ROW 1: 4 STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-none text-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div><p className="text-indigo-100 text-xs font-medium uppercase">Tổng User</p><h3 className="text-2xl font-bold mt-1">{stats.total}</h3></div>
                        <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center"><Users size={20} /></div>
                    </CardContent>
                </Card>
                <Card className="bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div><p className="text-slate-500 text-xs font-medium uppercase">Tiền hệ thống</p><h3 className="text-2xl font-bold mt-1 text-slate-800">{stats.topWallets.reduce((a: any, b: any) => a + b.balance, 0).toLocaleString()}</h3></div>
                        <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center"><DollarSign size={20} /></div>
                    </CardContent>
                </Card>
                <Card className="bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div><p className="text-slate-500 text-xs font-medium uppercase">Feedback chờ</p><h3 className="text-2xl font-bold mt-1 text-amber-600">{feedbacks?.length || 0}</h3></div>
                        <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center"><BellRing size={20} /></div>
                    </CardContent>
                </Card>
                <Card className="bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div><p className="text-slate-500 text-xs font-medium uppercase">Tài khoản bị cấm</p><h3 className="text-2xl font-bold mt-1 text-rose-600">{stats.banned}</h3></div>
                        <div className="h-10 w-10 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center"><Ban size={20} /></div>
                    </CardContent>
                </Card>
            </div>

            {/* ROW 2: MAIN CHARTS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CHART 1: TÌNH TRẠNG USER */}
                <Card className="flex flex-col h-[340px] shadow-md">
                    <CardHeader className="pb-2"><h3 className="text-sm font-bold uppercase text-slate-700 flex items-center gap-2"><PieChartIcon size={16} className="text-indigo-500" /> Tình trạng User</h3></CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats.userStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {stats.userStatusData.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="bottom" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* CHART 2: NEW MEMBERS LIST */}
                <Card className="flex flex-col h-[340px] shadow-md">
                    <CardHeader className="pb-2">
                        <h3 className="text-sm font-bold uppercase text-slate-700 flex items-center gap-2">
                            <UserPlus size={16} className="text-blue-500" /> Khách hàng mới
                        </h3>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto custom-scrollbar p-0">
                        <div className="divide-y divide-slate-100">
                            {stats.newMembers.map((u: any) => (
                                <div key={u.userID} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                            {u.fullName ? u.fullName.charAt(0) : "U"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{u.fullName || "No Name"}</p>
                                            <p className="text-xs text-slate-500">{u.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono text-slate-400">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* CHART 3: TOP WALLETS */}
                <Card className="flex flex-col h-[340px] shadow-md">
                    <CardHeader className="pb-2"><h3 className="text-sm font-bold uppercase text-slate-700 flex items-center gap-2"><Wallet size={16} className="text-emerald-500" /> Top Tài Sản</h3></CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={stats.topWallets} margin={{ left: 10, right: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '11px', fill: '#475569' }} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value: number) => [value.toLocaleString(), 'VND']} />
                                <Bar dataKey="balance" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
};

// =================================================================================
// 2. FEEDBACK VIEW
// =================================================================================
const FeedbackView = () => {
    const { toast } = useToast();
    const [statusFilter, setStatusFilter] = useState("Activity");
    const [expandedFeedbackId, setExpandedFeedbackId] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState("");

    // ✅ DÙNG API THẬT
    const { data: feedbacksData, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ["staffFeedbacks", statusFilter],
        queryFn: () => staffApi.getFeedbacksWithFilters({
            status: statusFilter === "Both" ? undefined : statusFilter
        }),
    });

    const feedbacks = useMemo(() => {
        if (!feedbacksData || !Array.isArray(feedbacksData)) return [];
        return feedbacksData;
    }, [feedbacksData]);

    // ✅ DÙNG API THẬT
    const replyMutation = useMutation({
        mutationFn: ({ feedbackId, content }: any) => staffApi.addFeedbackReply(feedbackId, { content }),
        onSuccess: () => {
            toast({ title: "Đã gửi", description: "Phản hồi đã được gửi thành công!" });
            setReplyContent("");
            refetch(); // Reload data
        }
    });

    // ✅ DÙNG API THẬT
    const updateStatusMutation = useMutation({
        mutationFn: ({ feedbackId, status }: any) => staffApi.updateFeedbackStatus(feedbackId, status),
        onSuccess: () => {
            toast({ title: "Thành công", description: "Đã cập nhật trạng thái." });
            refetch();
        }
    });

    return (
        <section className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-end mb-6">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <MessageSquare className="text-emerald-600" /> Trung tâm Phản hồi
                </h1>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => refetch()} className="h-9 bg-white border-slate-200 hover:border-indigo-300 text-indigo-600 shadow-sm">
                        <RefreshCcw size={14} className={cn("mr-2", isRefetching && "animate-spin")} /> {isRefetching ? "Đang tải..." : "Cập nhật"}
                    </Button>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm h-9">
                        <Filter size={14} className="text-slate-400" />
                        <select className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer border-none p-0 focus:ring-0" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="Activity">Đang mở (Activity)</option>
                            <option value="Close">Đã đóng (Closed)</option>
                            <option value="Both">Tất cả</option>
                        </select>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden shadow-lg border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold w-[20%]">User / Email</th>
                                <th className="p-4 font-semibold w-[15%]">Topic</th>
                                <th className="p-4 font-semibold w-[35%]">Description</th>
                                <th className="p-4 font-semibold w-[10%]">Status</th>
                                <th className="p-4 font-semibold w-[10%] text-center">Chat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? <tr><td colSpan={5} className="p-8 text-center text-slate-500">Đang tải feedback...</td></tr> : feedbacks.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-500">Không tìm thấy feedback nào.</td></tr> : feedbacks.map((fb: any) => (
                                <React.Fragment key={fb.feedbackID}>
                                    <tr className={cn("transition-colors cursor-default border-l-4", expandedFeedbackId === fb.feedbackID ? "bg-indigo-50/30 border-l-indigo-500" : "hover:bg-slate-50 border-l-transparent")} onClick={() => setExpandedFeedbackId(expandedFeedbackId === fb.feedbackID ? null : fb.feedbackID)}>
                                        <td className="p-4 font-medium text-slate-700">{fb.userEmail}<div className="text-[10px] text-slate-400">{new Date(fb.createdAt).toLocaleDateString("vi-VN")}</div></td>
                                        <td className="p-4"><Badge variant="info" className="bg-indigo-50 text-indigo-700 border-indigo-100">{fb.topic || "Chung"}</Badge></td>
                                        <td className="p-4"><p className="line-clamp-1 text-slate-600 max-w-[300px]">{fb.description}</p></td>
                                        <td className="p-4"><Badge variant={fb.status === 'Activity' ? "warning" : "success"}>{fb.status === 'Activity' ? "Chờ xử lý" : "Đã xong"}</Badge></td>
                                        <td className="p-4 text-center">
                                            {expandedFeedbackId === fb.feedbackID ? <ChevronUp size={18} className="text-indigo-600 mx-auto" /> : <ChevronDown size={18} className="text-slate-400 mx-auto" />}
                                        </td>
                                    </tr>

                                    {/* MESSENGER STYLE ROW */}
                                    {expandedFeedbackId === fb.feedbackID && (
                                        <tr className="bg-slate-50/50">
                                            <td colSpan={5} className="p-0 border-b border-indigo-100">
                                                <div className="p-4 bg-slate-100/50">
                                                    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                                                        <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hội thoại với {fb.userEmail}</span>
                                                            {fb.status === 'Activity' && <Button size="sm" variant="ghost" className="text-emerald-600 h-7" onClick={(e: any) => { e.stopPropagation(); updateStatusMutation.mutate({ feedbackId: fb.feedbackID, status: 'Close' }) }}><CheckCircle2 size={14} className="mr-1" /> Mark as Resolved</Button>}
                                                        </div>
                                                        <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto bg-slate-50/30">
                                                            <div className="flex gap-3 justify-start">
                                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500"><User size={14} /></div>
                                                                <div className="flex flex-col items-start max-w-[80%]">
                                                                    <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none text-slate-800 text-sm shadow-sm">{fb.description}</div>
                                                                    <span className="text-[10px] text-slate-400 mt-1 ml-1">{new Date(fb.createdAt).toLocaleTimeString()}</span>
                                                                </div>
                                                            </div>

                                                            {/* Hien thi tin nhan cu (replies) neu co */}
                                                            {fb.replies && fb.replies.map((rep: any, idx: number) => (
                                                                <div key={idx} className="flex flex-col items-end">
                                                                    <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm bg-indigo-600 text-white rounded-br-none">
                                                                        {rep.content}
                                                                    </div>
                                                                    <span className="text-[10px] text-slate-400 mt-1 px-1">{new Date(rep.createdAt).toLocaleString('vi-VN')}</span>
                                                                </div>
                                                            ))}

                                                            {/* Input Area */}
                                                            {fb.status === 'Activity' && (
                                                                <div className="mt-6 pt-4 border-t border-slate-100">
                                                                    <div className="flex gap-2">
                                                                        <Textarea placeholder="Nhập nội dung phản hồi tại đây..." className="min-h-[60px] bg-white text-xs" value={replyContent} onChange={(e: any) => setReplyContent(e.target.value)} />
                                                                        <Button className="h-auto w-16 self-stretch flex-col gap-1" onClick={() => replyMutation.mutate({ feedbackId: fb.feedbackID, content: replyContent })} disabled={!replyContent.trim()}><Send size={18} /></Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </section>
    );
};

// =================================================================================
// 3. MEMBERS VIEW (Chi tiết user đã update)
// =================================================================================
const MembersView = ({ users, isLoading, expandedUserId, setExpandedUserId, onBanClick }: any) => {
    const [emailFilter, setEmailFilter] = useState("");

    // Query chi tiết User
    // ⚠️ LƯU Ý: Phần này đang dùng Mock Data vì API thật có thể chưa có các trường "AI Content..."
    const { data: userDetails, isLoading: isLoadingDetails } = useQuery<any>({
        queryKey: ["userDetails", expandedUserId],
        queryFn: () => fakeApiCall(MOCK_USER_DETAILS),
        enabled: !!expandedUserId
    });

    return (
        <section className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-end mb-6">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Users className="text-indigo-600" /> Quản lý Members
                </h1>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <Input placeholder="Tìm kiếm user..." className="pl-10" value={emailFilter} onChange={(e: any) => setEmailFilter(e.target.value)} />
                </div>
            </div>

            <Card className="overflow-hidden shadow-md border-slate-200 bg-white">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4">User Info</th>
                            <th className="p-4">Ngày tham gia</th>
                            <th className="p-4">Ví hiện tại</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Đang tải danh sách...</td></tr>
                        ) : users.filter((u: any) => !emailFilter || u.email.toLowerCase().includes(emailFilter.toLowerCase())).map((user: any) => (
                            <React.Fragment key={user.userID}>
                                {/* DÒNG CHÍNH */}
                                <tr className={cn("transition-colors border-l-4 cursor-pointer", expandedUserId === user.userID ? "bg-slate-50 border-l-indigo-500" : "hover:bg-slate-50 border-l-transparent")}
                                    onClick={() => setExpandedUserId(expandedUserId === user.userID ? null : user.userID)}>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{user.fullName || "No Name"}</div>
                                        <div className="text-slate-500 text-xs">{user.email}</div>
                                    </td>
                                    <td className="p-4 text-slate-600">{new Date(user.createdAt).toLocaleDateString("vi-VN")}</td>
                                    <td className="p-4 font-mono font-bold text-emerald-600">{user.wallet?.currency.toLocaleString()} đ</td>
                                    <td className="p-4"><Badge variant={user.isBanned ? "destructive" : "success"}>{user.isBanned ? "Banned" : "Active"}</Badge></td>
                                    <td className="p-4 text-center flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        <Button size="sm" variant="ghostLight" onClick={() => setExpandedUserId(expandedUserId === user.userID ? null : user.userID)}>
                                            {expandedUserId === user.userID ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </Button>
                                        <Button size="sm" variant={user.isBanned ? "success" : "destructive"} onClick={() => onBanClick(user)}>
                                            {user.isBanned ? <UserX size={14} /> : <Ban size={14} />}
                                        </Button>
                                    </td>
                                </tr>

                                {/* DÒNG CHI TIẾT (XỔ XUỐNG) */}
                                {expandedUserId === user.userID && (
                                    <tr className="bg-slate-50/50 shadow-inner">
                                        <td colSpan={5} className="p-0">
                                            <div className="p-6 border-b border-slate-200 bg-slate-50">
                                                {isLoadingDetails ? (
                                                    <div className="flex justify-center py-8 text-slate-500 items-center gap-2"><RefreshCcw className="animate-spin" size={16} /> Đang tải lịch sử chi tiết...</div>
                                                ) : (
                                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">

                                                        {/* CỘT 1: THỐNG KÊ SỬ DỤNG CHỨC NĂNG (ĐÃ CẬP NHẬT) */}
                                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Activity size={16} className="text-indigo-500" /> Tần suất sử dụng</h3>
                                                            <div className="space-y-4">
                                                                {userDetails?.featureUsage.map((feat: any, idx: number) => (
                                                                    <div key={idx} className="flex flex-col gap-1 border-b border-slate-50 pb-2 last:border-0">
                                                                        <span className="text-sm text-slate-700 font-medium">{feat.name}</span>
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-xs text-slate-400">Dùng lần cuối: {new Date(feat.lastUsed).toLocaleDateString('vi-VN')}</span>
                                                                            <Badge variant="secondary" className="px-2">{feat.count} lần</Badge>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* CỘT 2: LỊCH SỬ NẠP TIỀN (ĐÃ BỎ CỘT KÊNH) */}
                                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Wallet size={16} className="text-emerald-500" /> Lịch sử nạp tiền</h3>
                                                            <div className="overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                                                                {userDetails?.deposits.length === 0 ? <p className="text-xs text-slate-400 text-center py-4">Chưa có giao dịch</p> :
                                                                    <table className="w-full text-xs">
                                                                        <thead className="text-slate-400 font-normal border-b border-slate-100">
                                                                            <tr>
                                                                                <th className="pb-2 text-left">Thời gian</th>
                                                                                {/* Đã bỏ cột Kênh */}
                                                                                <th className="pb-2 text-right">Số tiền</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-slate-50">
                                                                            {userDetails?.deposits.map((d: any) => (
                                                                                <tr key={d.id}>
                                                                                    <td className="py-2 text-slate-500">{new Date(d.time).toLocaleDateString('vi-VN')}</td>
                                                                                    <td className="py-2 text-right font-medium text-emerald-600">+{d.amount.toLocaleString()}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>}
                                                            </div>
                                                        </div>

                                                        {/* CỘT 3: LỊCH SỬ MUA CHỨC NĂNG */}
                                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><ShoppingCart size={16} className="text-amber-500" /> Lịch sử Mua / Thuê</h3>
                                                            <div className="overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                                                                {userDetails?.purchases.length === 0 ? <p className="text-xs text-slate-400 text-center py-4">Chưa có giao dịch</p> :
                                                                    <table className="w-full text-xs">
                                                                        <thead className="text-slate-400 font-normal border-b border-slate-100"><tr><th className="pb-2 text-left">Dịch vụ</th><th className="pb-2 text-center">SL</th><th className="pb-2 text-right">Tổng</th></tr></thead>
                                                                        <tbody className="divide-y divide-slate-50">
                                                                            {userDetails?.purchases.map((p: any) => (
                                                                                <tr key={p.id}>
                                                                                    <td className="py-2"><div className="font-medium text-slate-700 truncate max-w-[100px]" title={p.itemName}>{p.itemName}</div><div className="text-[10px] text-slate-400">{new Date(p.time).toLocaleDateString('vi-VN')}</div></td>
                                                                                    <td className="py-2 text-center text-slate-600">x{p.quantity}</td>
                                                                                    <td className="py-2 text-right font-medium text-rose-600">-{p.total.toLocaleString()}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </Card>
        </section>
    );
}

// =================================================================================
// MAIN WRAPPER COMPONENT
// =================================================================================
function StaffPage({ onLogout }: { onLogout: () => void }) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [currentView, setCurrentView] = useState<"dashboard" | "members" | "feedback">("dashboard");
    const [banDialog, setBanDialog] = useState(false);
    const [userToBan, setUserToBan] = useState<any>(null);

    // State mở rộng user
    const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

    // ✅ DÙNG API THẬT CHO DANH SÁCH USER
    const { data: usersData, isLoading: loadingUsers } = useQuery({
        queryKey: ["staffUsers"],
        queryFn: () => staffApi.getAllUsers()
    });

    // ✅ DÙNG API THẬT CHO STATS
    const { data: feedbacksData } = useQuery({
        queryKey: ["staffFeedbacks", "Activity"],
        queryFn: () => staffApi.getFeedbacksWithFilters({ status: 'Activity' })
    });

    const users = Array.isArray(usersData) ? usersData : [];
    const memberUsers = useMemo(() => users.filter((u: any) => u.role === "Member"), [users]);

    // Stats Calculation
    const dashboardStats = useMemo(() => {
        const total = memberUsers.length;
        const banned = memberUsers.filter((u: any) => u.isBanned).length;
        const active = total - banned;
        const userStatusData = [
            { name: 'Đang hoạt động', value: active, color: '#10b981' },
            { name: 'Đang bị cấm', value: banned, color: '#ef4444' },
        ];
        const topWallets = [...memberUsers]
            .sort((a: any, b: any) => (b.wallet?.currency || 0) - (a.wallet?.currency || 0))
            .slice(0, 5)
            .map((u: any) => ({ name: u.fullName || u.email.split('@')[0], balance: u.wallet?.currency || 0 }));

        // New Members for dashboard
        const newMembers = [...memberUsers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

        return { total, banned, active, userStatusData, topWallets, newMembers };
    }, [memberUsers]);

    // ✅ DÙNG API THẬT CHO BAN USER
    const banMutation = useMutation({
        mutationFn: ({ userId, isBanned, reason }: any) => staffApi.banUser(userId, { isBanned, reason }),
        onSuccess: () => {
            toast({ title: "Success", description: "Cập nhật trạng thái thành công." });
            setBanDialog(false);
            queryClient.invalidateQueries({ queryKey: ["staffUsers"] });
        }
    });

    return (
        <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900">
            {/* SIDEBAR */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-slate-300 flex flex-col z-20 shadow-2xl">
                <div className="p-6 flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Users size={20} /></div>
                    <div><h2 className="text-lg font-bold text-white">Staff Portal</h2><p className="text-xs text-slate-400">Manager Mode</p></div>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Button variant={currentView === "dashboard" ? "default" : "ghost"} className="w-full justify-start gap-3" onClick={() => setCurrentView("dashboard")}><LayoutDashboard size={18} /> Dashboard</Button>
                    <Button variant={currentView === "members" ? "default" : "ghost"} className="w-full justify-start gap-3" onClick={() => setCurrentView("members")}><Users size={18} /> Members</Button>
                    <Button variant={currentView === "feedback" ? "default" : "ghost"} className="w-full justify-start gap-3" onClick={() => setCurrentView("feedback")}><MessageSquare size={18} /> Feedback</Button>
                </nav>
                <div className="p-4 border-t border-slate-800"><Button variant="destructive" className="w-full justify-start gap-3" onClick={onLogout}><LogOut size={18} /> Đăng xuất</Button></div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="ml-64 w-full p-8 max-w-[1600px] mx-auto min-h-screen">
                {currentView === "dashboard" && <DashboardView stats={dashboardStats} feedbacks={feedbacksData} />}

                {currentView === "members" && (
                    <MembersView
                        users={memberUsers}
                        isLoading={loadingUsers}
                        expandedUserId={expandedUserId}
                        setExpandedUserId={setExpandedUserId}
                        onBanClick={(u: any) => { setUserToBan(u); setBanDialog(true); }}
                    />
                )}

                {currentView === "feedback" && <FeedbackView />}
            </main>

            {/* BAN DIALOG */}
            <Dialog open={banDialog} onClose={() => setBanDialog(false)}>
                <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-amber-500" /> Xác nhận hành động</DialogTitle></DialogHeader>
                <DialogContent>
                    <p className="text-slate-600">Bạn có chắc chắn muốn <span className="font-bold text-slate-900">{userToBan?.isBanned ? "MỞ KHÓA (Unban)" : "CẤM (Ban)"}</span> tài khoản <span className="text-indigo-600 font-semibold">{userToBan?.email}</span>?</p>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={() => setBanDialog(false)}>Hủy bỏ</Button>
                        <Button variant={userToBan?.isBanned ? "success" : "destructive"} onClick={() => banMutation.mutate({ userId: userToBan.userID, isBanned: !userToBan.isBanned, reason: "Admin confirmed action" })}>
                            {userToBan?.isBanned ? "Xác nhận Mở khóa" : "Xác nhận Cấm"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function StaffPageWrapper({ onLogout }: { onLogout: () => void }) {
    return <QueryClientProvider client={queryClient}><StaffPage onLogout={onLogout} /></QueryClientProvider>;
}