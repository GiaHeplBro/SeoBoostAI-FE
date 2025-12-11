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

  // --- 1. LOGIC CHO MEMBER ---
  const handleMemberLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;

    // ✅ LOG TOKEN ĐỂ TEST BACKEND
    console.log("╔══════════════════════════════════════════════════════════");
    console.log("║ GOOGLE ID TOKEN (Member)");
    console.log("╠══════════════════════════════════════════════════════════");
    console.log(credentialResponse.credential);
    console.log("╠══════════════════════════════════════════════════════════");
    console.log("║ ➤ Copy token này để test với Postman/Backend");
    console.log("║ ➤ Endpoint Member: POST /authen/login-member");
    console.log("║ ➤ Body: JSON.stringify(token)");
    console.log("║ ➤ Headers: Content-Type: application/json");
    console.log("╚══════════════════════════════════════════════════════════");

    try {
      const response = await api.post(
        '/authen/login-member',
        JSON.stringify(credentialResponse.credential),
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data && response.data.success && response.data.accessToken) {
        saveUserAndNotify(response.data, 'Member');
      } else {
        alert("Lỗi đăng nhập Member: " + (response.data?.message || "Unknown error"));
      }
    } catch (error: any) {
      console.error('Member Login failed:', error);
      alert(error.response?.data?.message || 'Đăng nhập Member thất bại.');
    }
  };

  // --- 2. LOGIC CHO ADMIN VÀ STAFF ---
  const handleAdminStaffLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;
    const credential = credentialResponse.credential;
    const headers = { headers: { 'Content-Type': 'application/json' } };

    // ✅ LOG TOKEN ĐỂ TEST BACKEND
    console.log("╔══════════════════════════════════════════════════════════");
    console.log("║ GOOGLE ID TOKEN (Admin/Staff)");
    console.log("╠══════════════════════════════════════════════════════════");
    console.log(credential);
    console.log("╠══════════════════════════════════════════════════════════");
    console.log("║ ➤ Copy token này để test với Postman/Backend");
    console.log("║ ➤ Endpoint Admin: POST /authen/login-admin");
    console.log("║ ➤ Endpoint Staff: POST /authen/login-staff");
    console.log("║ ➤ Body: JSON.stringify(token)");
    console.log("║ ➤ Headers: Content-Type: application/json");
    console.log("╚══════════════════════════════════════════════════════════");

    try {
      // BƯỚC 1: Thử đăng nhập vào cổng ADMIN
      try {
        const adminRes = await api.post('/authen/login-admin', JSON.stringify(credential), headers);
        if (adminRes.data && adminRes.data.success) {
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
  const saveUserAndNotify = (data: any, expectedRole: string) => {
    const { accessToken, refreshToken } = data;

    // Clear localStorage trước để tránh conflict
    console.log("🧹 Clearing localStorage before saving new user...");
    localStorage.clear();

    // Giải mã JWT để lấy role từ backend
    const decodedUser: UserProfile = jwtDecode(accessToken);

    console.log("═══════════════════════════════════════");
    console.log("🔐 AUTHENTICATION DEBUG");
    console.log("═══════════════════════════════════════");
    console.log("Expected Role:", expectedRole);
    console.log("JWT Role:", decodedUser.role);
    console.log("User Email:", decodedUser.email);
    console.log("User ID from JWT:", decodedUser.user_ID); // Log user_ID
    console.log("═══════════════════════════════════════");

    // ✅ FIX: Normalize role - Backend gửi "User" nhưng frontend dùng "Member"
    let actualRole = decodedUser.role || expectedRole;

    // Map "User" -> "Member" để tương thích
    if (actualRole === "User") {
      console.log("⚠️ Normalizing role: 'User' -> 'Member'");
      actualRole = "Member";
    }

    // Cảnh báo nếu role không match
    if (actualRole !== expectedRole && expectedRole !== "Member") {
      console.warn("⚠️ Role mismatch detected!");
      console.warn("   Expected:", expectedRole);
      console.warn("   Got:", actualRole);
    }

    const userToStore = {
      ...decodedUser,
      role: actualRole,  // Dùng role đã normalize
      fullName: decodedUser.fullname,
      // ✅ FIX: Thêm userID từ JWT's user_ID field
      userID: decodedUser.user_ID ? Number(decodedUser.user_ID) : undefined
    };

    // Lưu vào localStorage
    console.log("💾 Saving user:", { email: userToStore.email, role: userToStore.role, userID: userToStore.userID });
    localStorage.setItem('user', btoa(encodeURIComponent(JSON.stringify(userToStore))));
    localStorage.setItem('tokens', btoa(encodeURIComponent(JSON.stringify({ accessToken, refreshToken }))));

    console.log("✅ Login complete, calling onLoginSuccess");
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
              onError={() => alert('Login Failed')}
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
