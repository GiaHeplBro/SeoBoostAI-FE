import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import api from '@/axiosInstance';
import { Link } from "wouter";
import {
  Sparkles,
  TrendingUp,
  Wallet,
  BookOpen,
  Calculator,
  Info,
  ShoppingCart,
  Gift,
  Zap,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Types
interface FeatureQuota {
  featureId: number;
  featureName: string;
  freeUsage: number;
  freeLimit: number;
  freeRemaining: number;
  paidRemaining: number;
  totalRemaining: number;
}

interface WalletData {
  walletID: number;
  userID: number;
  currency: number;
}

// Fetch functions
const fetchQuotas = async (): Promise<FeatureQuota[]> => {
  const { data } = await api.get('/user-monthly-free-quotas/quota');
  return data;
};

const fetchWallet = async (): Promise<WalletData> => {
  const { data } = await api.get('/Wallets/user');
  return data;
};

// Icon mapping cho features
const featureIcons: { [key: string]: any } = {
  "ContentOptimizations": FileText,
  "TrendSearches": TrendingUp,
  "PerformanceAnalysis": Zap,
};

// Vietnamese name mapping
const featureNames: { [key: string]: string } = {
  "ContentOptimizations": "Tối ưu nội dung",
  "TrendSearches": "Phân tích xu hướng",
  "PerformanceAnalysis": "Phân tích hiệu suất",
};

export default function Dashboard() {
  const { data: quotas, isLoading: loadingQuotas } = useQuery({
    queryKey: ['userQuotas'],
    queryFn: fetchQuotas,
  });

  const { data: wallet, isLoading: loadingWallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: fetchWallet,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Quản lý quota, ví và theo dõi hoạt động của bạn
        </p>
      </div>

      {/* Wallet Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-md">
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Số dư ví</p>
                <h2 className="text-4xl font-bold text-blue-600">
                  {loadingWallet ? (
                    <span className="text-2xl">Đang tải...</span>
                  ) : (
                    `${wallet?.currency.toLocaleString("vi-VN")} VNĐ`
                  )}
                </h2>
              </div>
            </div>
            <Link href="/pricing">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Mua thêm quota
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Feature Quotas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Quota chức năng</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Theo dõi số lần sử dụng miễn phí và đã mua
            </p>
          </div>
        </div>

        {loadingQuotas ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-24 bg-gray-100 dark:bg-gray-800 rounded-t-lg"></CardHeader>
                <CardContent className="h-40 bg-gray-50 dark:bg-gray-900"></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {quotas?.map((quota) => {
              const Icon = featureIcons[quota.featureName] || Sparkles;
              const freePercentage = (quota.freeUsage / quota.freeLimit) * 100;
              const totalPercentage = Math.min((quota.totalRemaining / (quota.freeLimit + quota.paidRemaining + quota.freeUsage)) * 100, 100);

              return (
                <Card key={quota.featureId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">
                          {featureNames[quota.featureName] || quota.featureName}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Free Quota */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Miễn phí</span>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {quota.freeRemaining}/{quota.freeLimit}
                        </Badge>
                      </div>
                      <Progress value={freePercentage} className="h-2 bg-gray-200" />
                      <p className="text-xs text-gray-500">
                        Đã dùng: {quota.freeUsage} lần
                      </p>
                    </div>

                    {/* Paid Quota */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Đã mua</span>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          {quota.paidRemaining} lần
                        </Badge>
                      </div>
                    </div>

                    {/* Total Remaining */}
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Tổng còn lại:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {quota.totalRemaining}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Gift className="h-5 w-5" />
              Quota miễn phí tháng này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">
              {quotas?.reduce((sum, q) => sum + q.freeRemaining, 0) || 0}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Còn lại trong tháng
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
              <Zap className="h-5 w-5" />
              Quota đã mua
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
              {quotas?.reduce((sum, q) => sum + q.paidRemaining, 0) || 0}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sẵn sàng sử dụng
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <Sparkles className="h-5 w-5" />
              Tổng quota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
              {quotas?.reduce((sum, q) => sum + q.totalRemaining, 0) || 0}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Tổng số lần còn lại
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Guidelines & Documentation */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Hướng dẫn sử dụng */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <CardTitle>Hướng dẫn sử dụng</CardTitle>
            </div>
            <CardDescription>
              Cách sử dụng các tính năng trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Tối ưu nội dung", desc: "Sử dụng AI để tối ưu hóa nội dung SEO của bạn" },
              { title: "Phân tích xu hướng", desc: "Tìm kiếm từ khóa và xu hướng trending" },
              { title: "Phân tích hiệu suất", desc: "Đánh giá hiệu suất website của bạn" },
            ].map((guide, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="bg-blue-50 dark:bg-blue-900 p-2 rounded-md flex-shrink-0">
                  <Info className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{guide.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{guide.desc}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              Xem tất cả hướng dẫn
            </Button>
          </CardContent>
        </Card>

        {/* Cách tính điểm */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-purple-600" />
              <CardTitle>Cách tính điểm SEO</CardTitle>
            </div>
            <CardDescription>
              Hiểu rõ cách hệ thống đánh giá website của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">90-100</span>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  Xuất sắc
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">70-89</span>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                  Tốt
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">50-69</span>
                </div>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                  Trung bình
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">0-49</span>
                </div>
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                  Cần cải thiện
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-full">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">💡 Mẹo sử dụng hiệu quả</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Sử dụng quota miễn phí trước khi dùng quota đã mua</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Quota miễn phí sẽ được reset vào đầu mỗi tháng</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Mua quota với số lượng lớn để tiết kiệm chi phí</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
