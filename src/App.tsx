import { useState, useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Import tất cả các trang và component bạn có
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import KeywordAnalysis from "@/pages/keyword-analysis";
import SeoAudit from "@/pages/seo-audit";
import OnPageOptimization from "@/pages/on-page-optimization";
import BacklinkAnalysis from "@/pages/backlink-analysis";
import ContentOptimization from "@/pages/content-optimization";
import PricingPage from '@/pages/PricingPage';
import LandingPage from '@/pages/LandingPage';
import Auth from '@/components/loginGoogle/Auth';
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import FeatureComparisonPage from '@/pages/FeatureComparisonPage';
import AdminPageNew from '@/pages/AdminPageNew';
import StaffPageNew from '@/pages/StaffPageNew';
import TransactionHistoryPage from '@/pages/TransactionHistoryPage';
import DepositPage from '@/pages/DepositPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import PaymentFailedPage from '@/pages/PaymentFailedPage';
import UserFeedbackPage from '@/pages/UserFeedbackPage';
import PerformanceAnalysisGuide from '@/pages/docs/PerformanceAnalysisGuide';
import ContentOptimizationGuide from '@/pages/docs/ContentOptimizationGuide';
import PaymentTermsGuide from '@/pages/docs/PaymentTermsGuide';
import TrendAnalysisGuide from '@/pages/docs/TrendAnalysisGuide';

// Định nghĩa interface UserProfile
interface UserProfile {
  fullName?: string;
  email?: string;
  picture?: string;
  role?: string; // 'Member', 'Staff', 'Admin'
}

// --- Component Layout chính của ứng dụng cho người dùng đã đăng nhập ---
function MainAppLayout({ onLogout, user }: { onLogout: () => void; user: UserProfile }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const noSidebarRoutes = ['/feature-comparison'];
  const showSidebar = !noSidebarRoutes.includes(location);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-800">
      {showSidebar && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} user={user} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto" style={{ padding: '0.22rem', backgroundColor: '#353535' }}>
          <Switch>
            {/* SỬA Ở ĐÂY: Đảm bảo chứa tất cả các route của bạn */}
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/keyword-analysis" component={KeywordAnalysis} />
            <Route path="/seo-audit" component={SeoAudit} />
            <Route path="/on-page-optimization" component={OnPageOptimization} />
            <Route path="/backlink-analysis" component={BacklinkAnalysis} />
            <Route path="/content-optimization" component={ContentOptimization} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/feature-comparison" component={FeatureComparisonPage} />
            <Route path="/transaction-history" component={TransactionHistoryPage} />
            <Route path="/deposit" component={DepositPage} />
            <Route path="/payment/success" component={PaymentSuccessPage} />
            <Route path="/payment/failed" component={PaymentFailedPage} />
            <Route path="/support" component={UserFeedbackPage} />

            <Route path="/pricing" component={PricingPage} />


            {/* Nếu người dùng đã đăng nhập mà vào trang gốc, tự động chuyển đến dashboard */}
            <Route path="/"><Redirect to="/dashboard" /></Route>
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

// --- Component App chính với logic routing mới ---
function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Wait for localStorage check
  const [, navigate] = useLocation();

  useEffect(() => {
    const encodedUser = localStorage.getItem('user');
    if (encodedUser) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(atob(encodedUser)));
        setUser(decodedUser);
      } catch (error) {
        localStorage.clear();
      }
    }
    setIsLoading(false); // Done checking
  }, []);

  // Show loading while checking localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    // Clear old cache and refetch for new user
    queryClient.invalidateQueries();
    // Logic lưu vào localStorage đã được xử lý trong Auth.tsx
    // Redirect dựa trên role
    if (loggedInUser.role === 'Admin') {
      navigate('/admin');
    } else if (loggedInUser.role === 'Staff') {
      navigate('/staff');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    // Clear all React Query cache to prevent showing old user data
    queryClient.clear();

    // ✅ FIX: CLEAR HOÀN TOÀN localStorage
    localStorage.clear(); // Xóa TẤT CẢ thay vì removeItem từng cái

    // Reset user state
    setUser(null);

    // Navigate về trang chủ
    navigate('/');

    // ✅ OPTIONAL: Force reload để clear mọi state trong memory
    // Uncomment dòng này nếu vẫn còn vấn đề
    // setTimeout(() => window.location.reload(), 100);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        {/* Admin Route - Chỉ Admin mới được vào */}
        <Route path="/admin">
          {user && user.role === 'Admin' ? (
            <AdminPageNew onLogout={handleLogout} />
          ) : user ? (
            // Có login nhưng không phải Admin -> về trang của họ
            user.role === 'Staff' ? <Redirect to="/staff" /> : <Redirect to="/dashboard" />
          ) : (
            <Redirect to="/login" />
          )}
        </Route>

        {/* Staff Route - Chỉ Staff mới được vào */}
        <Route path="/staff">
          {user && user.role === 'Staff' ? (
            <StaffPageNew onLogout={handleLogout} />
          ) : user ? (
            // Có login nhưng không phải Staff -> về trang của họ
            user.role === 'Admin' ? <Redirect to="/admin" /> : <Redirect to="/dashboard" />
          ) : (
            <Redirect to="/login" />
          )}
        </Route>

        {/* Public routes */}
        <Route path="/" component={LandingPage} />
        <Route path="/docs/performance-analysis" component={PerformanceAnalysisGuide} />
        <Route path="/docs/content-optimization" component={ContentOptimizationGuide} />
        <Route path="/docs/payment-terms" component={PaymentTermsGuide} />
        <Route path="/docs/trend-analysis" component={TrendAnalysisGuide} />
        <Route path="/login">
          {user ? (
            user.role === 'Admin' ? <Redirect to="/admin" /> :
              user.role === 'Staff' ? <Redirect to="/staff" /> :
                <Redirect to="/dashboard" />
          ) : (
            <Auth onLoginSuccess={handleLoginSuccess} />
          )}
        </Route>

        {/* Payment Result Routes - All logged-in users can access */}
        <Route path="/payment/success">
          {user ? <PaymentSuccessPage /> : <Redirect to="/login" />}
        </Route>
        <Route path="/payment/failed">
          {user ? <PaymentFailedPage /> : <Redirect to="/login" />}
        </Route>

        {/* Member routes - CHỈ MEMBER MỚI ĐƯỢC VÀO */}
        <Route>
          {user ? (
            // ✅ FIX: Kiểm tra CHÍNH XÁC role
            user.role === 'Member' ? (
              <MainAppLayout onLogout={handleLogout} user={user} />
            ) : user.role === 'Admin' ? (
              <Redirect to="/admin" />
            ) : user.role === 'Staff' ? (
              <Redirect to="/staff" />
            ) : (
              // Role không hợp lệ -> logout
              <Redirect to="/login" />
            )
          ) : (
            // Chưa đăng nhập -> về login
            <Redirect to="/login" />
          )}
        </Route>
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
