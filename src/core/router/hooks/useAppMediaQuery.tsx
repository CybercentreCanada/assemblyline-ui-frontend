import type { Theme } from '@mui/material';
import { useTheme } from '@mui/material';
import { debounce } from '@tanstack/react-pacer';
import { evaluateMediaQuery, parseMediaQuery, useAppPageKey } from 'core/router';
import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * @name useAppMediaQuery
 * @description Media query hook scoped to the AppRouteLayoutProvider's width instead of the browser window.
 * Uses theme.breakpoints and ResizeObserver to evaluate queries against the container's width.
 * Optimized with query parsing memoization and debounced resize evaluation using TanStack Pacer.
 * @param query - Media query string (e.g., "(min-width:600px)") or function that receives theme (e.g., theme => theme.breakpoints.up('sm'))
 * @returns Boolean indicating if the media query currently matches the container's width
 */
export function useAppMediaQuery(query: string | ((theme: Theme) => string)): boolean {
  const theme = useTheme();
  const pageKey = useAppPageKey();
  const [matches, setMatches] = useState<boolean>(false);

  const queryStr = typeof query === 'function' ? query(theme) : query;

  const conditions = useMemo(() => parseMediaQuery(queryStr), [queryStr]);

  const debouncedSetMatches = useMemo(
    () => debounce((nextMatches: boolean) => setMatches(nextMatches), { wait: 100 }),
    []
  );

  const evaluateAndUpdate = useCallback(
    (scrollContainer: HTMLElement) => {
      const width = scrollContainer.clientWidth;
      const nextMatches = evaluateMediaQuery(conditions, width);
      debouncedSetMatches(nextMatches);
    },
    [conditions, debouncedSetMatches]
  );

  useEffect(() => {
    if (!pageKey) {
      setMatches(false);
      return;
    }

    const scrollContainer = document.getElementById(`page-layout-${pageKey}`);
    if (!scrollContainer) {
      setMatches(false);
      return;
    }

    evaluateAndUpdate(scrollContainer);

    const resizeObserver = new ResizeObserver(() => {
      evaluateAndUpdate(scrollContainer);
    });
    resizeObserver.observe(scrollContainer);

    return () => {
      resizeObserver.disconnect();
      (debouncedSetMatches as { cancel?: () => void })?.cancel?.();
    };
  }, [queryStr, pageKey, evaluateAndUpdate, debouncedSetMatches]);

  return matches;
}
