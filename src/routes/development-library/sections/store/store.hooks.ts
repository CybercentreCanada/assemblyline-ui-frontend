import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

/**
 * @name useRenderCount
 * @description Counts commits of the calling component and writes the count into the returned ref's element without re-rendering.
 * @returns Ref to attach to the element that displays the count
 */
export const useRenderCount = (): RefObject<HTMLSpanElement | null> => {
  const elementRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<number>(0);

  useEffect(() => {
    countRef.current += 1;
    if (elementRef.current) elementRef.current.textContent = String(countRef.current);
  });

  return elementRef;
};
