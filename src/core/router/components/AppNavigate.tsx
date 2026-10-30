import type { InferAppNavigationPropsFromPath } from 'core/router';
import { useAppNavigate } from 'core/router';
import { memo, useLayoutEffect, useRef } from 'react';

export type AppNavigateProps<Origin extends AppRoute['path']> = InferAppNavigationPropsFromPath<Origin>;

export function WrappedAppNavigate<const Origin extends AppRoute['path']>({
  nav,
  navDeps = null
}: AppNavigateProps<Origin>) {
  const navigate = useAppNavigate();

  const hasNavigatedRef = useRef<boolean>(false);

  useLayoutEffect(() => {
    if (!nav || hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    nav(navigate);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, ...(navDeps ?? [nav])]);

  return null;
}

WrappedAppNavigate.displayName = 'WrappedAppNavigate';

export const AppNavigate = memo(WrappedAppNavigate) as <const Origin extends AppRoute['path']>(
  props: AppNavigateProps<Origin>
) => React.JSX.Element | null;

(AppNavigate as unknown as { displayName: string }).displayName = 'AppNavigate';
