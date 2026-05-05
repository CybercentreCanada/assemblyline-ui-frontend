import { keyframes } from '@emotion/react';
import { styled } from '@mui/material';
import { memo, useEffect, useRef, useState } from 'react';

//*****************************************************************************************
// TextScroller
//*****************************************************************************************

const scroll = keyframes`
  0% { transform: translateX(0); }
  10% { transform: translateX(0); }
  90% { transform: translateX(-100%); }
  100% { transform: translateX(-100%); }
`;

const ScrollerContainer = styled('div')(() => ({
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'nowrap'
}));

ScrollerContainer.displayName = 'ScrollerContainer';

const ScrollerText = styled('div')({
  display: 'inline-block',
  whiteSpace: 'nowrap'
});

ScrollerText.displayName = 'ScrollerText';

/** Scrolling speed in pixels per second. */
const SPEED_PX_PER_SEC = 75;

/** Props for TextScroller. */
export type TextScrollerProps = {
  /** Content to scroll. */
  children: React.ReactNode;
};

export const TextScroller = memo(({ children }: TextScrollerProps) => {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [shouldScroll, setShouldScroll] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const update = () => {
      const cw = container.clientWidth;
      const tw = text.scrollWidth;
      const scrollDistance = tw - cw;
      setContainerWidth(cw);

      if (scrollDistance > 0) {
        setShouldScroll(true);
        setDuration(scrollDistance / SPEED_PX_PER_SEC);
      } else {
        setShouldScroll(false);
        setDuration(0);
      }
    };

    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(container);
    resizeObserver.observe(text);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <ScrollerContainer ref={containerRef}>
      <ScrollerText
        style={{
          animation: shouldScroll ? `${scroll} ${duration}s linear infinite` : 'none',
          marginRight: shouldScroll ? `-${containerWidth}px` : '0px'
        }}
        ref={textRef}
      >
        {children}
      </ScrollerText>
    </ScrollerContainer>
  );
});

TextScroller.displayName = 'TextScroller';
