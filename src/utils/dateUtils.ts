export const formatDateTime = (dateString: string | null | undefined, timezone?: string): string => {
    if (!dateString) return '';

    try {
        // Handle input like "2025-12-07 10:23:05.260" (SQL style) by replacing space with T
        let dateToParse = dateString.replace(' ', 'T');

        // Check if timezone info is missing. 
        // If it looks like ISO without offset (e.g. ends in digits or milliseconds), assume UTC by appending Z.
        // Regex checks for NO timezone offset at the end (e.g. +07:00 or Z).
        if (!dateToParse.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(dateToParse)) {
            dateToParse += 'Z';
        }

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
            timeZone: timezone || undefined, // Use provided timezone or default to browser's
        }).format(date);
    } catch (error) {
        console.error("Error formatting date:", error);
        return dateString;
    }
};
