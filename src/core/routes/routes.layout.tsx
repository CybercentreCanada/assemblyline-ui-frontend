import { findPanelKey, useAppRouterStore } from 'core/router';
import type { PropsWithChildren } from 'react';
import { memo, useEffect, useRef } from 'react';
import { useAppHashParams } from './routes.hooks';

//*****************************************************************************************
// Route Layout Provider
//*****************************************************************************************

export type AppRouteLayoutProviderProps = PropsWithChildren<{
  routeKey: string;
}>;

export const AppRouteLayoutProvider = memo(({ routeKey, children }: AppRouteLayoutProviderProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollPosition = useAppRouterStore(s => s?.routes?.[routeKey]?.scroll ?? null);
  const hashFragment = useAppHashParams();
  const panelKey = useAppRouterStore(s => findPanelKey(s, { routeKey }));

  useEffect(() => {
    if (!scrollContainerRef.current || !scrollPosition) return;

    let frameId = 0;
    let attempts = 0;

    const applyScroll = () => {
      if (!scrollContainerRef.current) return;

      scrollContainerRef.current.scrollTop = scrollPosition;
      const isApplied = scrollPosition === 0 || Math.abs(scrollContainerRef.current.scrollTop - scrollPosition) <= 1;
      attempts += 1;

      if (isApplied || attempts >= 6) return;
      frameId = window.requestAnimationFrame(applyScroll);
    };

    frameId = window.requestAnimationFrame(applyScroll);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelKey]);

  useEffect(() => {
    if (!scrollContainerRef.current || !hashFragment) return;

    const targetElement = scrollContainerRef.current.querySelector(`#${hashFragment}`);
    if (!targetElement) return;

    const elementRect = targetElement.getBoundingClientRect();
    const containerRect = scrollContainerRef.current.getBoundingClientRect();
    const targetScroll = elementRect.top - containerRect.top + scrollContainerRef.current.scrollTop;

    let frameId = 0;
    let attempts = 0;

    const applyScroll = () => {
      if (!scrollContainerRef.current) return;
      scrollContainerRef.current.scrollTop = targetScroll;
      const isApplied = targetScroll === 0 || Math.abs(scrollContainerRef.current.scrollTop - targetScroll) <= 1;
      attempts += 1;

      if (isApplied || attempts >= 6) return;
      frameId = window.requestAnimationFrame(applyScroll);
    };

    frameId = window.requestAnimationFrame(applyScroll);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [hashFragment]);

  return (
    <div
      id={`route-layout-${routeKey}`}
      data-testid="route-layout-scroll-container"
      ref={scrollContainerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto'
      }}
    >
      {children}
    </div>
  );
});

AppRouteLayoutProvider.displayName = 'AppRouteLayoutProvider';
