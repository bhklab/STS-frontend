import { useRef, useState, useEffect } from 'react';

/**
 * Measures the width and height of a container element using ResizeObserver.
 * Returns [containerRef, width, height] — attach the ref to a wrapper div.
 */
export function useContainerSize(): [React.RefObject<HTMLDivElement | null>, number, number] {
    const ref = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new ResizeObserver(entries => {
            const entry = entries[0];
            if (entry) {
                const { width, height } = entry.contentRect;
                setSize(prev => {
                    if (prev.width === Math.round(width) && prev.height === Math.round(height)) return prev;
                    return { width: Math.round(width), height: Math.round(height) };
                });
            }
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return [ref, size.width, size.height];
}
