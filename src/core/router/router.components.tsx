import { useAppExternalHref, useAppNavigate } from 'core/router';
import type { InferNavigationValueFromPath } from 'core/routes';
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
  to: InferNavigationValueFromPath<Path>;
};

// TODO
export function WrappedAppLink<const Path extends AppRoute['path']>(
  { children, to, onClick, ...props }: AppLinkProps<Path>,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  const href = useAppExternalHref<Path>(to);
  const navigate = useAppNavigate<Path>();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      if (onClick) onClick?.(event);
      else {
        event.preventDefault();
        event.stopPropagation();

        const [toKey, toValue] = Object.entries(to)?.[0] || [null, null];
        navigate?.[toKey]?.(toValue);
        // if ('openRoute' in to) navigate.openRoute(to.openRoute);
        // else if ('replaceRoute' in to) navigate.replaceRoute(to.replaceRoute);
        // else if ('replaceSearchObject' in to) navigate.replaceSearchObject(to.replaceSearchObject);
        // else if ('replaceURLSearchParams' in to) navigate.replaceURLSearchParams(to.replaceURLSearchParams);
      }
    },
    [navigate, onClick, to]
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
  to: InferNavigationValueFromPath<Path>;
};

export function WrappedAppNavigate<const Path extends AppRoute['path']>({ to }: AppNavigateProps<Path>) {
  const navigate = useAppNavigate<Path>();
  const hasNavigatedRef = useRef<boolean>(false);

  useLayoutEffect(() => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    if ('openRoute' in to) navigate.openRoute(to.openRoute);
    else if ('replaceRoute' in to) navigate.replaceRoute(to.replaceRoute);
    else if ('replaceSearchObject' in to) navigate.replaceSearchObject(to.replaceSearchObject);
    else if ('replaceURLSearchParams' in to) navigate.replaceURLSearchParams(to.replaceURLSearchParams);
  }, [navigate, to]);

  return null;
}

WrappedAppNavigate.displayName = 'WrappedAppNavigate';

export const AppNavigate = memo(WrappedAppNavigate) as <const Path extends AppRoute['path']>(
  props: AppNavigateProps<Path>
) => React.JSX.Element | null;

(AppNavigate as unknown as { displayName: string }).displayName = 'AppNavigate';
