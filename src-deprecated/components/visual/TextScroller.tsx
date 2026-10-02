import { keyframes } from '@emotion/react';
import { styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

/**
 * Keyframes for horizontal scrolling.
 * Starts with a short pause (0–10%) and ends with a pause (90–100%)
 * before looping back to the start.
 */
const scroll = keyframes`
  0% { transform: translateX(0); }
  10% { transform: translateX(0); }
  90% { transform: translateX(-100%); }
  100% { transform: translateX(-100%); }
`;

/** Container that clips overflow and holds the scrolling text */
const ScrollerContainer = styled('div')(() => ({
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'nowrap'
}));

/** Inner text wrapper that receives animation + translation */
const ScrollerText = styled('div')({
  display: 'inline-block',
  whiteSpace: 'nowrap'
});

/** Scrolling speed in pixels per second (constant speed regardless of text length) */
const SPEED_PX_PER_SEC = 75;

export const TextScroller = ({ children }: { children: React.ReactNode }) => {
  // Dynamic container width (for masking + marginRight offset)
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Animation duration in seconds (computed from text size)
  const [duration, setDuration] = useState<number>(0);

  // Whether scrolling is necessary at all
  const [shouldScroll, setShouldScroll] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    /**
     * Computes:
     * - When scrolling is required
     * - Distance to scroll
     * - Animation duration based on constant px/sec speed
     */
    const update = () => {
      const cw = container.clientWidth;
      const tw = text.scrollWidth;

      const scrollDistance = tw - cw;
      setContainerWidth(cw);

      if (scrollDistance > 0) {
        setShouldScroll(true);
        setDuration(scrollDistance / SPEED_PX_PER_SEC); // constant speed
      } else {
        setShouldScroll(false);
        setDuration(0);
      }
    };

    // Initial measurement
    update();

    // Observe size changes in both container and text
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(container);
    resizeObserver.observe(text);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <ScrollerContainer ref={containerRef}>
      <ScrollerText
        // Apply animation only when text is wider than container
        style={{
          animation: shouldScroll ? `${scroll} ${duration}s linear infinite` : 'none',
          marginRight: shouldScroll ? `-${containerWidth}px` : 0
        }}
        ref={textRef}
      >
        {children}
      </ScrollerText>
    </ScrollerContainer>
  );
};
