import { useQuery } from '@tanstack/react-query';
import { Wallet, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { fetchWallet } from '../api';

export function WalletBalance() {
    const [, navigate] = useLocation();

    // Fetch wallet data
    const { data: wallet, isLoading } = useQuery({
        queryKey: ['wallet'],
        queryFn: fetchWallet,
        refetchInterval: 30000, // Refresh every 30s
    });

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
        );
    }

    // Format currency with thousand separators
    const formattedBalance = wallet?.currency.toLocaleString('vi-VN');

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Wallet className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">₫{formattedBalance || '0'}</span>
            <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => navigate('/deposit')}
                title="Nạp tiền vào ví"
            >
                <Plus className="h-4 w-4 text-blue-600" />
            </Button>
        </div>
    );
}
