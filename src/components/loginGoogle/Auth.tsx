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
// SỬA Ở ĐÂY 1: Import instance axios trung tâm
import api from '@/axiosInstance';

interface UserProfile {
  email?: string;
  fullname?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

const Auth: React.FC<{ onLoginSuccess: (user: UserProfile) => void }> = ({ onLoginSuccess }) => {
  const [, setLocation] = useLocation();
  
  // State quan trọng: Kiểm tra xem đang ở chế độ Member hay Admin/Staff
  const [isAdminMode, setIsAdminMode] = useState(false);

  // --- 1. LOGIC CHO MEMBER (GIỮ NGUYÊN) ---
  const handleMemberLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;

    console.log("Credential nhận được:", credentialResponse.credential);

    try {
      const response = await api.post(
        '/authen/login-member',
        JSON.stringify(credentialResponse.credential),
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data && response.data.success && response.data.accessToken) {

        const { accessToken, refreshToken } = response.data;
        const decodedUser: UserProfile = jwtDecode(accessToken);

        const userToStore = {
          ...decodedUser,
          fullName: decodedUser.fullname
        };

        // Mã hóa và lưu vào localStorage
        localStorage.setItem('user', btoa(encodeURIComponent(JSON.stringify(userToStore))));

        // SỬA LUÔN DÒNG NÀY CHO AN TOÀN:
        // localStorage.setItem('tokens', btoa(JSON.stringify({ accessToken, refreshToken })));
        localStorage.setItem('tokens', btoa(encodeURIComponent(JSON.stringify({ accessToken, refreshToken }))));

        onLoginSuccess(userToStore);

        // BƯỚC 2: Nếu không phải Admin, thử cổng STAFF
        try {
            const staffRes = await api.post('/Authens/login-staff', JSON.stringify(credential), headers);
            if (staffRes.data && staffRes.data.success) {
                saveUserAndNotify(staffRes.data, 'Staff');
                return;
            }
        } catch (error) {
            // Cả 2 đều lỗi
            alert("Tài khoản này không có quyền truy cập Admin hoặc Staff.");
        }

    } catch (error) {
        console.error('System Error:', error);
        alert('Lỗi hệ thống.');
    }
  };

  // Hàm chung để lưu token và thông báo cho App.tsx
  const saveUserAndNotify = (data: any, role: string) => {
      const { accessToken, refreshToken } = data;
      const decodedUser: UserProfile = jwtDecode(accessToken);
      const userToStore = { ...decodedUser, role: role, fullName: decodedUser.fullname };

      // Lưu vào localStorage
      localStorage.setItem('user', btoa(encodeURIComponent(JSON.stringify(userToStore))));
      localStorage.setItem('tokens', btoa(encodeURIComponent(JSON.stringify({ accessToken, refreshToken }))));

      // Gọi hàm onLoginSuccess được truyền từ App.tsx
      // App.tsx sẽ lo việc điều hướng (navigate) dựa trên role
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
            {/* Đổi Icon tùy theo chế độ */}
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
            {/* Nút Google Login sẽ gọi hàm khác nhau tùy vào biến isAdminMode */}
            <GoogleLogin
              onSuccess={isAdminMode ? handleAdminStaffLoginSuccess : handleMemberLoginSuccess}
              onError={() => alert('Login Failed')}
              useOneTap={!isAdminMode} // Tắt OneTap khi ở chế độ Admin
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
            
            {/* Nút bấm chuyển đổi chế độ - Đã sửa onClick */}
            <button 
                type="button"
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full border text-white transition-all duration-300 cursor-pointer group ${
                    isAdminMode 
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