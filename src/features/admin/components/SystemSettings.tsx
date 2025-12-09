// Admin System Settings, Feature Management & API Key Management Component
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search, ChevronDown, ChevronRight, Settings, Edit2, Save, X, Filter, Key, Plus,
    Package, DollarSign, List, Gauge, Trash2, Eye, EyeOff, Zap, Clock
} from 'lucide-react';
import { getAdminSettings, updateAdminSetting, getSettingsByFeatureId, getFeatures, getFeaturesPaginated, updateFeature, getFeatureQuotas, updateMonthlyLimit, getGeminiKeys, createGeminiKey, deleteGeminiKey } from '../api';
import type { AdminSettingsResponse, Feature, SettingsByFeatureResponse, FeaturesPaginatedResponse, UpdateFeatureRequest, FeatureQuota, GeminiKey, CreateGeminiKeyRequest } from '../types';

// ==================== UI Components ====================

const Badge = ({ variant = 'default', children }: { variant?: string; children: React.ReactNode }) => {
    const variants: Record<string, string> = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        info: 'bg-blue-100 text-blue-800',
        purple: 'bg-purple-100 text-purple-800',
        danger: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant] || variants.default}`}>{children}</span>;
};

const Button = ({ variant = 'default', size = 'default', className = '', disabled = false, children, ...props }: any) => {
    const variants: Record<string, string> = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
        success: 'bg-green-600 text-white hover:bg-green-700',
        danger: 'bg-red-600 text-white hover:bg-red-700',
    };
    const sizes: Record<string, string> = {
        default: 'px-4 py-2',
        sm: 'px-2 py-1 text-sm',
        icon: 'p-2',
    };
    return (
        <button className={`rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled} {...props}>{children}</button>
    );
};

const Dialog = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};

// ==================== Main Component ====================

type MainSection = 'settings' | 'features' | 'apikeys';
type SettingsView = 'all' | 'byFeature';

