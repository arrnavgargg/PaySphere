import { useRef, useCallback } from 'react';

/**
 * Generates a UUID v4 idempotency key for each payment attempt.
 * On retry, the SAME key is reused to prevent double charges.
 * Call reset() to generate a fresh key for a new payment.
 */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useIdempotency() {
  const keyRef = useRef(uuid());

  const getKey = useCallback(() => keyRef.current, []);

  const reset = useCallback(() => {
    keyRef.current = uuid();
    return keyRef.current;
  }, []);

  return { getKey, reset };
}
