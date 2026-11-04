import { useAppLeftNav } from '@tui/core';
import { SystemVersion } from 'layout/system-version';
import type { CSSProperties, PropsWithChildren } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

//*****************************************************************************************
// AppSystemVersionLayout
//*****************************************************************************************

export const AppSystemVersionLayout = memo(({ children }: PropsWithChildren) => {
  const leftnav = useAppLeftNav();
  const leftnavHover = Boolean(leftnav?.hover);
  const leftnavOpen = Boolean(leftnav?.open);

  const [leftPos, setLeftPos] = useState<string | null>(null);

  const currentLeftRef = useRef<string | null>(null);
  const observedElRef = useRef<HTMLElement | null>(null);

  const getDrawerToggleElement = useCallback(
    (): HTMLElement | null =>
      document.querySelector<HTMLElement>('[aria-label="Collapse drawer"]') ||
      document.querySelector<HTMLElement>('[aria-label="Expand drawer"]') ||
      document.querySelector<HTMLElement>('[aria-label="Fermer le menu"]') ||
      document.querySelector<HTMLElement>('[aria-label="Ouvrir le menu"]') ||
      document.querySelector<HTMLElement>('[aria-label*="drawer"]') ||
      document.querySelector<HTMLElement>('[aria-label*="Drawer"]') ||
      document.querySelector<HTMLElement>('.MuiDrawer-docked .MuiDrawer-paper') ||
      document.querySelector<HTMLElement>('.MuiDrawer-paperAnchorLeft') ||
      document.querySelector<HTMLElement>('.MuiDrawer-paper'),
    []
  );

  const updatePosition = useCallback(() => {
    const targetEl = getDrawerToggleElement();
    let newLeft: string | null = null;

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      const rightEdge = rect.right > 0 ? rect.right : rect.left + rect.width;
      if (rightEdge > 0) {
        newLeft = `${Math.round(rightEdge + 12)}px`;
      }
    }

    if (newLeft !== currentLeftRef.current) {
      currentLeftRef.current = newLeft;
      setLeftPos(newLeft);
    }
  }, [getDrawerToggleElement]);

  useEffect(() => {
    updatePosition();

    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    const attachObserver = () => {
      const targetEl = getDrawerToggleElement();

      if (targetEl && resizeObserver && targetEl !== observedElRef.current) {
        if (observedElRef.current) {
          resizeObserver.unobserve(observedElRef.current);
        }
        resizeObserver.observe(targetEl);
        observedElRef.current = targetEl;
      }
    };

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updatePosition();
      });
      attachObserver();
    }

    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        attachObserver();
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

    window.addEventListener('transitionrun', handleTransition, true);
    window.addEventListener('transitionstart', handleTransition, true);
    window.addEventListener('transitionend', handleTransitionEnd, true);
    window.addEventListener('transitioncancel', handleTransitionEnd, true);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('transitionrun', handleTransition, true);
      window.removeEventListener('transitionstart', handleTransition, true);
      window.removeEventListener('transitionend', handleTransitionEnd, true);
      window.removeEventListener('transitioncancel', handleTransitionEnd, true);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [getDrawerToggleElement, leftnavHover, leftnavOpen, updatePosition]);

  const versionStyle = useMemo<CSSProperties>(() => ({ left: leftPos }), [leftPos]);

  return (
    <>
      {children}
      <SystemVersion style={versionStyle} />
    </>
  );
});

AppSystemVersionLayout.displayName = 'AppSystemVersionLayout';
