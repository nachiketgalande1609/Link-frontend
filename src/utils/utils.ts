import { useState, useEffect } from "react";

export function useDebounce(text: string, delay: number) {
    const [debouncedInput, setDebouncedInput] = useState<string>(text);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedInput(text);
        }, delay);

        // Cleanup function to clear timeout if text or delay changes
        return () => {
            clearTimeout(handler);
        };
    }, [text, delay]);

    return debouncedInput;
}

export const timeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just Now"; // Change here
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo`;
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}y`;
};
