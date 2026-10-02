import { stableStringify } from 'components/core/Query/components/utils';
import { useEffect, useMemo, useState } from 'react';

export const useIsDebouncing = (delay: number | null = null, dependencies: readonly unknown[] = []): boolean => {
  const [bouncedDependencies, setBouncedDependencies] = useState<string | null>(null);

  const stringifiedDependencies = useMemo<string>(() => stableStringify(dependencies), [dependencies]);

  useEffect(() => {
    if (!delay) return;
    const handler = setTimeout(() => setBouncedDependencies(stableStringify(dependencies)), delay);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, ...dependencies]);

  return useMemo(
    () => (delay ? bouncedDependencies !== stringifiedDependencies : false),
    [bouncedDependencies, delay, stringifiedDependencies]
  );
};
