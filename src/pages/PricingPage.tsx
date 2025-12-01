import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/axiosInstance";

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

// Dữ liệu cho các gói pricing
const pricingTiers = [
  {
    id: 1,
    name: "Tối ưu hóa nội dung", // Đổi tên để hợp với chức năng viết/sửa văn bản
    price: 50000,
    priceText: "50.000 VNĐ",
    description: "Tối ưu hóa nội dung và văn phong với AI",
    features: [
      "Chấm điểm chất lượng văn bản",
      "AI đề xuất & cải thiện văn phong",
      "Tạo bài viết tự động từ Keyword",
      "So sánh hiệu quả 2 văn bản (A/B)",
    ],
    isPopular: false,
  },
  {
    id: 2,
    name: "Phân tích xu hướng", // Đổi tên để hợp với chức năng từ khóa
    price: 130000,
    priceText: "130.000 VNĐ",
    description: "Giải pháp nghiên cứu từ khóa dữ liệu thực",
    features: [
      "Nghiên cứu từ khóa chuyên sâu",
      "AI gợi ý Keyword từ dữ liệu thực (Real-time)",
      "Phân tích độ khó & lượng tìm kiếm",
      "Lập kế hoạch từ khóa SEO",
      "Theo dõi xu hướng tìm kiếm thị trường",
    ],
    isPopular: true,
  },
  {
    id: 3,
    name: "Tối ưu hóa Website", // Đổi tên để hợp với chức năng kỹ thuật/tốc độ
    price: 60000,
    priceText: "60.000 VNĐ",
    description: "Phân tích kỹ thuật và sức khỏe Website",
    features: [
      "Phân tích URL (Desktop & Mobile)",
      "Đo lường tốc độ tải trang (PageSpeed)",
      "Kiểm tra thẻ Meta, H1-H6, Alt ảnh",
      "Chấm điểm sức khỏe Website (Health Score)",
      "AI đề xuất giải pháp tối ưu code",
    ],
    isPopular: false,
  },
];

export default function PricingPage() {
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({
    1: 1,
    2: 1,
    3: 1,
  });
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
      alert(data.message || "Mua gói thành công! Số lượt đã được cộng thêm.");
      setConfirmDialog({ open: false, featureId: null, quantity: 0, totalPrice: 0, featureName: "" });
      // Invalidate wallet query để cập nhật số dư
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Mua gói thất bại. Vui lòng thử lại.");
    },
  });

  const handleQuantityChange = (featureId: number, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [featureId]: Math.max(1, (prev[featureId] || 1) + delta),
    }));
  };

  const handleBuyClick = (tier: typeof pricingTiers[0]) => {
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

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'whitesmoke' }}>Gói tốt nhất cho bạn</h1>
        <p className="mt-4 text-lg text-muted-foreground" style={{ color: 'whitesmoke' }}>
          Chọn gói phù hợp với nhu cầu của bạn và bắt đầu cải thiện SEO ngay hôm nay.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingTiers.map((tier) => (
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
                {tier.features.map((feature, index) => (
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