import React, { useState } from 'react';
// ⛔️ ĐÃ XÓA: import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Sparkles } from 'lucide-react'; // Đã gỡ bỏ UserCog vì không dùng
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from '@/axiosInstance';

// =====================================================
// 🧩 STUB/FAKE cho @react-oauth/google (ĐỂ FIX LỖI)
// =====================================================
// Định nghĩa kiểu 'CredentialResponse' mà import gốc đã cung cấp
interface CredentialResponse {
  credential?: string;
}

// Tạo component 'GoogleLogin' giả để code có thể biên dịch
const GoogleLogin: React.FC<{
  onSuccess: (res: CredentialResponse) => void;
  onError: () => void;
  useOneTap?: boolean;
  theme?: string;
  shape?: string;
}> = ({ onSuccess, onError }) => (
  <button
    onClick={() => onSuccess({ credential: "fake-google-credential-from-stub" })}
    className="bg-white text-black p-3 rounded-full font-medium"
  >
    Đăng nhập với Google (Fake)
  </button>
);
// =====================================================

interface UserProfile {
  email?: string;
  fullname?: string;
  role?: string;
  picture?: string;
}

const Auth: React.FC<{ onLoginSuccess: (user: UserProfile) => void }> = ({ onLoginSuccess }) => {
  const [note, setNote] = useState<string>("");
  const [, setLocation] = useLocation();

  // =====================================================
  // 🟢 Xử lý khi Google đăng nhập thành công
  // =====================================================
  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;

    try {
      // ⚠️ Đang sử dụng dữ liệu giả (fake data) để demo
      // Vì API thật '/Authens/login-with-google' không khả dụng trong môi trường này
      const fakeUser = { fullname: "Demo User", email: "user@example.com", role: "user" };
      localStorage.setItem("user", btoa(JSON.stringify(fakeUser)));
      onLoginSuccess(fakeUser);
      setNote("🚀 Đang chuyển tới Dashboard...");
      setTimeout(() => setLocation("/dashboard"), 1200);

      // ------------------------------------
      // ⛔️ API thật đang được comment ⛔️
      // ------------------------------------
      // const response = await api.post(
      //   '/Authens/login-with-google',
      //   JSON.stringify(credentialResponse.credential),
      //   { headers: { 'Content-Type': 'application/json' } }
      // );

      // if (response.data?.success && response.data.accessToken) {
      //   const decodedUser: UserProfile = {
      //     fullname: "User", // giả sử server trả về fullname
      //     email: "user@example.com",
      //     role: "user"
      //   };

      //   const userToStore = {
      //     ...decodedUser,
      //     fullName: decodedUser.fullname || decodedUser.email?.split('@')[0],
      //   };

      //   localStorage.setItem('user', btoa(JSON.stringify(userToStore)));
      //   localStorage.setItem('tokens', btoa(JSON.stringify({ accessToken: response.data.accessToken, refreshToken: response.data.refreshToken })));

      //   onLoginSuccess(userToStore);
      //   setNote("🚀 Đang chuyển tới Dashboard...");
      //   setTimeout(() => setLocation("/dashboard"), 1200);
      // }
      // ------------------------------------

    } catch (error) {
      // Lỗi này là bình thường vì chúng ta đang chặn gọi API thật
      console.error("Lỗi Google login (đã dự kiến khi dùng fake data):", error);
      // alert("Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };

  // =====================================================
  // 🟢 Login thủ công Admin / Staff
  // =====================================================
  const handleManualLogin = (role: string) => {
    const fakeUser: UserProfile = {
      fullname: role === "admin" ? "Admin User" : "Staff User",
      email: `${role}@demo.com`,
      role,
    };

    localStorage.setItem("user", btoa(JSON.stringify(fakeUser)));
    onLoginSuccess(fakeUser);

    setNote(`🔹 Đang chuyển sang trang ${role.toUpperCase()}...`);
    setTimeout(() => setLocation(`/${role}`), 1200);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden text-white">
      {/* Nền video */}
      <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover brightness-[0.65] saturate-[1.3] contrast-[1.2]">
        <source src="https://player.cloudinary.com/embed/?cloud_name=de4yh8lsa&public_id=ezyZip_jyxumj&profile=cld-default.mp4" type="video/mp4" />
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black/70 via-indigo-900/30 to-purple-800/20" />

      {/* === Card với Animation === */}
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/20 shadow-[0_0_40px_-10px_rgba(0,0,0,0.8)] rounded-2xl p-2 z-20 animate-fade-in-slow">
        <CardHeader className="text-center">
          {/* Animation Tiêu đề */}
          <div className="flex items-center justify-center gap-2 mb-4 animate-slide-down-1">
            <Sparkles className="h-8 w-8 text-purple-300 animate-pulse" />
            <CardTitle className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-lg">
              SEO-Boost AI
            </CardTitle>
          </div>
          {/* Animation Mô tả */}
          <CardDescription className="text-gray-300 text-sm animate-fade-in-2">
            Chào mừng trở lại 👋 <br /> Đăng nhập để tiếp tục hành trình cùng AI.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Google Login */}
          <div className="flex justify-center pt-2 animate-scale-in-3">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => alert("Google login thất bại")}
              useOneTap
              theme="filled_black"
              shape="pill"
            />
          </div>

          {/* Animation Đường kẻ */}
          <div className="relative flex items-center animate-fade-in-4">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="flex-shrink mx-3 text-gray-400 text-sm">Hoặc</span>
            <div className="flex-grow border-t border-white/20"></div>
          </div>

          {/* Animation Nút Admin/Staff */}
          <div className="flex justify-center gap-3 animate-slide-up-5">
            <Button onClick={() => handleManualLogin("admin")} className="w-24">Admin</Button>
            <Button onClick={() => handleManualLogin("staff")} className="w-24">Staff</Button>
          </div>

          {note && <p className="text-center text-sm text-gray-300 animate-fade-in mt-3">{note}</p>}
        </CardContent>

        {/* Animation Footer */}
        <CardFooter className="text-center text-xs text-gray-400 justify-center mt-2 animate-fade-in-6">
          <p>
            Bằng cách tiếp tục, bạn đồng ý với <span className="underline cursor-pointer hover:text-white">Điều khoản dịch vụ</span> và <span className="underline cursor-pointer hover:text-white">Chính sách bảo mật</span>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;