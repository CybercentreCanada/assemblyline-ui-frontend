import { findPanelKey, useAppHashParams, useAppRouterStore } from 'core/router';
import type { PropsWithChildren } from 'react';
import { memo, useEffect } from 'react';

export type AppRouteLayoutProps = PropsWithChildren<{
  pageKey: string;
}>;

export const AppRouteLayout = memo(({ pageKey, children }: AppRouteLayoutProps) => {
  const scrollPosition = useAppRouterStore(s => s?.pages?.[pageKey]?.scroll ?? 0);
  const hashFragment = useAppHashParams();
  const panelKey = useAppRouterStore(s => findPanelKey(s, { pageKey }));

  useEffect(() => {
    const scrollContainer =
      panelKey === 0
        ? document.getElementById('app-scrollct')
        : panelKey === 1
          ? document.getElementById('drawer-scrollct')
          : null;

    if (!scrollContainer || scrollPosition == null) return;

    let frameId = 0;
    let attempts = 0;

    const applyScroll = () => {
      if (!scrollContainer) return;

      scrollContainer.scrollTop = scrollPosition;
      const isApplied = Math.abs(scrollContainer.scrollTop - scrollPosition) <= 1;
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
    const scrollContainer =
      panelKey === 0
        ? document.getElementById('app-scrollct')
        : panelKey === 1
          ? document.getElementById('drawer-scrollct')
          : null;

    if (!scrollContainer || !hashFragment) return;

    const targetElement = scrollContainer.querySelector(`#${hashFragment}`);
    if (!targetElement) return;

    const elementRect = targetElement.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const targetScroll = elementRect.top - containerRect.top + scrollContainer.scrollTop;

    let frameId = 0;
    let attempts = 0;

    const applyScroll = () => {
      if (!scrollContainer) return;
      scrollContainer.scrollTop = targetScroll;
      const isApplied = Math.abs(scrollContainer.scrollTop - targetScroll) <= 1;
      attempts += 1;

      if (isApplied || attempts >= 6) return;
      frameId = window.requestAnimationFrame(applyScroll);
    };

    frameId = window.requestAnimationFrame(applyScroll);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [hashFragment, panelKey]);

  return <>{children}</>;
});

AppRouteLayout.displayName = 'AppRouteLayout';
