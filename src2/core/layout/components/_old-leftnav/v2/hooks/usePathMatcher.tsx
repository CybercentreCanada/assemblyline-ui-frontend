import { useCallback } from 'react';
import { useAppRouter } from '../../../app';

export const usePathMatcher = () => {
  const { location, matchPath } = useAppRouter();

  return useCallback(
    (path: string, configs?: { matcher?: RegExp; matchEnd?: boolean }) => {
      if (!path) {
        return false;
      }

      if (configs?.matcher) {
        return configs.matcher.test(location.pathname);
      }

      return Boolean(matchPath({ path, end: configs?.matchEnd ?? true }, location.pathname));
    },
    [location.pathname, matchPath]
  );
};
