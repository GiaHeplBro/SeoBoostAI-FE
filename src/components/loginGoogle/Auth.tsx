import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Sparkles, Shield, ArrowLeft } from 'lucide-react';
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from '@/axiosInstance';

import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  email?: string;
  fullname?: string;
  role?: string;
  user_ID?: string; // From JWT payload
  userID?: number;  // Normalized for frontend use
  exp?: number;
  iat?: number;
  [key: string]: any;
}

const Auth: React.FC<{ onLoginSuccess: (user: UserProfile) => void }> = ({ onLoginSuccess }) => {
  const [, setLocation] = useLocation();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { toast } = useToast();

  // --- 1. LOGIC CHO MEMBER ---
  const handleMemberLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;



    try {
      const response = await api.post(
        '/authen/login-member',
        JSON.stringify(credentialResponse.credential),
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data && response.data.success && response.data.accessToken) {
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn quay trở lại!",
          className: "bg-green-50 border-green-200"
        });
        saveUserAndNotify(response.data, 'Member');
      } else {
        toast({
          title: "Đăng nhập thất bại",
          description: response.data?.message || "Lỗi không xác định từ hệ thống.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Member Login failed:', error);
      toast({
        title: "Lỗi đăng nhập",
        description: error.response?.data?.message || "Không thể kết nối đến máy chủ.",
        variant: "destructive"
      });
    }
  };

  // --- 2. LOGIC CHO ADMIN VÀ STAFF ---
  const handleAdminStaffLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;
    const credential = credentialResponse.credential;
    const headers = { headers: { 'Content-Type': 'application/json' } };


    try {
      // BƯỚC 1: Thử đăng nhập vào cổng ADMIN
      try {
        const adminRes = await api.post('/authen/login-admin', JSON.stringify(credential), headers);
        if (adminRes.data && adminRes.data.success) {
          toast({ title: "Chào mừng Admin!", description: "Đăng nhập hệ thống quản trị thành công." });
          saveUserAndNotify(adminRes.data, 'Admin');
          return;
        }
      } catch (error) {
        // Lờ đi lỗi này để thử tiếp Staff
      }

      // BƯỚC 2: Nếu không phải Admin, thử cổng STAFF
      try {
        const staffRes = await api.post('/authen/login-staff', JSON.stringify(credential), headers);
        if (staffRes.data && staffRes.data.success) {
          toast({ title: "Chào mừng Staff!", description: "Đăng nhập cổng nhân viên thành công." });
          saveUserAndNotify(staffRes.data, 'Staff');
          return;
        }
      } catch (error) {
        // Cả 2 đều lỗi
        toast({
          title: "Truy cập bị từ chối",
          description: "Tài khoản này không có quyền truy cập Admin hoặc Staff.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('System Error:', error);
      toast({
        title: "Lỗi hệ thống",
        description: "Vui lòng thử lại sau hoặc liên hệ kỹ thuật.",
        variant: "destructive"
      });
    }
  };


  // Hàm chung để lưu token và thông báo cho App.tsx
  const saveUserAndNotify = (data: any, expectedRole: string) => {
    const { accessToken, refreshToken } = data;

    // Clear localStorage trước để tránh conflict
    localStorage.clear();

    // Giải mã JWT để lấy role từ backend
    const decodedUser: UserProfile = jwtDecode(accessToken);

    // ✅ FIX: Normalize role - Backend gửi "User" nhưng frontend dùng "Member"
    let actualRole = decodedUser.role || expectedRole;

    // Map "User" -> "Member" để tương thích
    if (actualRole === "User") {
      actualRole = "Member";
    }

    const userToStore = {
      ...decodedUser,
      role: actualRole,  // Dùng role đã normalize
      fullName: decodedUser.fullname,
      // ✅ FIX: Thêm userID từ JWT's user_ID field
      userID: decodedUser.user_ID ? Number(decodedUser.user_ID) : undefined
    };

    // Lưu vào localStorage
    localStorage.setItem('user', btoa(encodeURIComponent(JSON.stringify(userToStore))));
    localStorage.setItem('tokens', btoa(encodeURIComponent(JSON.stringify({ accessToken, refreshToken }))));

    onLoginSuccess(userToStore);
  };


  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-cover bg-center p-4"
      style={{
        backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/imageuploadv3.appspot.com/o/TestFile%2F3d-network-communications-background-with-flowing-floating-particles.jpg?alt=media&token=dd55b96f-4e4f-454b-869a-ef54b22241c5')`,
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <Card className="relative z-10 w-full max-w-md bg-black/30 backdrop-blur-lg border-white/20 text-white animate-in fade-in-50 slide-in-from-bottom-10 duration-500 shadow-2xl">

        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            {isAdminMode ? (
              <Shield className="h-8 w-8 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
            ) : (
              <Sparkles className="h-8 w-8 text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
            )}

            <CardTitle className="text-3xl font-bold tracking-wider drop-shadow-md">
              {isAdminMode ? "Admin Portal" : "SEO-Boost AI"}
            </CardTitle>
          </div>
          <CardDescription className="text-gray-200 font-medium">
            {isAdminMode ? "Secure access for authorized personnel only." : "Welcome back! Please sign in to continue."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex justify-center py-4">
            <GoogleLogin
              onSuccess={isAdminMode ? handleAdminStaffLoginSuccess : handleMemberLoginSuccess}
              onError={() => toast({ title: "Lỗi Google", description: "Đăng nhập Google thất bại.", variant: "destructive" })}
              useOneTap={!isAdminMode}
              theme="filled_black"
              shape="pill"
              width="300"
              text={isAdminMode ? "continue_with" : "signin_with"}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center gap-5 pt-2 pb-8">
          <div className="relative w-full flex justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center"><span className="bg-transparent px-2 text-xs text-gray-400 uppercase">Or</span></div>
          </div>

          <button
            type="button"
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full border text-white transition-all duration-300 cursor-pointer group ${isAdminMode
              ? "bg-white/10 border-white/20 hover:bg-white/20"
              : "bg-white/10 border-white/20 hover:bg-purple-600/80 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              }`}
          >
            {isAdminMode ? (
              <>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Member Login</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 group-hover:text-purple-200 transition-colors" />
                <span className="text-sm font-medium">Login as Admin / Staff</span>
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-gray-400 opacity-70">
            By continuing, you agree to our Terms & Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
