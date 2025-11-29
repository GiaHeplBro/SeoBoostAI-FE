import React, { useState, useEffect, useRef } from "react";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Search, Edit, CheckCircle, Ban, MessageSquare, Users, PieChart as PieChartIcon, UserX, LogOut } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

// ✅ IMPORT API
import api from '@/axiosInstance';

// =====================================================
// 🧩 STUB COMPONENTS
// =====================================================
const queryClient = new QueryClient();
const useToast = () => ({ toast: (o:any) => console.log(o) });
const Button = ({ variant, size, className, children, ...props }: any) => {
  let clr = "bg-blue-600 text-white";
  if (variant === "destructive") clr = "bg-red-600 text-white";
  if (variant === "ghost") clr = "hover:bg-gray-100 text-gray-900";
  if (variant === "outline") clr = "border border-gray-300";
  return <button className={`inline-flex items-center justify-center rounded-md font-medium h-10 px-4 py-2 ${clr} ${className}`} {...props}>{children}</button>
};
const Card = ({ children, className }: any) => <div className={`rounded-xl border bg-white text-gray-900 shadow-lg ${className}`}>{children}</div>;
const CardHeader = ({ children }: any) => <div className="p-6">{children}</div>;
const CardTitle = ({ children }: any) => <h3 className="text-xl font-bold flex items-center gap-2">{children}</h3>;
const CardContent = ({ children }: any) => <div className="p-6 pt-0">{children}</div>;
const Input = ({ className, ...props }: any) => <input className={`flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 ${className}`} {...props} />;
const Select = ({ children, value, onValueChange }: any) => <select className="h-10 w-full border rounded-md px-3" value={value} onChange={e=>onValueChange(e.target.value)}>{children}</select>;
const SelectItem = ({ value, children }: any) => <option value={value}>{children}</option>;
const Badge = ({ variant, className, children }: any) => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${variant==='destructive'?'bg-red-100 text-red-800':'bg-gray-100 text-gray-800'} ${className}`}>{children}</span>;
const Avatar = ({ className, children }: any) => <div className={`h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ${className}`}>{children}</div>;
const AvatarFallback = ({ children }: any) => <span>{children}</span>;

// DataTable 
const DataTable = ({ columns, data, page, pageSize, pageCount, onPageChange, onPageSizeChange, loading }: any) => {
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50"><tr>{columns.map((col:any) => <th key={col.accessorKey} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{col.header}</th>)}</tr></thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading && <tr><td colSpan={columns.length} className="text-center p-4">Đang tải...</td></tr>}
          {!loading && paginatedData.map((row:any, i:number) => <tr key={i}>{columns.map((col:any) => <td key={col.accessorKey} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{col.cell ? col.cell(row) : row[col.accessorKey]}</td>)}</tr>)}
        </tbody>
      </table>
      <div className="flex items-center justify-between mt-4">
        <Select value={pageSize} onValueChange={(v:any)=>onPageSizeChange(Number(v))}><SelectItem value="10">10</SelectItem><SelectItem value="20">20</SelectItem></Select>
        <div className="flex gap-2"><Button onClick={()=>onPageChange(page-1)} disabled={page<=1}>Trước</Button><span>Trang {page}/{pageCount}</span><Button onClick={()=>onPageChange(page+1)} disabled={page>=pageCount}>Sau</Button></div>
      </div>
    </div>
  );
};

const formatCurrency = (amount: number) => amount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "0 ₫";

// ✅ COMPONENT STAFF PAGE
function StaffPage({ onLogout }: { onLogout: () => void }) {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [feedbackFilterStatus, setFeedbackFilterStatus] = useState("activity");

  const staffRef = useRef(null);
  const banRef = useRef(null);
  const feedbackRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ⚠️ GỌI API THẬT (Users & Feedbacks)
  const { data, isLoading } = useQuery({
    queryKey: ["staffPageData"],
    queryFn: async () => {
      const [usersRes, feedbackRes] = await Promise.all([
        api.get('/api/Users'),
        api.get('/api/Feedbacks')
      ]);
      
      return { 
          users: usersRes.data || [], 
          feedbacks: feedbackRes.data || [] 
      };
    }
  });

  // Filter Logic
  const processedData = React.useMemo(() => {
    if (!data) return { users: [], feedbacks: [] };

    let filteredUsers = data.users.filter((u:any) => 
       (u.email?.includes(debouncedSearchQuery) || u.fullName?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
    );

    let filteredFeedbacks = data.feedbacks.filter((f:any) => 
       (f.email?.includes(debouncedSearchQuery) || f.message?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) &&
       (feedbackFilterStatus === 'both' ? true : f.status === feedbackFilterStatus)
    );

    return { users: filteredUsers, feedbacks: filteredFeedbacks };
  }, [data, debouncedSearchQuery, feedbackFilterStatus]);

  const users = processedData.users;
  const feedbacks = processedData.feedbacks;
  const totalUsers = users.length;
  const totalFeedbacks = feedbacks.length;

  const scrollTo = (ref: any) => ref.current?.scrollIntoView({ behavior: "smooth" });

  // Columns
  const staffColumns = [
    { accessorKey: "fullName", header: "Name", cell: (row:any) => <div className="flex gap-2 font-medium"><Avatar><AvatarFallback>{row.fullName?.charAt(0)}</AvatarFallback></Avatar>{row.fullName}</div>},
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role", cell: (row:any) => <Badge className="bg-blue-100 text-blue-800">{row.role}</Badge> },
    { accessorKey: "wallet", header: "Wallet", cell: (row:any) => formatCurrency(row.wallet || 0) }
  ];

  const banColumns = [
    { accessorKey: "fullName", header: "Name", cell: (row:any) => <div className="font-bold">{row.fullName}</div> },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "isBanned", header: "Status", cell: (row:any) => <Badge variant={row.isBanned?'destructive':'default'}>{row.isBanned ? 'Banned' : 'Active'}</Badge> },
    { accessorKey: "actions", header: "Actions", cell: (row:any) => (
        row.isBanned 
        ? <Button size="sm" variant="outline" className="text-green-600" onClick={()=>toast({title:"Chức năng đang phát triển"})}>Unban</Button>
        : <Button size="sm" variant="destructive" onClick={()=>toast({title:"Chức năng đang phát triển"})}>Ban</Button>
      ) 
    }
  ];

  const feedbackColumns = [
    { accessorKey: "email", header: "Email" },
    { accessorKey: "status", header: "Status", cell: (row:any) => <Badge className="bg-yellow-100 text-yellow-800">{row.status}</Badge> },
    { accessorKey: "createdAt", header: "Time", cell: (row:any) => row.createdAt ? format(new Date(row.createdAt), 'dd/MM/yyyy') : 'N/A' },
    { accessorKey: "message", header: "Message" },
    { accessorKey: "actions", header: "Act", cell: () => <Button size="sm" variant="ghost"><MessageSquare size={16}/></Button> }
  ];

  return (
    <div className="flex gap-6 p-6 bg-gray-100 min-h-screen">
      <aside className="w-56 sticky top-6 self-start">
        <Card className="shadow-none border-0">
          <CardContent className="p-4 space-y-2">
            <Button variant="ghost" className="justify-start gap-2 w-full" onClick={() => scrollTo(staffRef)}><Users className="text-blue-500" size={16}/> Staff Info</Button>
            <Button variant="ghost" className="justify-start gap-2 w-full" onClick={() => scrollTo(banRef)}><UserX className="text-red-500" size={16}/> Ban/Unban</Button>
            <Button variant="ghost" className="justify-start gap-2 w-full" onClick={() => scrollTo(feedbackRef)}><MessageSquare className="text-green-500" size={16}/> Feedback</Button>
            <Button variant="destructive" className="justify-start gap-2 mt-10 w-full" onClick={onLogout}><LogOut size={16}/> Đăng xuất</Button>
          </CardContent>
        </Card>
      </aside>

      <main className="flex-1 space-y-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <Input placeholder="Tìm kiếm..." className="pl-10 h-12" value={searchQuery} onChange={(e:any)=>setSearchQuery(e.target.value)} />
        </div>

        {/* BIỂU ĐỒ STAFF USAGE */}
        <div ref={staffRef}>
          <Card><CardHeader><CardTitle>Staff Information</CardTitle></CardHeader>
          <CardContent>
             <DataTable columns={staffColumns} data={users} page={page} pageSize={pageSize} pageCount={Math.ceil(totalUsers/pageSize)} onPageChange={setPage} onPageSizeChange={setPageSize} loading={isLoading} />
             <div className="mt-4 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  {/* Giữ nguyên biểu đồ Bar Chart */}
                  <BarChart data={users.map((u:any) => ({ name: u.fullName, usage: u.usage || 0 }))}>
                    <XAxis dataKey="name" hide={true} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </CardContent></Card>
        </div>

        {/* BIỂU ĐỒ BAN/UNBAN */}
        <div ref={banRef}>
          <Card><CardHeader><CardTitle>Ban / Unban Users</CardTitle></CardHeader>
          <CardContent>
             <DataTable columns={banColumns} data={users} page={page} pageSize={pageSize} pageCount={Math.ceil(totalUsers/pageSize)} onPageChange={setPage} onPageSizeChange={setPageSize} loading={isLoading} />
             <div className="mt-4 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'Banned', value: users.filter((u:any)=>u.isBanned).length }, { name: 'Active', value: users.filter((u:any)=>!u.isBanned).length }]}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ff4d4f" />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </CardContent></Card>
        </div>

        {/* BIỂU ĐỒ FEEDBACK */}
        <div ref={feedbackRef}>
          <Card><CardHeader><CardTitle>User Feedback</CardTitle></CardHeader>
          <CardContent>
            <div className="w-1/3 mb-4"><Select value={feedbackFilterStatus} onValueChange={setFeedbackFilterStatus}><SelectItem value="activity">Activity</SelectItem><SelectItem value="close">Close</SelectItem></Select></div>
            <DataTable columns={feedbackColumns} data={feedbacks} page={page} pageSize={pageSize} pageCount={Math.ceil(totalFeedbacks/pageSize)} onPageChange={setPage} onPageSizeChange={setPageSize} loading={isLoading} />
            <div className="mt-4 h-60">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'Activity', value: feedbacks.filter((f:any) => f.status === 'activity').length }, { name: 'Close', value: feedbacks.filter((f:any) => f.status === 'close').length }]}>
                    <XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </CardContent></Card>
        </div>
      </main>
    </div>
  );
}

export default function StaffPageWrapper({ onLogout }: { onLogout: () => void }) {
  return <QueryClientProvider client={queryClient}><StaffPage onLogout={onLogout} /></QueryClientProvider>;
}