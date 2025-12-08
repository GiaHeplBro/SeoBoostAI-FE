// Admin Dashboard View Component
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, Calendar, Key, Activity, AlertTriangle } from 'lucide-react';
import { getDashboardOverview, getRevenueChart, getGeminiKeysUsage } from '../api';
import type { DashboardOverview, RevenueChartItem, RevenueChartType, GeminiKeyUsage } from '../types';

// ==================== UI Components ====================

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    subtitle?: string;
    color?: string;
}

function StatCard({ title, value, icon, subtitle, color = 'blue' }: StatCardProps) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
        orange: 'bg-orange-50 text-orange-600 border-orange-200',
    };

    return (
        <div className={`p-6 rounded-xl border ${colorClasses[color]} transition-all hover:shadow-md`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                    {subtitle && <p className="text-xs mt-2 opacity-70">{subtitle}</p>}
                </div>
                <div className="p-3 rounded-full bg-white/50">{icon}</div>
            </div>
        </div>
    );
}

// Simple Bar Chart Component
function RevenueChart({ data, isLoading }: { data: RevenueChartItem[]; isLoading: boolean }) {
    const chartHeight = 200; // Fixed chart height in pixels

    if (isLoading) {
        return (
            <div className="flex items-center justify-center" style={{ height: chartHeight }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center text-gray-400" style={{ height: chartHeight }}>
                Không có dữ liệu
            </div>
        );
    }

    const maxRevenue = Math.max(...data.map(d => d.revenue), 1);

    return (
        <div className="pt-8">
            <div className="flex items-end justify-between gap-2" style={{ height: chartHeight }}>
                {data.map((item, index) => {
                    const barHeight = maxRevenue > 0 ? (item.revenue / maxRevenue) * chartHeight : 0;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center group relative">
                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                                {item.revenue.toLocaleString('vi-VN')} đ
                            </div>
                            {/* Bar */}
                            <div
                                className="w-full max-w-12 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all duration-300 hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                                style={{
                                    height: Math.max(barHeight, 4), // Minimum 4px so bars are always visible
                                    minWidth: '20px'
                                }}
                            />
                        </div>
                    );
                })}
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between gap-2 mt-3 border-t pt-3">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 text-center">
                        <span className="text-xs text-gray-500">
                            {item.label.split('/').slice(0, 2).join('/')}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Gemini Key Usage Card
function GeminiKeyCard({ keyData }: { keyData: GeminiKeyUsage }) {
    const getStatusColor = (percentage: number) => {
        if (percentage >= 100) return 'text-red-600 bg-red-100';
        if (percentage >= 80) return 'text-orange-600 bg-orange-100';
        return 'text-green-600 bg-green-100';
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return 'bg-red-500';
        if (percentage >= 80) return 'bg-orange-500';
        return 'bg-green-500';
    };

    return (
        <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-800 text-sm">{keyData.keyName}</span>
                </div>
                <div className="flex items-center gap-2">
                    {keyData.isRateLimited && (
                        <span className="flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="h-3 w-3" />
                            Rate Limited
                        </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${keyData.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {keyData.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Usage Stats */}
            <div className="space-y-2">
                {/* RPM */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">RPM (Requests/min)</span>
                        <span className={`font-medium ${getStatusColor(keyData.rpmPercentage).split(' ')[0]}`}>{keyData.rpmUsage}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${getProgressColor(keyData.rpmPercentage)} transition-all`} style={{ width: `${Math.min(keyData.rpmPercentage, 100)}%` }}></div>
                    </div>
                </div>

                {/* TPM */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">TPM (Tokens/min)</span>
                        <span className={`font-medium ${getStatusColor(keyData.tpmPercentage).split(' ')[0]}`}>{keyData.tpmUsage}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${getProgressColor(keyData.tpmPercentage)} transition-all`} style={{ width: `${Math.min(keyData.tpmPercentage, 100)}%` }}></div>
                    </div>
                </div>

                {/* RPD */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">RPD (Requests/day)</span>
                        <span className={`font-medium ${getStatusColor(keyData.rpdPercentage).split(' ')[0]}`}>{keyData.rpdUsage}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${getProgressColor(keyData.rpdPercentage)} transition-all`} style={{ width: `${Math.min(keyData.rpdPercentage, 100)}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==================== Main Component ====================

export function DashboardView() {
    const [chartType, setChartType] = useState<RevenueChartType>('week');

    // Fetch Dashboard Overview
    const { data: overview, isLoading: loadingOverview, isError: errorOverview } = useQuery<DashboardOverview>({
        queryKey: ['admin-dashboard-overview'],
        queryFn: getDashboardOverview,
    });

    // Fetch Revenue Chart
    const { data: chartData, isLoading: loadingChart, isError: errorChart } = useQuery<RevenueChartItem[]>({
        queryKey: ['admin-revenue-chart', chartType],
        queryFn: () => getRevenueChart(chartType),
        staleTime: 0, // Always refetch when chartType changes
        enabled: true,
    });

    // Debug: Log chart data
    console.log('Chart Type:', chartType);
    console.log('Chart Data:', chartData);
    console.log('Loading Chart:', loadingChart);
    console.log('Error Chart:', errorChart);

    // Fetch Gemini Keys Usage
    const { data: geminiKeys, isLoading: loadingKeys } = useQuery<GeminiKeyUsage[]>({
        queryKey: ['admin-gemini-keys-usage'],
        queryFn: getGeminiKeysUsage,
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
    };

    if (loadingOverview) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (errorOverview) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>Không thể tải dữ liệu dashboard</p>
                <p className="text-sm">Vui lòng thử lại sau</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p className="text-gray-500 mt-1">Tổng quan doanh thu và hệ thống</p>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Tổng doanh thu"
                    value={formatCurrency(overview?.totalRevenue || 0)}
                    icon={<DollarSign className="h-6 w-6" />}
                    color="green"
                />
                <StatCard
                    title="Doanh thu hôm nay"
                    value={formatCurrency(overview?.todayRevenue || 0)}
                    icon={<TrendingUp className="h-6 w-6" />}
                    color="blue"
                />
                <StatCard
                    title="Doanh thu tháng này"
                    value={formatCurrency(overview?.thisMonthRevenue || 0)}
                    icon={<Calendar className="h-6 w-6" />}
                    color="purple"
                />
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Biểu đồ doanh thu</h3>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                        {(['week', 'month', 'year'] as RevenueChartType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setChartType(type)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${chartType === type
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                {type === 'week' ? '7 ngày' : type === 'month' ? '30 ngày' : 'Năm'}
                            </button>
                        ))}
                    </div>
                </div>
                <RevenueChart data={chartData || []} isLoading={loadingChart} />
            </div>

            {/* Gemini Keys Usage */}
            <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Gemini API Keys Usage
                    </h3>
                    <span className="text-sm text-gray-500">{geminiKeys?.length || 0} keys</span>
                </div>

                {loadingKeys ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                ) : geminiKeys && geminiKeys.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {geminiKeys.map((key) => (
                            <GeminiKeyCard key={key.id} keyData={key} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        Không có Gemini API key nào
                    </div>
                )}
            </div>
        </div>
    );
}
