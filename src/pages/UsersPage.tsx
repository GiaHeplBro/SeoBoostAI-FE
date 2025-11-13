import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Import các component UI
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // 👈 Thêm Button
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // 👈 Thêm Card
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // 👈 Thêm DropdownMenu
import {
  MoreHorizontal,
  Plus,
  Users,
  Shield,
  UserCheck
} from "lucide-react"; // 👈 Thêm Icons

// ⛔️ ĐÃ GỠ BỎ import api from '@/axiosInstance';

// Cập nhật interface cho khớp với API mới
interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  avatar: string;
  createdAt: string;
}

// ===================================
// 🌟 TẠO AXIOS INSTANCE (Stub) 🌟
// Tạo một instance axios giả để code chạy.
// Thay thế bằng instance thật của bạn (trỏ đến backend).
const api = axios.create({
  baseURL: "https://api.example.com", // Giả sử URL
  // Bạn cũng có thể thêm headers mặc định tại đây nếu cần
});
// ===================================


// --- Hàm gọi API để lấy danh sách người dùng ---
const fetchUsers = async (): Promise<User[]> => {
  const storedTokens = localStorage.getItem('tokens');
  if (!storedTokens) {
    throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
  }
  const { accessToken } = JSON.parse(storedTokens);
  if (!accessToken) {
    throw new Error("Access token không hợp lệ. Vui lòng đăng nhập lại.");
  }

  const response = await api.get('/Users', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

// --- Component chính của trang Users ---
export default function UsersPage() {
  const {
    data: users,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    retry: 1,
  });

  // ===================================
  // 🌟 TÍNH TOÁN KPI (Thẻ thống kê) 🌟
  // ===================================
  const stats = useMemo(() => {
    if (!users) {
      return { total: 0, admins: 0, members: 0 };
    }
    const total = users.length;
    const admins = users.filter(u => u.role.toLowerCase() === 'admin').length;
    const members = total - admins;
    return { total, admins, members };
  }, [users]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-red-500">
          Lỗi khi tải dữ liệu: {error instanceof Error ? error.message : "Đã có lỗi xảy ra"}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* === 1. Thẻ KPI === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Người Dùng</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">tổng số người dùng trong hệ thống</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quản trị viên (Admin)</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-gray-500">tài khoản có quyền cao nhất</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thành viên (Member)</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.members}</div>
            <p className="text-xs text-gray-500">người dùng thông thường</p>
          </CardContent>
        </Card>
      </div>

      {/* === 2. Tiêu đề và Nút Hành động === */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
        </Button>
      </div>

      {/* === 3. Bảng Dữ liệu (trong Card) === */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[350px]">Tên người dùng</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatar || undefined} alt={user.fullName} />
                        <AvatarFallback>
                          {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role.toLowerCase() === 'admin' ? 'destructive' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  {/* 🌟 THÊM CỘT ACTIONS 🌟 */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Mở menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                        <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">
                          Xóa người dùng
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}