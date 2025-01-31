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
