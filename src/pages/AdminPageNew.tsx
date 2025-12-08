// Admin Page - Simplified version using features
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    MessageSquare,
    Settings,
    LogOut,
    Shield,
} from 'lucide-react';

// Import components from features
import { DashboardView } from '@/features/admin/components/DashboardView';
import { UserManagement } from '@/features/admin/components/UserManagement';
import { TransactionManagement } from '@/features/admin/components/TransactionManagement';
import { FeedbackManagement } from '@/features/admin/components/FeedbackManagement';
import { SystemSettings } from '@/features/admin/components/SystemSettings';

const queryClient = new QueryClient();

type TabType = 'dashboard' | 'users' | 'transactions' | 'feedbacks' | 'settings';

interface NavItem {
    id: TabType;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'users', label: 'Người dùng', icon: <Users className="h-5 w-5" /> },
    { id: 'transactions', label: 'Giao dịch', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'feedbacks', label: 'Feedback', icon: <MessageSquare className="h-5 w-5" /> },
    { id: 'settings', label: 'Cài đặt', icon: <Settings className="h-5 w-5" /> },
];

function AdminPage({ onLogout }: { onLogout: () => void }) {
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardView />;
            case 'users':
                return <UserManagement />;
            case 'transactions':
                return <TransactionManagement />;
            case 'feedbacks':
                return <FeedbackManagement />;
            case 'settings':
                return <SystemSettings />;
            default:
                return <DashboardView />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">Admin Panel</h1>
                            <p className="text-xs text-slate-400">Quản lý hệ thống</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === item.id
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-slate-300 hover:bg-slate-700/50'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-slate-700">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

// Wrapper with QueryClientProvider
export default function AdminPageWrapper({ onLogout }: { onLogout: () => void }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AdminPage onLogout={onLogout} />
        </QueryClientProvider>
    );
}