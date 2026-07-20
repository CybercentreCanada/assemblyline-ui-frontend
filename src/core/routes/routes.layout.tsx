import { findPanelKey, useAppRouterStore } from 'core/router';
import type { PropsWithChildren } from 'react';
import { memo, useLayoutEffect, useRef } from 'react';

//*****************************************************************************************
// Route Layout Provider
//*****************************************************************************************

export type AppRouteLayoutProviderProps = PropsWithChildren<{
  routeKey: string;
}>;

export const AppRouteLayoutProvider = memo(({ routeKey, children }: AppRouteLayoutProviderProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastPanelKeyRef = useRef<number>(-1);

  const scrollPosition = useAppRouterStore(s => s?.routes?.[routeKey]?.scroll ?? null);
  const href = useAppRouterStore(s => s?.routes?.[routeKey]?.href);
  const panelKey = useAppRouterStore(s => findPanelKey(s, { routeKey }));

  // Handle panel transitions and restore scroll
  useLayoutEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const panelChanged = lastPanelKeyRef.current !== panelKey;

    if (panelChanged) {
      scrollContainer.style.visibility = 'hidden';
      lastPanelKeyRef.current = panelKey;
    }

    let targetScroll = 0;

    // Priority 1: Use stored scroll position if valid (not null and not 0)
    if (scrollPosition !== null && scrollPosition !== 0) {
      targetScroll = scrollPosition;
    } else {
      // Priority 2: Scroll to hash element if it exists
      const hashMatch = href?.match(/#(.+)$/) || window.location.hash.match(/#(.+)$/);
      const hash = hashMatch?.[1];
      if (hash) {
        // Escape special characters in hash for valid CSS selector (handles URLs with /, ?, etc)
        const escapedHash = CSS.escape(hash);
        const targetElement = scrollContainer.querySelector(`#${escapedHash}`);
        if (targetElement) {
          // Calculate element position relative to scroll container
          const elementRect = targetElement.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          targetScroll = elementRect.top - containerRect.top + scrollContainer.scrollTop;
        }
      }
      // Priority 3: Scroll to top (targetScroll = 0, already set)
    }

    let frameId = 0;
    let attempts = 0;

    const applyScroll = () => {
      if (!scrollContainerRef.current) return;

      scrollContainerRef.current.scrollTop = targetScroll;

      // During panel migration, layout can settle on a later frame.
      // Retry briefly until the desired offset is reachable.
      const isApplied = targetScroll === 0 || Math.abs(scrollContainerRef.current.scrollTop - targetScroll) <= 1;
      attempts += 1;

      if (isApplied || attempts >= 6) {
        scrollContainerRef.current.style.visibility = 'visible';
        return;
      }

      frameId = window.requestAnimationFrame(applyScroll);
    };

    frameId = window.requestAnimationFrame(applyScroll);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [panelKey, scrollPosition, href]);

  return (
    <div
      id={`route-layout-${routeKey}`}
      data-testid="route-layout-scroll-container"
      ref={scrollContainerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto',
        visibility: 'hidden'
      }}
    >
      {children}
    </div>
  );
});

AppRouteLayoutProvider.displayName = 'AppRouteLayoutProvider';
