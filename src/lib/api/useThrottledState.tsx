import Throttler from 'commons/addons/utils/throttler';
import { useEffect, useMemo, useState } from 'react';

export const useThrottledState = <T extends any>(
  state: T,
  time: number = null,
  initialState: T = null
): [T, boolean] => {
  const [value, setValue] = useState<T>(initialState);
  const [isThrottling, setIsThrottling] = useState<boolean>(true);

  const throttler = useMemo(() => (!time ? null : new Throttler(time)), [time]);

  useEffect(() => {
    let ignore = false;

    if (!time) {
      if (ignore) return;
      setValue(state);
      setIsThrottling(false);
    } else {
      setIsThrottling(true);
      throttler.delay(() => {
        if (ignore) return;
        setIsThrottling(false);
        setValue(state);
      });
    }
    return () => {
      ignore = true;
    };
  }, [state, throttler, time]);

  return [value, isThrottling];
};
