import { useState, useEffect } from "react";

// ---------------------------------------------------------------------------
// useDebounce
// ---------------------------------------------------------------------------

interface UseDebounceParams<T> {
  /** The value to debounce. */
  value: T;
  /** Delay in milliseconds before the value updates. */
  delay: number;
}

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * of inactivity. Useful for search inputs that update URL params.
 */
export const useDebounce = <T>({
  value,
  delay,
}: UseDebounceParams<T>): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};
