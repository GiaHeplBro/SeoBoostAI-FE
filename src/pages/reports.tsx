import React, { useState } from "react";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
// ⛔️ Đã xóa: import { format } from "date-fns";

// =====================================================
// 🧩 STUB COMPONENTS (Để fix lỗi imports)
// (ĐÃ SẮP XẾP LẠI THEO ĐÚNG THỨ TỰ DEPENDENCY)
// =====================================================

// Stub for @tanstack/react-query
const queryClient = new QueryClient();

// Stub for lucide-react icons
const LucideStub = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <svg
    className={`h-4 w-4 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
);
const FileDown = LucideStub;
const Calendar = LucideStub;

// Stub for @/components/ui/card
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border bg-white text-gray-900 shadow ${className}`}>{children}</div>
);
const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);
const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

// Stub for @/components/ui/button
const Button = ({
  variant,
  size,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "ghost" | "destructive" | "outline" | "default";
  size?: "sm" | "icon" | "default";
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-colors";
  const sizeStyle = size === "sm" ? "h-9 px-3" : "h-10 px-4 py-2";
  let variantStyle = "bg-blue-600 text-white hover:bg-blue-700";
  if (variant === "outline") variantStyle = "border border-gray-300 hover:bg-gray-100";
  return (
    <button className={`${baseStyle} ${sizeStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};

// Stub for @/components/ui/select (Sử dụng <select> gốc)
const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => <option value={value}>{children}</option>;
const Select = ({ value, onValueChange, children, className }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode; className?: string }) => {
  const content = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === SelectContent
  );
  return (
    <select
      className={`h-9 border border-gray-300 rounded px-2 text-sm ${className}`}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {content ? (content as React.ReactElement).props.children : null}
    </select>
  );
};
const SelectTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>;
const SelectValue = ({ placeholder }: { placeholder: string }) => <option value="">{placeholder}</option>;


// ⛔️ SỬA LỖI: Định nghĩa TabsContent, TabsTrigger, và TabsList TRƯỚC Tabs
const TabsTrigger = ({ value, children, className, activeTab, setActiveTab }: { value: string; children: React.ReactNode; className?: string; activeTab?: string; setActiveTab?: (value: string) => void; }) => (
  <button
    className={`py-2 px-4 ${activeTab === value ? 'border-b-2 border-blue-600 font-medium' : ''} ${className}`}
    onClick={() => setActiveTab?.(value)}
  >
    {children}
  </button>
);
const TabsList = ({ children, className, activeTab, setActiveTab }: { children: React.ReactNode; className?: string; activeTab?: string; setActiveTab?: (value: string) => void; }) => (
  <div className={`flex border-b ${className}`}>
    {React.Children.map(children, child =>
      React.cloneElement(child as React.ReactElement, { activeTab, setActiveTab })
    )}
  </div>
);

// ⛔️ SỬA LỖI: Stub 'Tabs' đơn giản hơn, dùng CSS để ẩn/hiện
const TabsContent = ({ children, value, activeTab }: { children: React.ReactNode; value: string; activeTab?: string; }) => {
  const isSelected = value === activeTab;
  return (
    <div style={{ display: isSelected ? 'block' : 'none' }}>
      {children}
    </div>
  );
};

// Stub for @/components/ui/tabs
const Tabs = ({ defaultValue, className, children }: { defaultValue: string; className?: string; children: React.ReactNode[] }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  // Thêm props 'activeTab' và 'setActiveTab' vào các con
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { activeTab, setActiveTab } as any);
    }
    return child;
  });

  return (
    <div className={className}>
      {childrenWithProps}
    </div>
  );
};


// ⛔️ SỬA LỖI: Stubs của 'recharts' đã được làm đơn giản
const ResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full h-full">{children}</div>
);

// Stub đơn giản cho BarChart
const BarChart = (props: any) => {
  return (
    <div className="h-full w-full bg-gray-50 border rounded-lg flex items-center justify-center text-gray-500 text-sm">
      Biểu đồ cột (Giả lập)
      {/* Chúng ta render 'children' để React không báo lỗi,
          mặc dù chúng ta không thực sự dùng chúng
      */}
      <div style={{ display: 'none' }}>{props.children}</div>
    </div>
  );
};

// Stub đơn giản cho PieChart
const PieChart = (props: any) => {
  return (
    <div className="h-full w-full bg-gray-50 border rounded-lg flex items-center justify-center text-gray-500 text-sm">
      Biểu đồ tròn (Giả lập)
      <div style={{ display: 'none' }}>{props.children}</div>
    </div>
  );
};

// Các component con của biểu đồ giờ chỉ trả về null
const Bar = (props: any) => null;
const Pie = (props: any) => null;
const Cell = (props: any) => null;
const XAxis = (props: any) => null;
const YAxis = (props: any) => null;
const CartesianGrid = (props: any) => null;
const Tooltip = (props: any) => null;
const Legend = (props: any) => null;


const COLORS = ['#3f51b5', '#2196f3', '#ff4081', '#4caf50', '#ff9800'];
// =====================================================
// 🧩 HẾT STUB COMPONENTS
// =====================================================


// 🌟 Mock API Function 🌟
const mockReportApi = async ({ queryKey }: { queryKey: any[] }) => {
  const { type, timeRange } = queryKey[1] as { type: string, timeRange: string };
  await new Promise(r => setTimeout(r, 500)); // Giả lập loading

  if (type === "client-activity") {
    return { 
      data: [
        { name: 'Tuần 1', value: 120 }, 
        { name: 'Tuần 2', value: 190 }, 
        { name: 'Tuần 3', value: 150 },
        { name: 'Tuần 4', value: 210 },
      ], 
      metadata: {} 
    };
  }
  if (type === "task-completion") {
    return { 
      data: [
        { name: 'Task A', value: 50 }, 
        { name: 'Task B', value: 80 },
        { name: 'Task C', value: 30 },
      ], 
      metadata: { completionRate: 88 } 
    };
  }
  if (type === "client-distribution") {
    return { 
      data: [
        { name: 'Công nghệ', value: 40 }, 
        { name: 'Tài chính', value: 25 }, 
        { name: 'Y tế', value: 35 }
      ], 
      metadata: {} 
    };
  }
  if (type === "compliance-score") {
    return { 
      data: [
        { name: 'Khu vực 1', value: 95 }, 
        { name: 'Khu vực 2', value: 70 }, 
        { name: 'Khu vực 3', value: 85 }
      ], 
      metadata: {} 
    };
  }
  return { data: [], metadata: {} };
};


function Reports() {
  const [reportType, setReportType] = useState("client-activity");
  const [timeRange, setTimeRange] = useState("last30");

  // Fetch report data based on selected type and time range
  const { data, isLoading } = useQuery({
    queryKey: ['/api/reports', { type: reportType, timeRange }],
    queryFn: mockReportApi, // 🌟 Sử dụng mock API
  });

  const reportData = data?.data || [];
  
  const exportReport = async () => {
    try {
      // Giả lập export
      console.log("Exporting report:", reportType, timeRange);
      const csvContent = "data:text/csv;charset=utf-8,col1,col2\nval1,val2";
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-neutral-200 p-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium text-neutral-500">Báo cáo (Reports)</CardTitle>
            <div className="flex items-center">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[180px] mr-2 h-9">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client-activity">Client Activity</SelectItem>
                  <SelectItem value="task-completion">Task Completion</SelectItem>
                  <SelectItem value="client-distribution">Client Distribution</SelectItem>
                  <SelectItem value="compliance-score">Compliance Score</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px] mr-2 h-9">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7">Last 7 Days</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last90">Last 90 Days</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                className="text-primary border-primary"
                onClick={exportReport}
              >
                <FileDown className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="chart">Biểu đồ</TabsTrigger>
              <TabsTrigger value="summary">Tóm tắt</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="w-full">
              {isLoading ? (
                <div className="flex justify-center items-center h-80">
                  <p>Đang tải dữ liệu biểu đồ...</p>
                </div>
              ) : (
                <>
                  {/* Different chart types based on report type */}
                  {(reportType === "client-activity" || reportType === "task-completion") && (
                    <div className="w-full h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={reportData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#3f51b5" name={reportType === "client-activity" ? "Hoạt động" : "Nhiệm vụ"} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {reportType === "client-distribution" && (
                    <div className="w-full h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart data={reportData}>
                          <Pie
                            data={reportData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }: { name: string, percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {reportData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {reportType === "compliance-score" && (
                    <div className="w-full h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={reportData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#4caf50" name="Compliance Score %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="summary" className="w-full">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tóm tắt báo cáo</h3>

                {isLoading ? (
                  <p>Đang tải dữ liệu tóm tắt...</p>
                ) : (
                  <>
                    {reportType === "client-activity" && (
                      <div>
                        <p className="text-sm text-neutral-500 mb-2">
                          Tổng hoạt động trong kỳ: {reportData.reduce((sum: number, item: any) => sum + item.value, 0)}
                        </p>
                        <p className="text-sm text-neutral-500 mb-2">
                          Ngày hoạt động nhiều nhất: {
                            reportData.length > 0
                              ? reportData.reduce((max: any, item: any) => (item.value > max.value ? item : max), reportData[0]).name
                              : 'N/A'
                          }
                        </p>
                        <p className="text-sm text-neutral-500">
                          Hoạt động trung bình mỗi ngày: {
                            reportData.length > 0
                              ? (reportData.reduce((sum: number, item: any) => sum + item.value, 0) / reportData.length).toFixed(2)
                              : '0'
                          }
                        </p>
                      </div>
                    )}

                    {reportType === "task-completion" && (
                      <div>
                        <p className="text-sm text-neutral-500 mb-2">
                          Tổng nhiệm vụ đã hoàn thành: {reportData.reduce((sum: number, item: any) => sum + item.value, 0)}
                        </p>
                        <p className="text-sm text-neutral-500 mb-2">
                          Ngày năng suất nhất: {
                            reportData.length > 0
                              ? reportData.reduce((max: any, item: any) => (item.value > max.value ? item : max), reportData[0]).name
                              : 'N/A'
                          }
                        </p>
                        <p className="text-sm text-neutral-500">
                          Tỷ lệ hoàn thành trung bình: {
                            data?.metadata?.completionRate
                              ? `${data.metadata.completionRate}%`
                              : 'N/A'
                          }
                        </p>
                      </div>
                    )}

                    {reportType === "client-distribution" && (
                      <div>
                        <p className="text-sm text-neutral-500 mb-2">
                          Tổng số khách hàng: {reportData.reduce((sum: number, item: any) => sum + item.value, 0)}
                        </p>
                        <p className="text-sm text-neutral-500 mb-2">
                          Ngành phổ biến nhất: {
                            reportData.length > 0
                              ? reportData.reduce((max: any, item: any) => (item.value > max.value ? item : max), reportData[0]).name
                              : 'N/A'
                          }
                        </p>
                        <p className="text-sm text-neutral-500">
                          Số lượng ngành: {reportData.length} ngành
                        </p>
                      </div>
                    )}

                    {reportType === "compliance-score" && (
                      <div>
                        <p className="text-sm text-neutral-500 mb-2">
                          Điểm tuân thủ trung bình: {
                            reportData.length > 0
                              ? `${(reportData.reduce((sum: number, item: any) => sum + item.value, 0) / reportData.length).toFixed(2)}%`
                              : '0%'
                          }
                        </p>
                        <p className="text-sm text-neutral-500 mb-2">
                          Khu vực tuân thủ thấp nhất: {
                            reportData.length > 0
                              ? reportData.reduce((min: any, item: any) => (item.value < min.value ? item : min), reportData[0]).name
                              : 'N/A'
                          }
                        </p>
                        <p className="text-sm text-neutral-500">
                          Khu vực cần chú ý: {
                            reportData.filter((item: any) => item.value < 80).length
                          }
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// ✅ ĐÂY LÀ EXPORT DEFAULT DUY NHẤT: Bọc component trong QueryClientProvider
export default function ReportsWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <Reports />
    </QueryClientProvider>
  );
}