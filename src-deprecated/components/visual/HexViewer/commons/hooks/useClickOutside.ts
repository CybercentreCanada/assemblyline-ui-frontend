import { useEffect, useRef } from 'react';

export const useClickOutside = (callback, elRef) => {
  const callbackRef = useRef(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleClickOutside = e => {
      if (elRef?.current?.contains(e.target) && callbackRef.current) callbackRef.current(e);
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [callbackRef, elRef]);
};
