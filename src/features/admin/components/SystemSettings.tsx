// Admin System Settings Component
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { getSystemConfigs, updateSystemConfig } from '../api';
import type { SystemConfig } from '../types';

const Button = ({ variant = 'default', size = 'default', className = '', children, ...props }: any) => {
    const variants: Record<string, string> = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
    };
    const sizes: Record<string, string> = {
        default: 'px-4 py-2',
        sm: 'px-2 py-1 text-sm',
    };
    return (
        <button className={`rounded-lg font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export function SystemSettings() {
    const queryClient = useQueryClient();
    const [editedConfigs, setEditedConfigs] = useState<Record<string, string>>({});

    const { data: configs = [], isLoading, refetch } = useQuery<SystemConfig[]>({
        queryKey: ['admin-system-configs'],
        queryFn: getSystemConfigs,
    });

    const updateMutation = useMutation({
        mutationFn: ({ key, value }: { key: string; value: string }) => updateSystemConfig(key, value),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-system-configs'] });
        },
    });

    const handleSave = (key: string) => {
        if (editedConfigs[key] !== undefined) {
            updateMutation.mutate({ key, value: editedConfigs[key] });
            setEditedConfigs((prev) => {
                const newState = { ...prev };
                delete newState[key];
                return newState;
            });
        }
    };

    const handleChange = (key: string, value: string) => {
        setEditedConfigs((prev) => ({ ...prev, [key]: value }));
    };

    const getDisplayValue = (config: SystemConfig) => {
        return editedConfigs[config.settingKey] !== undefined ? editedConfigs[config.settingKey] : config.settingValue;
    };

    const isEdited = (key: string) => editedConfigs[key] !== undefined;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Cài đặt hệ thống</h2>
                    <p className="text-gray-500 mt-1">Quản lý cấu hình hệ thống</p>
                </div>
                <Button variant="outline" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Làm mới
                </Button>
            </div>

            {/* Config List */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Cài đặt</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Giá trị</th>
                            <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 w-24">Lưu</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {configs.map((config) => (
                            <tr key={config.settingKey} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-gray-900">{config.settingKey}</div>
                                            <div className="text-sm text-gray-500">{config.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="text"
                                        value={getDisplayValue(config)}
                                        onChange={(e) => handleChange(config.settingKey, e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isEdited(config.settingKey) ? 'border-blue-500 bg-blue-50' : ''}`}
                                    />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Button
                                        size="sm"
                                        variant={isEdited(config.settingKey) ? 'default' : 'outline'}
                                        onClick={() => handleSave(config.settingKey)}
                                        disabled={!isEdited(config.settingKey) || updateMutation.isPending}
                                    >
                                        <Save className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {configs.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Chưa có cài đặt nào</p>
                        <p className="text-sm">Cấu hình hệ thống sẽ hiển thị ở đây</p>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-blue-800">Lưu ý</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            Các thay đổi cài đặt sẽ được áp dụng ngay lập tức. Một số cài đặt có thể cần khởi động lại server để có hiệu lực.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
