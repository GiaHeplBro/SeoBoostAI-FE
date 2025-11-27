// Helper functions for SEO Audit

import { METRIC_THRESHOLDS, type MetricKey } from './constants';

/**
 * Get Tailwind color class based on metric value and thresholds
 */
export const getScoreColor = (metric: MetricKey, value: number): string => {
    if (value === null || value === undefined) return 'text-gray-500';
    const thresholds = METRIC_THRESHOLDS[metric];

    if (metric === 'PerformanceScore') {
        if (value >= thresholds.good) return 'text-green-500';
        if (value >= thresholds.needsImprovement) return 'text-amber-500';
        return 'text-red-500';
    } else {
        if (value <= thresholds.good) return 'text-green-500';
        if (value <= thresholds.needsImprovement) return 'text-amber-500';
        return 'text-red-500';
    }
};

/**
 * Get unit string for a metric
 */
export const getMetricUnit = (metric: string): string => {
    switch (metric) {
        case 'CLS':
            return '';
        case 'PerformanceScore':
            return '';
        default:
            return 'ms';
    }
};

/**
 * Get Vietnamese description for a metric
 */
export const getMetricInfo = (metric: string): string => {
    switch (metric) {
        case 'LCP':
            return 'Tốc độ tải trang. Thời gian để nội dung lớn nhất (văn bản, hình ảnh) hiển thị.';
        case 'CLS':
            return 'Tính ổn định hình ảnh. Đo lường mức độ "nhảy" (dịch chuyển) của các yếu tố trên trang khi tải.';
        case 'TBT':
            return 'Khả năng tương tác. Tổng thời gian trang bị "treo" (bị chặn) không thể phản hồi người dùng.';
        case 'FCP':
            return 'Tốc độ phản hồi đầu tiên. Thời gian từ khi tải trang đến khi bất kỳ nội dung nào (văn bản, màu nền) xuất hiện.';
        case 'SI':
            return 'Tốc độ hiển thị trực quan. Đo lường mức độ nhanh chóng mà nội dung trong màn hình đầu tiên được hiển thị.';
        case 'TTI':
            return 'Thời gian sẵn sàng tương tác. Thời gian để trang tải xong, hiển thị nội dung và sẵn sàng phản hồi tương tác.';
        case 'PerformanceScore':
            return 'Điểm hiệu suất tổng thể của trang web do PageSpeed Insights đánh giá.';
        default:
            return '';
    }
};
