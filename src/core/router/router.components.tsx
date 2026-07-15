import type { InferAppNavigationPropsFromPath } from 'core/router';
import {
  DEFAULT_APP_NAVIGATE_OPTIONS,
  getNavigationIntentFromProps,
  useAppExternalHref,
  useAppNavigate
} from 'core/router';
import type { ForwardedRef } from 'react';
import { forwardRef, memo, useCallback, useLayoutEffect, useRef } from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router';
import { Link } from 'react-router';

//*****************************************************************************************
// App Link
//*****************************************************************************************

export type AppLinkProps<Path extends AppRoute['route']> = InferAppNavigationPropsFromPath<Path> &
  Omit<RouterLinkProps, 'to' | 'pathname' | 'search' | 'hash' | 'from' | 'here' | 'at'>;

export function WrappedAppLink<const Path extends AppRoute['route']>(
  { children, navOptions = DEFAULT_APP_NAVIGATE_OPTIONS, navDeps = null, onClick, ...props }: AppLinkProps<Path>,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  const intent = getNavigationIntentFromProps(props);
  const href = useAppExternalHref<Path>(intent, navOptions, navDeps);
  const navigate = useAppNavigate();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();
      onClick?.(event);
      navigate.run<Path>(intent, navOptions);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, onClick, ...(navDeps ?? [intent])]
  );

  return (
    <Link {...props} ref={ref} to={href} onClick={handleClick}>
      {children}
    </Link>
  );
}

WrappedAppLink.displayName = 'WrappedAppLink';

export const AppLink = memo(forwardRef(WrappedAppLink)) as <const Path extends AppRoute['route']>(
  props: AppLinkProps<Path> & { ref?: ForwardedRef<HTMLAnchorElement> }
) => React.JSX.Element | null;

(AppLink as unknown as { displayName: string }).displayName = 'AppLink';

//*****************************************************************************************
// App Navigate
//*****************************************************************************************

export type AppNavigateProps<Path extends AppRoute['route']> = InferAppNavigationPropsFromPath<Path>;

export function WrappedAppNavigate<const Path extends AppRoute['route']>({
  navOptions = DEFAULT_APP_NAVIGATE_OPTIONS,
  navDeps = null,
  ...props
}: AppNavigateProps<Path>) {
  const navigate = useAppNavigate();

  const hasNavigatedRef = useRef<boolean>(false);

  const intent = getNavigationIntentFromProps(props);

  useLayoutEffect(() => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    navigate.run<Path>(intent, navOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, ...(navDeps ?? [intent])]);

  return null;
}

WrappedAppNavigate.displayName = 'WrappedAppNavigate';

export const AppNavigate = memo(WrappedAppNavigate) as <const Path extends AppRoute['route']>(
  props: AppNavigateProps<Path>
) => React.JSX.Element | null;

(AppNavigate as unknown as { displayName: string }).displayName = 'AppNavigate';
