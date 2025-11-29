// Helper functions for Content Optimization feature

import type { ParsedUserRequest } from '../types';

/**
 * Get color class based on score value
 */
export const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
};

/**
 * Get background color class based on score value
 */
export const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20';
    if (score >= 60) return 'bg-amber-50 dark:bg-amber-900/20';
    return 'bg-red-50 dark:bg-red-900/20';
};

/**
 * Calculate score improvement delta
 */
export const getScoreDelta = (original: number, optimized: number): number => {
    return optimized - original;
};

/**
 * Format score delta for display
 */
export const formatScoreDelta = (delta: number): string => {
    if (delta > 0) return `+${delta}`;
    return `${delta}`;
};

/**
 * Parse userRequest JSON string
 * Handles escaped unicode characters for Vietnamese text
 * Also handles cases where backend returns object instead of string
 */
export const parseUserRequest = (jsonString: string | ParsedUserRequest): ParsedUserRequest | null => {
    if (!jsonString) return null;

    // If already an object, return it directly
    if (typeof jsonString === 'object') {
        return jsonString as ParsedUserRequest;
    }

    // If not a string, return null
    if (typeof jsonString !== 'string') {
        console.error('userRequest is not a string or object:', typeof jsonString);
        return null;
    }

    try {
        // Try direct parse first
        return JSON.parse(jsonString);
    } catch (e1) {
        try {
            // Try decoding URI components for escaped unicode
            const decodedString = decodeURIComponent(jsonString);
            return JSON.parse(decodedString);
        } catch (e2) {
            console.error('Failed to parse userRequest after decode attempt:', e2);
            console.error('Original string (first 100 chars):', jsonString.substring(0, 100));
            return null;
        }
    }
};
