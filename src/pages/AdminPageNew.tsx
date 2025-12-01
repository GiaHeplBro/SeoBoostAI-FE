import React, { useState, useRef, useEffect } from "react";
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
    X,
    ChevronDown,
    ChevronUp,
    Search,
} from "lucide-react";

// ✅ IMPORT API
import { staffApi, type UserDetailWithStats, type FeedbackWithMessages } from '@/lib/adminApi';

// =====================================================
// 🧩 STUB COMPONENTS
// =====================================================
const queryClient = new QueryClient();
const Button = ({ variant, size, className, children, ...props }: any) => {
    const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50";
    const sz = size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4 py-2";
    let clr = "bg-blue-600 text-white hover:bg-blue-700";
    if (variant === "destructive") clr = "bg-red-600 text-white hover:bg-red-700";
    if (variant === "outline") clr = "border border-gray-300 hover:bg-gray-100";
    if (variant === "ghost") clr = "hover:bg-gray-100 text-gray-900";
    if (variant === "success") clr = "bg-green-600 text-white hover:bg-green-700";
    return <button className={`${base} ${sz} ${clr} ${className}`} {...props}>{children}</button>;
};
const Card = ({ children, className }: any) => <div className={`rounded-xl border bg-white shadow ${className}`}>{children}</div>;
const CardHeader = ({ children, className }: any) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className }: any) => <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>;
const CardContent = ({ children, className }: any) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const Input = ({ className, ...props }: any) => <input className={`flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${className}`} {...props} />;
const Select = ({ children, value, onChange, className }: any) => <select className={`h-10 w-full border rounded-md px-3 ${className}`} value={value} onChange={onChange}>{children}</select>;
const Badge = ({ variant, className, children }: any) => {
    let clr = "bg-blue-100 text-blue-800";
    if (variant === "destructive") clr = "bg-red-100 text-red-800";
    if (variant === "success") clr = "bg-green-100 text-green-800";
    if (variant === "warning") clr = "bg-yellow-100 text-yellow-800";
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${clr} ${className}`}>{children}</span>;
};
const Dialog = ({ open, onClose, children }: any) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};
const DialogHeader = ({ children }: any) => <div className="p-6 pb-0">{children}</div>;
const DialogTitle = ({ children }: any) => <h2 className="text-xl font-semibold">{children}</h2>;
const DialogContent = ({ children }: any) => <div className="p-6 space-y-4">{children}</div>;
const DialogFooter = ({ children }: any) => <div className="p-6 pt-0 flex justify-end gap-2">{children}</div>;
const Textarea = ({ className, ...props }: any) => <textarea className={`flex w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[100px] ${className}`} {...props} />;

const useToast = () => ({
    toast: (opts: any) => {
        alert(opts.title + (opts.description ? '\n' + opts.description : ''));
    }
});

// =====================================================
// 🧩 TYPES
// =====================================================
interface User {
    userID: number;
    fullName: string;
    email: string;
    role: string;
    isBanned: boolean;
    isDeleted: boolean;
    createdAt?: string;
    wallet?: {
        walletID: number;
        currency: number;
    };
}

// =====================================================
// 🧩 ADMIN PAGE COMPONENT
// =====================================================
function AdminPage({ onLogout }: { onLogout: () => void }) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // State
    const [emailFilter, setEmailFilter] = useState<string>("");
    const [banStatusFilter, setBanStatusFilter] = useState<string>("all"); // all, banned, active
    const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

    // Feedback states
    const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>("Activity");
    const [feedbackEmailFilter, setFeedbackEmailFilter] = useState<string>("");
    const [feedbackTimeSort, setFeedbackTimeSort] = useState<string>("newest");
    const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
    const [selectedFeedbackDetail, setSelectedFeedbackDetail] = useState<any>(null);
    const [replyDialog, setReplyDialog] = useState<boolean>(false);
    const [detailDialog, setDetailDialog] = useState<boolean>(false);
    const [replyContent, setReplyContent] = useState<string>("");

    // Scroll Refs
    const usersRef = useRef<HTMLDivElement>(null);
    const banRef = useRef<HTMLDivElement>(null);
    const feedbackRef = useRef<HTMLDivElement>(null);
    const scrollTo = (ref: React.RefObject<HTMLDivElement>) => ref.current?.scrollIntoView({ behavior: "smooth" });

    // ==================== QUERIES ====================
    const { data: usersData, isLoading: loadingUsers } = useQuery({
        queryKey: ["adminUsers"],
        queryFn: () => staffApi.getAllUsers(),
    });

    const users: User[] = Array.isArray(usersData) ? usersData : [];

    // Expanded user details
    const { data: userStats, isLoading: loadingUserStats } = useQuery<UserDetailWithStats>({
        queryKey: ["userStats", expandedUserId],
        queryFn: () => staffApi.getUserWithStats(expandedUserId!),
        enabled: !!expandedUserId,
    });

    const { data: userTransactions, isLoading: loadingTransactions } = useQuery({
        queryKey: ["userTransactions", expandedUserId],
        queryFn: () => staffApi.getUserTransactionHistory(expandedUserId!, "Deposit"),
        enabled: !!expandedUserId,
    });

    const { data: userPurchases, isLoading: loadingPurchases } = useQuery({
        queryKey: ["userPurchases", expandedUserId],
        queryFn: () => staffApi.getUserPurchaseHistory(expandedUserId!),
        enabled: !!expandedUserId,
    });

    // Feedbacks query
    const { data: feedbacksData, isLoading: loadingFeedbacks } = useQuery<FeedbackWithMessages[]>({
        queryKey: ["adminFeedbacks", feedbackStatusFilter, feedbackEmailFilter, feedbackTimeSort],
        queryFn: () => staffApi.getFeedbacksWithFilters({
            status: feedbackStatusFilter === "Both" ? undefined : feedbackStatusFilter,
            email: feedbackEmailFilter || undefined,
            sortBy: feedbackTimeSort,
        }),
    });

    const feedbacks = feedbacksData || [];

    // ==================== MUTATIONS ====================
    const banMutation = useMutation({
        mutationFn: ({ userId, isBanned, reason }: { userId: number; isBanned: boolean; reason?: string }) =>
            staffApi.banUser(userId, { isBanned, reason }),
        onSuccess: () => {
            toast({ title: "✅ Thành công", description: "Đã cập nhật trạng thái ban" });
            queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
        },
        onError: () => toast({ title: "❌ Lỗi", description: "Không thể ban/unban user" }),
    });

    const replyMutation = useMutation({
        mutationFn: ({ feedbackId, content }: { feedbackId: number; content: string }) =>
            staffApi.addFeedbackReply(feedbackId, { content }),
        onSuccess: async (data, variables) => {
            toast({ title: "✅ Thành công", description: "Đã gửi reply" });
            setReplyContent("");
            // Refetch feedbacks để lấy data mới
            await queryClient.invalidateQueries({ queryKey: ["adminFeedbacks"] });
            // Tìm feedback vừa reply và update selectedFeedback
            const updatedFeedbacks = queryClient.getQueryData<any[]>(["adminFeedbacks"]);
            if (updatedFeedbacks) {
                const updatedFeedback = updatedFeedbacks.find(f => f.feedbackID === variables.feedbackId);
                if (updatedFeedback) {
                    setSelectedFeedback(updatedFeedback);
                }
            }
            // Giữ dialog mở
        },
        onError: () => toast({ title: "❌ Lỗi", description: "Không thể gửi reply" }),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ feedbackId, status }: { feedbackId: number; status: string }) =>
            staffApi.updateFeedbackStatus(feedbackId, { status }),
        onSuccess: () => {
            toast({ title: "✅ Thành công", description: "Đã cập nhật status" });
            queryClient.invalidateQueries({ queryKey: ["adminFeedbacks"] });
        },
        onError: () => toast({ title: "❌ Lỗi", description: "Không thể cập nhật status" }),
    });

    // ==================== HANDLERS ====================
    const handleBan = (userId: number, isBanned: boolean) => {
        const reason = isBanned ? prompt("Lý do ban user:") ?? undefined : undefined;
        if (isBanned && !reason) return;
        banMutation.mutate({ userId, isBanned, reason });
    };

    const handleReply = (feedback: any) => {
        setSelectedFeedback(feedback);
        setReplyDialog(true);
    };

    const handleViewDetail = (feedback: any) => {
        setSelectedFeedbackDetail(feedback);
        setDetailDialog(true);
    };

    const handleSendReply = () => {
        if (!selectedFeedback || !replyContent.trim()) return;
        replyMutation.mutate({ feedbackId: selectedFeedback.feedbackID, content: replyContent });
    };

    const handleChangeStatus = (feedbackId: number, newStatus: string) => {
        updateStatusMutation.mutate({ feedbackId, status: newStatus });
    };

    // ==================== FILTERED DATA ====================
    const filteredUsers = users.filter((u) => {
        if (u.isDeleted) return false;
        if (emailFilter && !u.email?.toLowerCase().includes(emailFilter.toLowerCase())) return false;
        if (banStatusFilter === "banned" && !u.isBanned) return false;
        if (banStatusFilter === "active" && u.isBanned) return false;
        return true;
    }).sort((a, b) => a.email.localeCompare(b.email)); // Sort by email

    return (
        <div className="flex bg-gray-50 min-h-screen">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-6 shadow-lg flex flex-col">
                <div className="flex-grow">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                        <Users className="text-blue-400" /> Admin Panel
                    </h2>
                    <nav className="flex flex-col space-y-2">
                        <Button variant="ghost" className="text-white justify-start gap-2" onClick={() => scrollTo(usersRef)}>
                            <Users size={18} /> Thông tin Users
                        </Button>
                        <Button variant="ghost" className="text-white justify-start gap-2" onClick={() => scrollTo(banRef)}>
                            <UserX size={18} /> Ban/Unban
                        </Button>
                        <Button variant="ghost" className="text-white justify-start gap-2" onClick={() => scrollTo(feedbackRef)}>
                            <MessageSquare size={18} /> Feedback
                        </Button>
                    </nav>
                </div>
                <div className="mt-auto">
                    <Button variant="destructive" className="w-full justify-start gap-2" onClick={onLogout}>
                        <LogOut size={18} /> Đăng xuất
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 w-full px-10 py-10 space-y-12">
                {/* ==================== USERS INFO ==================== */}
                <section ref={usersRef}>
                    <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                        <Users className="text-blue-600" /> Thông tin Users
                    </h1>

                    {/* Filter */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex gap-4 items-center">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <Input
                                        placeholder="Tìm theo email..."
                                        className="pl-10"
                                        value={emailFilter}
                                        onChange={(e: any) => setEmailFilter(e.target.value)}
                                    />
                                </div>
                                <div className="text-sm text-gray-600">
                                    Tổng: {filteredUsers.length} users
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Users Table with Expandable Rows */}
                    <Card>
                        <CardContent className="pt-6">
                            {loadingUsers ? (
                                <div className="text-center py-10">Đang tải...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr>
                                                <th className="text-left p-4 font-medium">Email</th>
                                                <th className="text-left p-4 font-medium">Tên</th>
                                                <th className="text-left p-4 font-medium">Role</th>
                                                <th className="text-left p-4 font-medium">Số dư ví</th>
                                                <th className="text-left p-4 font-medium">Chi tiết</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((user) => (
                                                <React.Fragment key={user.userID}>
                                                    <tr className="border-b hover:bg-gray-50">
                                                        <td className="p-4">{user.email}</td>
                                                        <td className="p-4">{user.fullName || "N/A"}</td>
                                                        <td className="p-4">
                                                            <Badge variant={user.role === "Admin" ? "destructive" : "default"}>
                                                                {user.role}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-4">
                                                            {user.wallet ? `${user.wallet.currency.toLocaleString("vi-VN")}₫` : "N/A"}
                                                        </td>
                                                        <td className="p-4">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setExpandedUserId(expandedUserId === user.userID ? null : user.userID)}
                                                            >
                                                                {expandedUserId === user.userID ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                    {expandedUserId === user.userID && (
                                                        <tr>
                                                            <td colSpan={5} className="p-6 bg-gray-50">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                    {/* Feature Usage Stats */}
                                                                    <div className="bg-white p-4 rounded-lg shadow">
                                                                        <h4 className="font-semibold mb-3">Số lần sử dụng chức năng</h4>
                                                                        {loadingUserStats ? (
                                                                            <p className="text-sm text-gray-500">Đang tải...</p>
                                                                        ) : userStats?.featureUsageStats ? (
                                                                            <div className="space-y-2">
                                                                                {Object.entries(userStats.featureUsageStats).map(([feature, count]) => (
                                                                                    <div key={feature} className="flex justify-between text-sm">
                                                                                        <span className="text-gray-700">{feature}:</span>
                                                                                        <span className="font-semibold">{count as number} lần</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-sm text-gray-500">Chưa có dữ liệu</p>
                                                                        )}
                                                                    </div>

                                                                    {/* Transaction History */}
                                                                    <div className="bg-white p-4 rounded-lg shadow">
                                                                        <h4 className="font-semibold mb-3">Lịch sử nạp tiền</h4>
                                                                        {loadingTransactions ? (
                                                                            <p className="text-sm text-gray-500">Đang tải...</p>
                                                                        ) : userTransactions && userTransactions.length > 0 ? (
                                                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                                                {userTransactions.map((tx: any, idx: number) => (
                                                                                    <div key={idx} className="text-sm border-b pb-2">
                                                                                        <div className="flex justify-between">
                                                                                            <span className="text-gray-600">{new Date(tx.createdAt).toLocaleDateString("vi-VN")}</span>
                                                                                            <span className="font-semibold text-green-600">
                                                                                                +{tx.amount?.toLocaleString("vi-VN")}₫
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-sm text-gray-500">Chưa có giao dịch</p>
                                                                        )}
                                                                    </div>

                                                                    {/* Purchase History */}
                                                                    <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
                                                                        <h4 className="font-semibold mb-3">Lịch sử mua chức năng</h4>
                                                                        {loadingPurchases ? (
                                                                            <p className="text-sm text-gray-500">Đang tải...</p>
                                                                        ) : userPurchases && userPurchases.length > 0 ? (
                                                                            <div className="overflow-x-auto">
                                                                                <table className="w-full text-sm">
                                                                                    <thead className="border-b">
                                                                                        <tr>
                                                                                            <th className="text-left p-2">Thời gian</th>
                                                                                            <th className="text-left p-2">Chức năng</th>
                                                                                            <th className="text-left p-2">Số lượng</th>
                                                                                            <th className="text-left p-2">Giá</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {userPurchases.map((purchase: any, idx: number) => (
                                                                                            <tr key={idx} className="border-b">
                                                                                                <td className="p-2">{new Date(purchase.purchaseDate).toLocaleDateString("vi-VN")}</td>
                                                                                                <td className="p-2">{purchase.featureName || "N/A"}</td>
                                                                                                <td className="p-2">{purchase.totalQuantity}</td>
                                                                                                <td className="p-2 text-green-600 font-semibold">
                                                                                                    {purchase.price?.toLocaleString("vi-VN")}₫
                                                                                                </td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-sm text-gray-500">Chưa có lịch sử mua</p>
                                                                        )}
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
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* ==================== BAN/UNBAN MANAGEMENT ==================== */}
                <section ref={banRef}>
                    <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                        <UserX className="text-red-600" /> Ban/Unban Users
                    </h1>

                    {/* Filter */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex gap-4 items-center">
                                <label className="text-sm font-medium">Lọc theo trạng thái:</label>
                                <Select value={banStatusFilter} onChange={(e: any) => setBanStatusFilter(e.target.value)} className="w-48">
                                    <option value="all">Tất cả</option>
                                    <option value="active">Active</option>
                                    <option value="banned">Banned</option>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ban/Unban Table */}
                    <Card>
                        <CardContent className="pt-6">
                            {loadingUsers ? (
                                <div className="text-center py-10">Đang tải...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr>
                                                <th className="text-left p-4 font-medium">Email</th>
                                                <th className="text-left p-4 font-medium">Tên</th>
                                                <th className="text-left p-4 font-medium">Role</th>
                                                <th className="text-left p-4 font-medium">Trạng thái</th>
                                                <th className="text-left p-4 font-medium">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((user) => (
                                                <tr key={user.userID} className="border-b hover:bg-gray-50">
                                                    <td className="p-4">{user.email}</td>
                                                    <td className="p-4">{user.fullName || "N/A"}</td>
                                                    <td className="p-4">
                                                        <Badge variant={user.role === "Admin" ? "destructive" : "default"}>
                                                            {user.role}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge variant={user.isBanned ? "destructive" : "success"}>
                                                            {user.isBanned ? "Banned" : "Active"}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        {user.isBanned ? (
                                                            <Button
                                                                size="sm"
                                                                variant="success"
                                                                onClick={() => handleBan(user.userID, false)}
                                                                disabled={banMutation.isPending}
                                                            >
                                                                Unban
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleBan(user.userID, true)}
                                                                disabled={banMutation.isPending}
                                                            >
                                                                <Ban size={16} className="mr-1" /> Ban
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* ==================== FEEDBACK MANAGEMENT ==================== */}
                <section ref={feedbackRef}>
                    <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                        <MessageSquare className="text-green-600" /> Quản lý Feedback
                    </h1>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Trạng thái</label>
                                    <Select value={feedbackStatusFilter} onChange={(e: any) => setFeedbackStatusFilter(e.target.value)}>
                                        <option value="Activity">Activity</option>
                                        <option value="Close">Close</option>
                                        <option value="Both">Both (Cả 2)</option>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <Input
                                        placeholder="Tìm theo email..."
                                        value={feedbackEmailFilter}
                                        onChange={(e: any) => setFeedbackEmailFilter(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Sắp xếp thời gian</label>
                                    <Select value={feedbackTimeSort} onChange={(e: any) => setFeedbackTimeSort(e.target.value)}>
                                        <option value="newest">Mới nhất</option>
                                        <option value="oldest">Cũ nhất</option>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Feedbacks Table */}
                    <Card>
                        <CardContent className="pt-6">
                            {loadingFeedbacks ? (
                                <div className="text-center py-10">Đang tải...</div>
                            ) : feedbacks.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">Không có feedback</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr>
                                                <th className="text-left p-4 font-medium">Email</th>
                                                <th className="text-left p-4 font-medium">Trạng thái</th>
                                                <th className="text-left p-4 font-medium">Thời gian</th>
                                                <th className="text-left p-4 font-medium">Nội dung</th>
                                                <th className="text-left p-4 font-medium">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {feedbacks.map((feedback) => (
                                                <tr key={feedback.feedbackID} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDetail(feedback)}>
                                                    <td className="p-4">{feedback.userEmail || "N/A"}</td>
                                                    <td className="p-4">
                                                        <Badge variant={feedback.status === "Activity" ? "warning" : "success"}>
                                                            {feedback.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">
                                                        {feedback.createdAt ? new Date(feedback.createdAt).toLocaleString("vi-VN") : "N/A"}
                                                    </td>
                                                    <td className="p-4 max-w-xs truncate">{feedback.description || "N/A"}</td>
                                                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex gap-2">
                                                            <Button size="sm" variant="outline" onClick={() => handleReply(feedback)} title="Reply">
                                                                <Send size={16} />
                                                            </Button>
                                                            {feedback.status === "Activity" ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="success"
                                                                    onClick={() => handleChangeStatus(feedback.feedbackID, "Close")}
                                                                    disabled={updateStatusMutation.isPending}
                                                                    title="Close"
                                                                >
                                                                    Close
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="warning"
                                                                    onClick={() => handleChangeStatus(feedback.feedbackID, "Activity")}
                                                                    disabled={updateStatusMutation.isPending}
                                                                    title="Reopen"
                                                                >
                                                                    Reopen
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </main>

            {/* ==================== REPLY DIALOG ==================== */}
            <Dialog open={replyDialog} onClose={() => setReplyDialog(false)}>
                <DialogHeader>
                    <DialogTitle>Trả lời Feedback</DialogTitle>
                </DialogHeader>
                <DialogContent>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Từ:</label>
                            <p className="text-sm">{selectedFeedback?.userEmail} ({selectedFeedback?.userName})</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung ban đầu:</label>
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                                <p className="text-sm whitespace-pre-wrap">{selectedFeedback?.description}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    {selectedFeedback?.createdAt ? new Date(selectedFeedback.createdAt).toLocaleString("vi-VN") : ""}
                                </p>
                            </div>
                        </div>
                    </div>
                    {selectedFeedback?.messages && selectedFeedback.messages.length > 0 && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lịch sử hội thoại ({selectedFeedback.messages.length}):</label>
                            <div className="bg-gray-50 p-3 rounded space-y-3 max-h-64 overflow-y-auto border">
                                {selectedFeedback.messages.map((msg: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded ${msg.senderRole === 'Staff' || msg.senderRole === 'Admin' ? 'bg-green-50 border-l-4 border-green-500 ml-4' : 'bg-blue-50 border-l-4 border-blue-500 mr-4'}`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-semibold text-sm">{msg.senderName}
                                                <span className="ml-2 text-xs font-normal text-gray-600">({msg.senderRole})</span>
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {msg.createdAt ? new Date(msg.createdAt).toLocaleString("vi-VN") : ""}
                                            </p>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tin nhắn của bạn:</label>
                        <Textarea
                            placeholder="Nhập nội dung reply..."
                            value={replyContent}
                            onChange={(e: any) => setReplyContent(e.target.value)}
                        />
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setReplyDialog(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleSendReply} disabled={replyMutation.isPending || !replyContent.trim()}>
                        {replyMutation.isPending ? "Đang gửi..." : "Gửi Reply"}
                    </Button>
                </DialogFooter>
            </Dialog>

            {/* ==================== DETAIL DIALOG ==================== */}
            <Dialog open={detailDialog} onClose={() => setDetailDialog(false)}>
                <DialogHeader>
                    <DialogTitle>Chi tiết Feedback</DialogTitle>
                </DialogHeader>
                <DialogContent>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email:</label>
                            <p className="text-sm mt-1">{selectedFeedbackDetail?.userEmail || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Người gửi:</label>
                            <p className="text-sm mt-1">{selectedFeedbackDetail?.userName || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Chủ đề:</label>
                            <p className="text-sm mt-1">{selectedFeedbackDetail?.topic || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Trạng thái:</label>
                            <Badge variant={selectedFeedbackDetail?.status === "Activity" ? "warning" : "success"}>
                                {selectedFeedbackDetail?.status}
                            </Badge>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Thời gian:</label>
                            <p className="text-sm mt-1">
                                {selectedFeedbackDetail?.createdAt ? new Date(selectedFeedbackDetail.createdAt).toLocaleString("vi-VN") : "N/A"}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nội dung:</label>
                            <div className="bg-gray-50 p-3 rounded mt-1 max-h-60 overflow-y-auto">
                                <p className="text-sm whitespace-pre-wrap">{selectedFeedbackDetail?.description || "N/A"}</p>
                            </div>
                        </div>
                        {selectedFeedbackDetail?.messages && selectedFeedbackDetail.messages.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tin nhắn ({selectedFeedbackDetail.messages.length}):</label>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {selectedFeedbackDetail.messages.map((msg: any, idx: number) => (
                                        <div key={idx} className="bg-gray-50 p-3 rounded">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-medium text-gray-600">{msg.senderName} ({msg.senderRole})</span>
                                                <span className="text-xs text-gray-500">
                                                    {msg.createdAt ? new Date(msg.createdAt).toLocaleString("vi-VN") : ""}
                                                </span>
                                            </div>
                                            <p className="text-sm">{msg.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDetailDialog(false)}>
                        Đóng
                    </Button>
                    <Button onClick={() => { setDetailDialog(false); handleReply(selectedFeedbackDetail); }}>
                        <Send size={16} className="mr-2" /> Trả lời
                    </Button>
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

