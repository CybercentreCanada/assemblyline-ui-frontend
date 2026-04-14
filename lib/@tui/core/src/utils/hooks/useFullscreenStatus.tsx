import { useCallback, useLayoutEffect, useMemo, useState, type RefObject } from 'react';

const getBrowserFullscreenElementProp = () => {
  if (typeof document.fullscreenElement !== 'undefined') {
    return 'fullscreenElement';
  }
  if (typeof document['mozFullScreenElement'] !== 'undefined') {
    return 'mozFullScreenElement';
  }
  if (typeof document['msFullscreenElement'] !== 'undefined') {
    return 'msFullscreenElement';
  }
  if (typeof document['webkitFullscreenElement'] !== 'undefined') {
    return 'webkitFullscreenElement';
  }
  throw new Error('fullscreenElement is not supported by this browser');
};

export const useFullscreenStatus = (elRef: RefObject<any>) => {
  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== 'undefined' && document[getBrowserFullscreenElementProp()] !== null
  );

  const setFullscreen = useCallback(() => {
    if (elRef.current == null) return;

    elRef.current
      .requestFullscreen()
      .then(() => {
        setIsFullscreen(document[getBrowserFullscreenElementProp()] !== null);
      })
      .catch(() => {
        setIsFullscreen(false);
      });
  }, [elRef]);

  useLayoutEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(document[getBrowserFullscreenElementProp()] !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [setIsFullscreen]);

  return useMemo(() => [isFullscreen, setFullscreen], [isFullscreen, setFullscreen]) as [boolean, () => void];
};
