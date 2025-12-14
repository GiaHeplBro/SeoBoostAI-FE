import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft, Minus, Plus, ShoppingCart, X, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/axiosInstance";

// Interface cho dữ liệu từ API
interface FeatureFromAPI {
  featureID: number;
  name: string;
  price: number;
  description: string;
  benefits: string[];
}

// Interface cho pricing tier được chuyển đổi từ API
interface PricingTier {
  id: number;
  name: string;
  price: number;
  priceText: string;
  description: string;
  features: string[];
  isPopular: boolean;
}

// Map tên feature từ API sang tên hiển thị tiếng Việt
const featureNameMap: { [key: string]: string } = {
  "ContentOptimizations": "Tối ưu hóa nội dung",
  "TrendSearches": "Phân tích xu hướng",
  "PerformanceAnalysis": "Tối ưu hóa Website",
};

// Chuyển đổi dữ liệu từ API sang format của UI
const transformAPIToTier = (feature: FeatureFromAPI): PricingTier => {
  return {
    id: feature.featureID,
    name: featureNameMap[feature.name] || feature.name,
    price: feature.price,
    priceText: `${feature.price.toLocaleString("vi-VN")} VNĐ`,
    description: feature.description,
    features: feature.benefits,
    // Đánh dấu "Phân tích xu hướng" là phổ biến nhất
    isPopular: feature.name === "TrendSearches",
  };
};

// Dialog components (simple version)
const Dialog = ({ open, onClose, children }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const DialogHeader = ({ children }: any) => <div className="p-6 pb-4">{children}</div>;
const DialogTitle = ({ children }: any) => <h2 className="text-xl font-semibold">{children}</h2>;
const DialogContent = ({ children }: any) => <div className="px-6 pb-4">{children}</div>;
const DialogFooter = ({ children }: any) => <div className="px-6 pb-6 flex justify-end gap-2">{children}</div>;

import { useToast } from "@/hooks/use-toast";

export default function PricingPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch features từ API
  const { data: featuresData, isLoading, isError, error } = useQuery<FeatureFromAPI[]>({
    queryKey: ["features"],
    queryFn: async () => {
      const response = await api.get("/features");
      return response.data;
    },
  });

  // Chuyển đổi dữ liệu từ API sang format UI
  const pricingTiers: PricingTier[] = featuresData
    ? featuresData.map(transformAPIToTier)
    : [];

  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  // Khởi tạo quantities khi có dữ liệu từ API
  useEffect(() => {
    if (pricingTiers.length > 0) {
      const initialQuantities: { [key: number]: number } = {};
      pricingTiers.forEach((tier) => {
        initialQuantities[tier.id] = 1;
      });
      setQuantities((prev) => {
        // Chỉ set nếu chưa có
        if (Object.keys(prev).length === 0) {
          return initialQuantities;
        }
        return prev;
      });
    }
  }, [featuresData]);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    featureId: number | null;
    quantity: number;
    totalPrice: number;
    featureName: string;
  }>({
    open: false,
    featureId: null,
    quantity: 0,
    totalPrice: 0,
    featureName: "",
  });

  // Mutation để mua quota
  const buyQuotaMutation = useMutation({
    mutationFn: async (data: { featureId: number; quantity: number }) => {
      const response = await api.post("/payment/buy-quota", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Mua thành công!",
        description: data.message || "Số lượt sử dụng đã được cộng vào tài khoản.",
        className: "bg-green-50 border-green-200"
      });
      setConfirmDialog({ open: false, featureId: null, quantity: 0, totalPrice: 0, featureName: "" });
      // Invalidate wallet query để cập nhật số dư
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      // Invalidate userProfile để cập nhật số dư ví trên header
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: any) => {
      toast({
        title: "Mua thất bại",
        description: error.response?.data?.message || "Số dư không đủ hoặc lỗi hệ thống.",
        variant: "destructive"
      });
    },
  });

  const handleQuantityChange = (featureId: number, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      // BR-45: Giới hạn số lượng mua tối đa là 10
      [featureId]: Math.min(10, Math.max(1, (prev[featureId] || 1) + delta)),
    }));
  };

  const handleBuyClick = (tier: PricingTier) => {
    const quantity = quantities[tier.id] || 1;
    const totalPrice = tier.price * quantity;
    setConfirmDialog({
      open: true,
      featureId: tier.id,
      quantity,
      totalPrice,
      featureName: tier.name,
    });
  };

  const handleConfirmPurchase = () => {
    if (confirmDialog.featureId) {
      buyQuotaMutation.mutate({
        featureId: confirmDialog.featureId,
        quantity: confirmDialog.quantity,
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Đang tải danh sách gói...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto py-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Không thể tải danh sách gói</h2>
          <p className="text-muted-foreground mb-4">
            {(error as any)?.message || "Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại."}
          </p>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Về Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'whitesmoke' }}>Gói tốt nhất cho bạn</h1>
        <p className="mt-4 text-lg text-muted-foreground" style={{ color: 'whitesmoke' }}>
          Chọn gói phù hợp với nhu cầu của bạn và bắt đầu cải thiện SEO ngay hôm nay.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingTiers.map((tier: PricingTier) => (
          <Card key={tier.id} className={`flex flex-col ${tier.isPopular ? 'border-primary shadow-lg' : ''}`}>
            {tier.isPopular && (
              <div className="py-1 px-3 bg-primary text-primary-foreground text-sm font-semibold rounded-t-lg text-center">
                Phổ biến nhất
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">{tier.priceText}</span>
                <span className="text-muted-foreground">/ lần sử dụng</span>
              </div>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {tier.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              {/* Quantity Selector */}
              <div className="w-full flex items-center justify-center gap-3 bg-gray-50 p-3 rounded-lg">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuantityChange(tier.id, -1)}
                  disabled={quantities[tier.id] <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex flex-col items-center min-w-[80px]">
                  <span className="text-2xl font-bold">{quantities[tier.id] || 1}</span>
                  <span className="text-xs text-muted-foreground">Số lượng</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuantityChange(tier.id, 1)}
                  disabled={(quantities[tier.id] || 1) >= 10}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Total Price */}
              <div className="w-full text-center py-2 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Tổng tiền</p>
                <p className="text-xl font-bold text-blue-600">
                  {(tier.price * (quantities[tier.id] || 1)).toLocaleString("vi-VN")} VNĐ
                </p>
              </div>

              {/* Buy Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleBuyClick(tier)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Mua ngay
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Confirm Purchase Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Xác nhận mua gói</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gói:</span>
                <span className="font-semibold">{confirmDialog.featureName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số lượng:</span>
                <span className="font-semibold">{confirmDialog.quantity} lần</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Tổng thanh toán:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {confirmDialog.totalPrice.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Số tiền sẽ được trừ từ ví của bạn
            </p>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            disabled={buyQuotaMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmPurchase}
            disabled={buyQuotaMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {buyQuotaMutation.isPending ? "Đang xử lý..." : "Xác nhận mua"}
          </Button>
        </DialogFooter>
      </Dialog>

      <div className="text-center mt-12">
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Về Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}