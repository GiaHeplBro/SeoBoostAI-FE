// Staff Page - Simplified version using features
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    LogOut,
    UserCog,
    Receipt,
} from 'lucide-react';

// Import components from features
import { DashboardView } from '@/features/staff/components/DashboardView';
import { FeedbackView } from '@/features/staff/components/FeedbackView';
import { UserManagement } from '@/features/staff/components/UserManagement';
import { TransactionManagement } from '@/features/staff/components/TransactionManagement';

const queryClient = new QueryClient();

type TabType = 'dashboard' | 'feedbacks' | 'members' | 'transactions';

interface NavItem {
    id: TabType;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'feedbacks', label: 'Feedback', icon: <MessageSquare className="h-5 w-5" /> },
    { id: 'members', label: 'Người dùng', icon: <Users className="h-5 w-5" /> },
    { id: 'transactions', label: 'Giao dịch', icon: <Receipt className="h-5 w-5" /> },
];

function StaffPage({ onLogout }: { onLogout: () => void }) {
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardView />;
            case 'feedbacks':
                return <FeedbackView />;
            case 'members':
                return <UserManagement />;
            case 'transactions':
                return <TransactionManagement />;
            default:
                return <DashboardView />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-indigo-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg">
                            <UserCog className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">Staff Panel</h1>
                            <p className="text-xs text-indigo-300">Hỗ trợ khách hàng</p>
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
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'text-indigo-200 hover:bg-indigo-700/50'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-indigo-700">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-200 hover:bg-red-500/20 hover:text-red-400 transition-all"
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
export default function StaffPageWrapper({ onLogout }: { onLogout: () => void }) {
    return (
        <QueryClientProvider client={queryClient}>
            <StaffPage onLogout={onLogout} />
        </QueryClientProvider>
    );
}