export function SystemSettings() {
    const queryClient = useQueryClient();

    // Main section toggle
    const [mainSection, setMainSection] = useState<MainSection>('settings');

    // Settings states
    const [settingsView, setSettingsView] = useState<SettingsView>('all');
    const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
    const [settingsCollapsed, setSettingsCollapsed] = useState(false);

    // Setting dialog
    const [settingDialog, setSettingDialog] = useState<{ open: boolean; key: string; value: string; featureID: number; isCreateMode: boolean }>({
        open: false, key: '', value: '', featureID: 0, isCreateMode: false
    });

    // Feature dialog
    const [featureDialog, setFeatureDialog] = useState<{ open: boolean; featureId: number; price: number; description: string }>({
        open: false, featureId: 0, price: 0, description: ''
    });

    // Limit dialog
    const [limitDialog, setLimitDialog] = useState<{ open: boolean; limit: number }>({ open: false, limit: 0 });

    // API Key states
    const [showApiKey, setShowApiKey] = useState<Set<number>>(new Set());
    const [apiKeyDialog, setApiKeyDialog] = useState<{ open: boolean; data: CreateGeminiKeyRequest }>({
        open: false,
        data: { apiKey: '', keyName: 'Gemini AI Key', isActive: true, rpmLimit: 5, tpmLimit: 250000, rpdLimit: 20 }
    });
    const [deleteKeyDialog, setDeleteKeyDialog] = useState<{ open: boolean; id: number; name: string }>({ open: false, id: 0, name: '' });

    // Queries
    const { data: allSettings, isLoading: loadingSettings } = useQuery<AdminSettingsResponse>({
        queryKey: ['admin-settings-all'],
        queryFn: getAdminSettings,
        enabled: mainSection === 'settings' && settingsView === 'all',
    });

    const { data: features = [] } = useQuery<Feature[]>({
        queryKey: ['features'],
        queryFn: getFeatures,
    });

    const { data: featureSettings, isLoading: loadingFeatureSettings } = useQuery<SettingsByFeatureResponse>({
        queryKey: ['admin-settings-feature', selectedFeatureId],
        queryFn: () => getSettingsByFeatureId(selectedFeatureId!),
        enabled: mainSection === 'settings' && settingsView === 'byFeature' && selectedFeatureId !== null,
    });

    const { data: featuresData, isLoading: loadingFeatures } = useQuery<FeaturesPaginatedResponse>({
        queryKey: ['features-paginated'],
        queryFn: () => getFeaturesPaginated(1, 10),
        enabled: mainSection === 'features',
    });

    const { data: quotasData, isLoading: loadingQuotas } = useQuery<FeatureQuota[]>({
        queryKey: ['feature-quotas'],
        queryFn: getFeatureQuotas,
        enabled: mainSection === 'features',
    });

    const { data: geminiKeys = [], isLoading: loadingKeys } = useQuery<GeminiKey[]>({
        queryKey: ['gemini-keys'],
        queryFn: getGeminiKeys,
        enabled: mainSection === 'apikeys',
    });

    // Mutations
    const updateSettingMutation = useMutation({
        mutationFn: updateAdminSetting,
        onSuccess: (data: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ['admin-settings-all'] });
            queryClient.invalidateQueries({ queryKey: ['admin-settings-feature'] });
            setSettingDialog({ open: false, key: '', value: '', featureID: 0, isCreateMode: false });
            alert(data.message || 'Thành công!');
        },
        onError: (error: any) => alert(error.response?.data?.message || 'Có lỗi xảy ra'),
    });

    const updateFeatureMutation = useMutation({
        mutationFn: (data: { featureId: number; request: UpdateFeatureRequest }) => updateFeature(data.featureId, data.request),
        onSuccess: (data: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ['features'] });
            queryClient.invalidateQueries({ queryKey: ['features-paginated'] });
            setFeatureDialog({ open: false, featureId: 0, price: 0, description: '' });
            alert(data.message || 'Cập nhật thành công!');
        },
        onError: (error: any) => alert(error.response?.data?.message || 'Có lỗi xảy ra'),
    });

    const updateLimitMutation = useMutation({
        mutationFn: updateMonthlyLimit,
        onSuccess: (data: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ['feature-quotas'] });
            setLimitDialog({ open: false, limit: 0 });
            alert(data.message || 'Cập nhật thành công!');
        },
        onError: (error: any) => alert(error.response?.data?.message || 'Có lỗi xảy ra'),
    });

    const createKeyMutation = useMutation({
        mutationFn: createGeminiKey,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gemini-keys'] });
            setApiKeyDialog({ open: false, data: { apiKey: '', keyName: 'Gemini AI Key', isActive: true, rpmLimit: 5, tpmLimit: 250000, rpdLimit: 20 } });
            alert('Tạo API Key thành công!');
        },
        onError: (error: any) => alert(error.response?.data?.message || 'Có lỗi xảy ra'),
    });

    const deleteKeyMutation = useMutation({
        mutationFn: deleteGeminiKey,
        onSuccess: (data: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ['gemini-keys'] });
            setDeleteKeyDialog({ open: false, id: 0, name: '' });
            alert(data.message || 'Xóa thành công!');
        },
        onError: (error: any) => alert(error.response?.data?.message || 'Có lỗi xảy ra'),
    });

    // Helpers
    const toggleExpand = (key: string) => {
        const newSet = new Set(expandedKeys);
        newSet.has(key) ? newSet.delete(key) : newSet.add(key);
        setExpandedKeys(newSet);
    };

    const toggleShowApiKey = (id: number) => {
        const newSet = new Set(showApiKey);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setShowApiKey(newSet);
    };

    const allSettingsEntries = allSettings?.data ? Object.entries(allSettings.data) : [];
    const filteredEntries = allSettingsEntries.filter(([key]) => key.toLowerCase().includes(searchQuery.toLowerCase()));
    const featureOptionsWithZero = [{ featureID: 0, name: 'Hệ thống chung' }, ...features];
    const formatCurrency = (v: number) => new Intl.NumberFormat('vi-VN').format(v) + ' đ';
    const formatNumber = (v: number) => new Intl.NumberFormat('vi-VN').format(v);
    const formatDate = (d: string) => new Date(d).toLocaleString('vi-VN');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Cài đặt hệ thống</h2>
                    <p className="text-gray-500 mt-1">Quản lý cấu hình, chức năng và API keys</p>
                </div>
                {/* Main Section Toggle */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setMainSection('settings')}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${mainSection === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>
                        <Settings className="h-4 w-4 inline mr-1" />Cài đặt
                    </button>
                    <button onClick={() => setMainSection('features')}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${mainSection === 'features' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>
                        <Package className="h-4 w-4 inline mr-1" />Chức năng
                    </button>
                    <button onClick={() => setMainSection('apikeys')}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${mainSection === 'apikeys' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>
                        <Key className="h-4 w-4 inline mr-1" />API Keys
                    </button>
                </div>
            </div>

            {/* ==================== SETTINGS SECTION ==================== */}
            {mainSection === 'settings' && (
                <div className="space-y-4">
                    <div className="flex gap-2 items-center">
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setSettingsView('all')} className={`px-3 py-1.5 text-sm rounded-md ${settingsView === 'all' ? 'bg-white shadow-sm' : ''}`}>Tất cả</button>
                            <button onClick={() => setSettingsView('byFeature')} className={`px-3 py-1.5 text-sm rounded-md ${settingsView === 'byFeature' ? 'bg-white shadow-sm' : ''}`}>
                                <Filter className="h-3 w-3 inline mr-1" />Theo Feature
                            </button>
                        </div>
                        <button onClick={() => setSettingsCollapsed(!settingsCollapsed)} className="text-sm text-gray-500 hover:text-gray-700">
                            {settingsCollapsed ? 'Mở rộng' : 'Thu gọn'}
                        </button>
                    </div>

                    {settingsView === 'all' && (
                        <div className="space-y-3">
                            <div className="bg-white rounded-xl border p-3">
                                <div className="flex gap-3 items-center">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Tìm kiếm..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" />
                                    </div>
                                    <Button size="sm" onClick={() => setSettingDialog({ open: true, key: '', value: '', featureID: 0, isCreateMode: true })}>
                                        <Plus className="h-4 w-4 mr-1" />Tạo mới
                                    </Button>
                                </div>
                            </div>
                            <div className={`bg-white rounded-xl border overflow-hidden ${settingsCollapsed ? 'max-h-64' : ''} overflow-y-auto`}>
                                {loadingSettings ? (
                                    <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
                                ) : (
                                    <div className="divide-y">
                                        {filteredEntries.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">Không tìm thấy</div>}
                                        {filteredEntries.map(([key, value]) => (
                                            <div key={key} className="hover:bg-gray-50">
                                                <div className="flex items-center justify-between px-4 py-2 cursor-pointer" onClick={() => toggleExpand(key)}>
                                                    <div className="flex items-center gap-2">
                                                        {expandedKeys.has(key) ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                                                        <Key className="h-4 w-4 text-blue-500" />
                                                        <span className="font-mono text-xs text-gray-800">{key}</span>
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSettingDialog({ open: true, key, value, featureID: 0, isCreateMode: false }); }}>
                                                        <Edit2 className="h-3 w-3 text-blue-600" />
                                                    </Button>
                                                </div>
                                                {expandedKeys.has(key) && <div className="px-4 pb-3 pl-10"><pre className="text-xs text-gray-600 whitespace-pre-wrap break-all bg-gray-50 p-2 rounded border">{value}</pre></div>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {settingsView === 'byFeature' && (
                        <div className="space-y-3">
                            <div className="bg-white rounded-xl border p-3">
                                <select value={selectedFeatureId ?? ''} onChange={(e) => setSelectedFeatureId(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-3 py-2 border rounded-lg text-sm">
                                    <option value="">-- Chọn Feature --</option>
                                    {features.map((f) => <option key={f.featureID} value={f.featureID}>{f.featureID}. {f.name}</option>)}
                                </select>
                            </div>
                            {selectedFeatureId !== null && (
                                <div className={`bg-white rounded-xl border overflow-hidden ${settingsCollapsed ? 'max-h-64' : ''} overflow-y-auto`}>
                                    {loadingFeatureSettings ? (
                                        <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
                                    ) : (
                                        <div className="divide-y">
                                            {(featureSettings?.data || []).length === 0 && <div className="text-center py-8 text-gray-500 text-sm">Không có</div>}
                                            {(featureSettings?.data || []).map((s) => (
                                                <div key={s.settingID} className="hover:bg-gray-50">
                                                    <div className="flex items-center justify-between px-4 py-2 cursor-pointer" onClick={() => toggleExpand(s.settingKey)}>
                                                        <div className="flex items-center gap-2">
                                                            {expandedKeys.has(s.settingKey) ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                                                            <Key className="h-4 w-4 text-purple-500" />
                                                            <span className="font-mono text-xs">{s.settingKey}</span>
                                                        </div>
                                                        <Button variant="ghost" size="icon" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSettingDialog({ open: true, key: s.settingKey, value: s.settingValue, featureID: s.featureID, isCreateMode: false }); }}>
                                                            <Edit2 className="h-3 w-3 text-blue-600" />
                                                        </Button>
                                                    </div>
                                                    {expandedKeys.has(s.settingKey) && <div className="px-4 pb-3 pl-10"><pre className="text-xs text-gray-600 whitespace-pre-wrap break-all bg-gray-50 p-2 rounded border">{s.settingValue}</pre></div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ==================== FEATURES SECTION ==================== */}
            {mainSection === 'features' && (
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Gauge className="h-5 w-5 text-blue-600" />
                                <div>
                                    <h4 className="font-semibold text-gray-800">Giới hạn sử dụng miễn phí hàng tháng</h4>
                                    <p className="text-sm text-gray-500">Số lần sử dụng miễn phí mỗi chức năng</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="success">Hiện tại: {quotasData?.[0]?.freeLimit || 0} lần/tháng</Badge>
                                <Button size="sm" onClick={() => setLimitDialog({ open: true, limit: quotasData?.[0]?.freeLimit || 0 })}>
                                    <Edit2 className="h-4 w-4 mr-1" />Thay đổi
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border overflow-hidden">
                        {loadingFeatures || loadingQuotas ? (
                            <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
                        ) : (
                            <div className="divide-y">
                                {(featuresData?.items || []).map((feature) => {
                                    const quota = quotasData?.find(q => q.featureId === feature.featureID);
                                    return (
                                        <div key={feature.featureID} className="p-4 hover:bg-gray-50">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Badge variant="info">ID: {feature.featureID}</Badge>
                                                        <h4 className="font-semibold text-gray-800">{feature.name}</h4>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                                                    <div className="flex items-center gap-4 flex-wrap">
                                                        <div className="flex items-center gap-1">
                                                            <DollarSign className="h-4 w-4 text-green-600" />
                                                            <span className="font-mono font-medium text-green-600">{formatCurrency(feature.price)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                                                            <List className="h-4 w-4" />
                                                            <span>{feature.featureInformations?.length || 0} benefits</span>
                                                        </div>
                                                        {quota && (
                                                            <div className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded text-sm">
                                                                <Gauge className="h-4 w-4 text-blue-600" />
                                                                <span className="text-blue-700">Free: {quota.freeLimit}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => setFeatureDialog({ open: true, featureId: feature.featureID, price: feature.price, description: feature.description })}>
                                                    <Edit2 className="h-4 w-4 mr-1" />Chỉnh sửa
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ==================== API KEYS SECTION ==================== */}
            {mainSection === 'apikeys' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">Tổng cộng: {geminiKeys.length} API keys</div>
                        <Button onClick={() => setApiKeyDialog({ open: true, data: { apiKey: '', keyName: 'Gemini AI Key', isActive: true, rpmLimit: 5, tpmLimit: 250000, rpdLimit: 20 } })}>
                            <Plus className="h-4 w-4 mr-2" />Thêm API Key
                        </Button>
                    </div>
                    <div className="bg-white rounded-xl border overflow-hidden">
                        {loadingKeys ? (
                            <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
                        ) : (
                            <div className="divide-y">
                                {geminiKeys.length === 0 && <div className="text-center py-12 text-gray-500">Chưa có API key nào</div>}
                                {geminiKeys.map((key) => (
                                    <div key={key.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Badge variant={key.isActive ? 'success' : 'danger'}>{key.isActive ? 'Active' : 'Inactive'}</Badge>
                                                    <h4 className="font-semibold text-gray-800">{key.keyName}</h4>
                                                    <span className="text-xs text-gray-400">ID: {key.id}</span>
                                                </div>
                                                {/* API Key with show/hide */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                                        {showApiKey.has(key.id) ? key.apiKey : key.apiKey.substring(0, 15) + '...'}
                                                    </code>
                                                    <button onClick={() => toggleShowApiKey(key.id)} className="text-gray-400 hover:text-gray-600">
                                                        {showApiKey.has(key.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                {/* Stats */}
                                                <div className="flex items-center gap-4 flex-wrap text-sm">
                                                    <div className="flex items-center gap-1 text-purple-600">
                                                        <Zap className="h-4 w-4" />
                                                        <span>RPM: {key.rpmLimit} | TPM: {formatNumber(key.tpmLimit)} | RPD: {key.rpdLimit}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-blue-600">
                                                        <span>Requests: {key.requestsUsedToday} | Tokens: {formatNumber(key.tokensUsedToday)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                                    <span><Clock className="h-3 w-3 inline mr-1" />Tạo: {formatDate(key.createdAt)}</span>
                                                    {key.rateLimitedUntil && (
                                                        <Badge variant="warning">Rate Limited until: {formatDate(key.rateLimitedUntil)}</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <Button variant="danger" size="sm" onClick={() => setDeleteKeyDialog({ open: true, id: key.id, name: key.keyName })}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ==================== DIALOGS ==================== */}

            {/* Setting Dialog */}
            <Dialog open={settingDialog.open} onClose={() => setSettingDialog({ open: false, key: '', value: '', featureID: 0, isCreateMode: false })} title={settingDialog.isCreateMode ? 'Tạo cài đặt mới' : 'Chỉnh sửa cài đặt'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                        <input type="text" value={settingDialog.key} onChange={(e) => settingDialog.isCreateMode && setSettingDialog({ ...settingDialog, key: e.target.value })}
                            readOnly={!settingDialog.isCreateMode} className={`w-full px-4 py-2 border rounded-lg font-mono text-sm ${settingDialog.isCreateMode ? '' : 'bg-gray-100'}`} placeholder="Nhập key..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Feature ID</label>
                        <select value={settingDialog.featureID} onChange={(e) => setSettingDialog({ ...settingDialog, featureID: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm">
                            {featureOptionsWithZero.map((f) => <option key={f.featureID} value={f.featureID}>{f.featureID}. {f.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                        <textarea value={settingDialog.value} onChange={(e) => setSettingDialog({ ...settingDialog, value: e.target.value })} className="w-full px-4 py-2 border rounded-lg font-mono text-sm" rows={8} placeholder="Nhập giá trị..." />
                    </div>
                    <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button variant="outline" onClick={() => setSettingDialog({ open: false, key: '', value: '', featureID: 0, isCreateMode: false })}>Hủy</Button>
                        <Button variant="success" onClick={() => updateSettingMutation.mutate({ key: settingDialog.key, value: settingDialog.value, featureID: settingDialog.featureID })}
                            disabled={updateSettingMutation.isPending || (settingDialog.isCreateMode && !settingDialog.key.trim())}>
                            <Save className="h-4 w-4 mr-2" />{updateSettingMutation.isPending ? 'Đang lưu...' : (settingDialog.isCreateMode ? 'Tạo mới' : 'Lưu')}
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Feature Dialog */}
            <Dialog open={featureDialog.open} onClose={() => setFeatureDialog({ open: false, featureId: 0, price: 0, description: '' })} title="Chỉnh sửa chức năng">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Feature ID</label>
                        <select value={featureDialog.featureId} onChange={(e) => {
                            const fId = parseInt(e.target.value);
                            const f = featuresData?.items.find(x => x.featureID === fId);
                            setFeatureDialog({ ...featureDialog, featureId: fId, price: f?.price || 0, description: f?.description || '' });
                        }} className="w-full px-3 py-2 border rounded-lg">
                            {features.map((f) => <option key={f.featureID} value={f.featureID}>{f.featureID}. {f.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input type="number" value={featureDialog.price} onChange={(e) => setFeatureDialog({ ...featureDialog, price: parseInt(e.target.value) || 0 })}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Nhập giá..." />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea value={featureDialog.description} onChange={(e) => setFeatureDialog({ ...featureDialog, description: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg" rows={4} placeholder="Nhập mô tả..." />
                    </div>
                    <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button variant="outline" onClick={() => setFeatureDialog({ open: false, featureId: 0, price: 0, description: '' })}>Hủy</Button>
                        <Button variant="success" onClick={() => updateFeatureMutation.mutate({ featureId: featureDialog.featureId, request: { price: featureDialog.price, description: featureDialog.description } })}
                            disabled={updateFeatureMutation.isPending}>
                            <Save className="h-4 w-4 mr-2" />{updateFeatureMutation.isPending ? 'Đang lưu...' : 'Xác nhận'}
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Limit Dialog */}
            <Dialog open={limitDialog.open} onClose={() => setLimitDialog({ open: false, limit: 0 })} title="Thay đổi giới hạn miễn phí">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số lần sử dụng miễn phí mỗi tháng</label>
                        <input type="number" value={limitDialog.limit} onChange={(e) => setLimitDialog({ ...limitDialog, limit: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border rounded-lg" placeholder="Nhập số lần..." min={0} />
                    </div>
                    <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button variant="outline" onClick={() => setLimitDialog({ open: false, limit: 0 })}>Hủy</Button>
                        <Button variant="success" onClick={() => updateLimitMutation.mutate(limitDialog.limit)} disabled={updateLimitMutation.isPending}>
                            <Save className="h-4 w-4 mr-2" />{updateLimitMutation.isPending ? 'Đang lưu...' : 'Xác nhận'}
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Create API Key Dialog */}
            <Dialog open={apiKeyDialog.open} onClose={() => setApiKeyDialog({ open: false, data: { apiKey: '', keyName: 'Gemini AI Key', isActive: true, rpmLimit: 5, tpmLimit: 250000, rpdLimit: 20 } })} title="Thêm API Key mới">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">API Key *</label>
                        <input type="text" value={apiKeyDialog.data.apiKey} onChange={(e) => setApiKeyDialog({ ...apiKeyDialog, data: { ...apiKeyDialog.data, apiKey: e.target.value } })}
                            className="w-full px-4 py-2 border rounded-lg font-mono text-sm" placeholder="Nhập API Key..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên Key</label>
                        <input type="text" value={apiKeyDialog.data.keyName} onChange={(e) => setApiKeyDialog({ ...apiKeyDialog, data: { ...apiKeyDialog.data, keyName: e.target.value } })}
                            className="w-full px-4 py-2 border rounded-lg" placeholder="Gemini AI Key" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="isActive" checked={apiKeyDialog.data.isActive} onChange={(e) => setApiKeyDialog({ ...apiKeyDialog, data: { ...apiKeyDialog.data, isActive: e.target.checked } })}
                            className="rounded" />
                        <label htmlFor="isActive" className="text-sm">Active</label>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">RPM Limit</label>
                            <input type="number" value={apiKeyDialog.data.rpmLimit} onChange={(e) => setApiKeyDialog({ ...apiKeyDialog, data: { ...apiKeyDialog.data, rpmLimit: parseInt(e.target.value) || 0 } })}
                                className="w-full px-3 py-2 border rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">TPM Limit</label>
                            <input type="number" value={apiKeyDialog.data.tpmLimit} onChange={(e) => setApiKeyDialog({ ...apiKeyDialog, data: { ...apiKeyDialog.data, tpmLimit: parseInt(e.target.value) || 0 } })}
                                className="w-full px-3 py-2 border rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">RPD Limit</label>
                            <input type="number" value={apiKeyDialog.data.rpdLimit} onChange={(e) => setApiKeyDialog({ ...apiKeyDialog, data: { ...apiKeyDialog.data, rpdLimit: parseInt(e.target.value) || 0 } })}
                                className="w-full px-3 py-2 border rounded-lg text-sm" />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button variant="outline" onClick={() => setApiKeyDialog({ open: false, data: { apiKey: '', keyName: 'Gemini AI Key', isActive: true, rpmLimit: 5, tpmLimit: 250000, rpdLimit: 20 } })}>Hủy</Button>
                        <Button variant="success" onClick={() => createKeyMutation.mutate(apiKeyDialog.data)} disabled={createKeyMutation.isPending || !apiKeyDialog.data.apiKey.trim()}>
                            <Save className="h-4 w-4 mr-2" />{createKeyMutation.isPending ? 'Đang tạo...' : 'Tạo API Key'}
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Delete API Key Confirmation */}
            <Dialog open={deleteKeyDialog.open} onClose={() => setDeleteKeyDialog({ open: false, id: 0, name: '' })} title="Xác nhận xóa">
                <div className="space-y-4">
                    <p className="text-gray-600">Bạn có chắc chắn muốn xóa API key <strong>"{deleteKeyDialog.name}"</strong>?</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800"><strong>Cảnh báo:</strong> Hành động này không thể hoàn tác.</p>
                    </div>
                    <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button variant="outline" onClick={() => setDeleteKeyDialog({ open: false, id: 0, name: '' })}>Hủy</Button>
                        <Button variant="danger" onClick={() => deleteKeyMutation.mutate(deleteKeyDialog.id)} disabled={deleteKeyMutation.isPending}>
                            <Trash2 className="h-4 w-4 mr-2" />{deleteKeyMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
