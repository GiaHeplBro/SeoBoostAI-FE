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
 */
export const parseUserRequest = (jsonString: string): ParsedUserRequest | null => {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('Failed to parse userRequest:', e);
        return null;
    }
};
