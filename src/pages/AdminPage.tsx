import React from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const adminApi = axios.create({
  baseURL: 'https://localhost:7144', // 🧩 API NOTE: chỉnh URL backend thật tại đây
  // headers: { Authorization: `Bearer ${token}` } // nếu có login/token
});

interface Transaction {
  id: number;
  walletId: number;
  money: number;
  description: string;
  type: string;
  status: 'Pending' | 'Completed' | 'Failed';
  bankTransId: string;
  createdAt: string;
  wallet?: { user?: { fullName: string; } }
}

interface Subscription {
  id: number;
  userId: number;
  accountTypeId: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  accountType: { name: string; };
  user: { fullName: string; }
}

// 🧩 API NOTE: Xóa mockData khi đã có API thật
const mockTransactions: Transaction[] = [ /* ... */ ];
const mockSubscriptions: Subscription[] = [ /* ... */ ];

// 🧩 API NOTE: Gắn endpoint thật tại đây
// Lấy danh sách giao dịch
const fetchTransactions = async (): Promise<Transaction[]> => {
  // return (await adminApi.get('/api/transactions')).data;
  return Promise.resolve(mockTransactions);
};

// Lấy danh sách gói thuê bao
const fetchSubscriptions = async (): Promise<Subscription[]> => {
  // return (await adminApi.get('/api/subscriptions')).data;
  return Promise.resolve(mockSubscriptions);
};

// Cập nhật trạng thái giao dịch
const updateTransactionStatus = async ({ id, status }: { id: number; status: string }) => {
  // 🧩 API NOTE:
  // return (await adminApi.put(`/api/transactions/${id}/status`, { status })).data;
  console.log(`(Giả lập) Cập nhật transaction ${id} -> ${status}`);
  return Promise.resolve({ success: true });
};

export default function AdminPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 🧩 API NOTE: queryKey đặt tên giống endpoint
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['adminTransactions'],
    queryFn: fetchTransactions,
  });

  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: fetchSubscriptions,
  });

  const statusMutation = useMutation({
    mutationFn: updateTransactionStatus,
    onSuccess: () => {
      toast({ title: "✅ Thành công", description: "Đã cập nhật trạng thái giao dịch." });
      queryClient.invalidateQueries({ queryKey: ['adminTransactions'] });
    },
    onError: (error) => {
      toast({ title: "❌ Lỗi", description: (error as Error).message, variant: "destructive" });
    }
  });

  const handleStatusUpdate = (id: number, status: 'Completed' | 'Failed') => {
    statusMutation.mutate({ id, status });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-500/80 hover:bg-green-600 text-white">Hoàn thành</Badge>;
      case 'failed':
        return <Badge variant="destructive">Thất bại</Badge>;
      default:
        return <Badge className="bg-yellow-500/80 hover:bg-yellow-600 text-white">Đang chờ</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Bảng điều khiển Admin</h1>
      <p className="text-gray-500 mb-8">Theo dõi giao dịch, gói và biến động số dư ví</p>


      {/* --- Bảng giao dịch --- */}
      <Card className="shadow-md hover:shadow-lg transition">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-xl font-semibold text-gray-800">📦 Giao dịch gần đây</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoadingTransactions ? (
            <p>Đang tải giao dịch...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map(tx => (
                  <TableRow key={tx.id} className="hover:bg-gray-50">
                    <TableCell>{tx.wallet?.user?.fullName || 'Không rõ'}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell className="font-medium text-blue-600">{tx.money.toLocaleString('vi-VN')} VNĐ</TableCell>
                    <TableCell>{new Date(tx.createdAt).toLocaleString('vi-VN')}</TableCell>
                    <TableCell><StatusBadge status={tx.status} /></TableCell>
                    <TableCell className="text-right">
                      {tx.status.toLowerCase() === 'pending' && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-500 text-green-600 hover:bg-green-50"
                            onClick={() => handleStatusUpdate(tx.id, 'Completed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            onClick={() => handleStatusUpdate(tx.id, 'Failed')}
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Hủy
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* --- Bảng gói --- */}
      <Card className="shadow-md hover:shadow-lg transition">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-xl font-semibold text-gray-800">👥 Danh sách gói người dùng</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoadingSubscriptions ? (
            <p>Đang tải danh sách...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Gói</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày bắt đầu</TableHead>
                  <TableHead>Ngày kết thúc</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions?.map(sub => (
                  <TableRow key={sub.id} className="hover:bg-gray-50">
                    <TableCell>{sub.user?.fullName || 'Không rõ'}</TableCell>
                    <TableCell>{sub.accountType?.name || 'Không rõ'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={sub.isActive ? "default" : "secondary"}
                        className={sub.isActive ? "bg-blue-500/80 text-white" : "bg-gray-400"}
                      >
                        {sub.isActive ? 'Kích hoạt' : 'Không hoạt động'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(sub.startDate).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>{sub.endDate ? new Date(sub.endDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
