import type { InferNavigationInputFromPath } from 'core/router';
import { getNavigationMapFromInput, useAppExternalHref, useAppNavigate } from 'core/router';
import type { ForwardedRef } from 'react';
import { forwardRef, memo, useCallback, useLayoutEffect, useRef } from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router';
import { Link } from 'react-router';

//*****************************************************************************************
// App Link
//*****************************************************************************************

export type AppLinkProps<Path extends AppRoute['path']> = Omit<
  RouterLinkProps,
  'to' | 'pathname' | 'search' | 'hash'
> & {
  to: InferNavigationInputFromPath<Path>;
};

export function WrappedAppLink<const Path extends AppRoute['path']>(
  { children, to, onClick, ...props }: AppLinkProps<Path>,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  const href = useAppExternalHref<Path>(to);
  const navigate = useAppNavigate();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();
      onClick?.(event);
      navigate.run<Path>(to);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, onClick, ...(getNavigationMapFromInput(to).dependencies ?? [to])]
  );

  return (
    <Link {...props} ref={ref} to={href} onClick={handleClick}>
      {children}
    </Link>
  );
}

WrappedAppLink.displayName = 'WrappedAppLink';

export const AppLink = memo(forwardRef(WrappedAppLink)) as <const Path extends AppRoute['path']>(
  props: AppLinkProps<Path> & { ref?: ForwardedRef<HTMLAnchorElement> }
) => React.JSX.Element | null;

(AppLink as unknown as { displayName: string }).displayName = 'AppLink';

//*****************************************************************************************
// App Navigate
//*****************************************************************************************

export type AppNavigateProps<Path extends AppRoute['path']> = {
  to: InferNavigationInputFromPath<Path>;
};

export function WrappedAppNavigate<const Path extends AppRoute['path']>({ to }: AppNavigateProps<Path>) {
  const navigate = useAppNavigate();

  const hasNavigatedRef = useRef<boolean>(false);

  useLayoutEffect(() => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    navigate.run<Path>(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, ...(getNavigationMapFromInput(to).dependencies ?? [to])]);

  return null;
}

WrappedAppNavigate.displayName = 'WrappedAppNavigate';

export const AppNavigate = memo(WrappedAppNavigate) as <const Path extends AppRoute['path']>(
  props: AppNavigateProps<Path>
) => React.JSX.Element | null;

(AppNavigate as unknown as { displayName: string }).displayName = 'AppNavigate';
