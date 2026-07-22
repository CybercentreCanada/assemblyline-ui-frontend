import type { InferAppNavigationPropsFromPath } from 'core/router';
import { useAppExternalHref, useAppNavigate } from 'core/router';
import type { ForwardedRef } from 'react';
import { forwardRef, memo, useCallback, useLayoutEffect, useRef } from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router';
import { Link } from 'react-router';

//*****************************************************************************************
// App Link
//*****************************************************************************************

export type AppLinkProps<Origin extends AppRoute['path']> = InferAppNavigationPropsFromPath<Origin> &
  Omit<RouterLinkProps, 'to' | 'pathname' | 'search' | 'hash'>;

export function WrappedAppLink<const Origin extends AppRoute['path']>(
  { children, nav = null, navDeps = null, onClick, ...props }: AppLinkProps<Origin>,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  const href = useAppExternalHref<Origin>(nav, navDeps);
  const navigate = useAppNavigate();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      onClick?.(event);
      if (!nav) return;

      event.preventDefault();
      event.stopPropagation();
      nav?.(navigate);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, onClick, ...(navDeps ?? [nav])]
  );

  return (
    <Link {...props} ref={ref} to={href} onClick={handleClick}>
      {children}
    </Link>
  );
}

WrappedAppLink.displayName = 'WrappedAppLink';

export const AppLink = memo(forwardRef(WrappedAppLink)) as <const Origin extends AppRoute['path']>(
  props: AppLinkProps<Origin> & { ref?: ForwardedRef<HTMLAnchorElement> }
) => React.JSX.Element | null;

(AppLink as unknown as { displayName: string }).displayName = 'AppLink';

//*****************************************************************************************
// App Navigate
//*****************************************************************************************

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
