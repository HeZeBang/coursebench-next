import { useRef, useEffect, useCallback } from "react";

/**
 * Returns a debounced version of the callback.
 */
export function useDebounce<T extends (...args: unknown[]) => void>(
  callback: T,
  delay = 200,
): T {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const debouncedFn = useCallback(
    (...args: unknown[]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay],
  ) as T;

  return debouncedFn;
}
