import { useEffect, useState } from 'react';

export const useDebounce = (value: string, handler: () => void) => {
    const [debouncedValue, setDebouncedValue] = useState('');

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (value !== debouncedValue) {
                setDebouncedValue(value);
                handler();
            }
        }, 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, [value]);
};
