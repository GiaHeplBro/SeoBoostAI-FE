/**
 * Format a date string for display.
 * 
 * NOTE: Backend already returns dates in UTC+7 (Asia/Ho_Chi_Minh) timezone.
 * Do NOT add 'Z' suffix to date strings as that would incorrectly treat them as UTC
 * and cause the browser to convert them again, resulting in wrong times (+7 hours error).
 */
export const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return '';

    try {
        // Handle input like "2025-12-07 10:23:05.260" (SQL style) by replacing space with T
        const dateToParse = dateString.replace(' ', 'T');

        // Parse the date directly without adding 'Z' suffix
        // BE already returns UTC+7 time, so we don't need to convert
        const date = new Date(dateToParse);

        if (isNaN(date.getTime())) {
            return dateString;
        }

        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false, // 24-hour format
        }).format(date);
    } catch (error) {
        console.error("Error formatting date:", error);
        return dateString;
    }
};
