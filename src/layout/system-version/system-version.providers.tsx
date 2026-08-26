import { useAppLeftNav } from '@tui/core';
import { SystemVersion } from 'layout/system-version';
import type { CSSProperties, PropsWithChildren } from 'react';
import { memo, useCallback, useEffect, useState } from 'react';

//*****************************************************************************************
// AppSystemVersionLayout
//*****************************************************************************************

export type AppSystemVersionLayoutProps = PropsWithChildren<{
  /** Optional class name override for custom styling. */
  className?: string;
}>;

export const AppSystemVersionLayout = memo(({ children, className }: AppSystemVersionLayoutProps) => {
  const leftnav = useAppLeftNav();
  const leftnavHover = Boolean(leftnav?.hover);
  const leftnavOpen = Boolean(leftnav?.open);

  const [versionStyle, setVersionStyle] = useState<CSSProperties>({});

  const updatePosition = useCallback(() => {
    const navEl =
      document.querySelector('.MuiDrawer-docked .MuiDrawer-paper') ||
      document.querySelector('.MuiDrawer-paperAnchorLeft') ||
      document.querySelector('.MuiDrawer-paper') ||
      document.querySelector('[data-testid="left-nav"]');

    if (navEl) {
      const rect = navEl.getBoundingClientRect();
      if (rect.right > 0) {
        setVersionStyle({
          left: `${rect.right + 12}px`,
          marginLeft: 0
        });
        return;
      }
    }

    setVersionStyle({});
  }, []);

  useEffect(() => {
    updatePosition();

    const navEl =
      document.querySelector('.MuiDrawer-docked .MuiDrawer-paper') ||
      document.querySelector('.MuiDrawer-paperAnchorLeft') ||
      document.querySelector('.MuiDrawer-paper');

    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updatePosition();
      });
      if (navEl) {
        resizeObserver.observe(navEl);
      }
      resizeObserver.observe(document.body);
    }

    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        updatePosition();
      });
      mutationObserver.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true
      });
    }

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    let animationFrameId: number | null = null;
    const handleTransition = () => {
      const step = () => {
        updatePosition();
        animationFrameId = requestAnimationFrame(step);
      };
      animationFrameId = requestAnimationFrame(step);
    };

    const handleTransitionEnd = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      updatePosition();
    };

    if (navEl) {
      navEl.addEventListener('transitionrun', handleTransition);
      navEl.addEventListener('transitionstart', handleTransition);
      navEl.addEventListener('transitionend', handleTransitionEnd);
      navEl.addEventListener('transitioncancel', handleTransitionEnd);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      if (navEl) {
        navEl.removeEventListener('transitionrun', handleTransition);
        navEl.removeEventListener('transitionstart', handleTransition);
        navEl.removeEventListener('transitionend', handleTransitionEnd);
        navEl.removeEventListener('transitioncancel', handleTransitionEnd);
      }
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [leftnavHover, leftnavOpen, updatePosition]);

  return (
    <>
      {children}
      <SystemVersion className={className} style={versionStyle} />
    </>
  );
});

AppSystemVersionLayout.displayName = 'AppSystemVersionLayout';
