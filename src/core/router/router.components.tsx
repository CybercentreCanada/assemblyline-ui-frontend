import { useAppNavigate, useAppTo } from 'core/router';
import type { AppLinkTo } from 'core/routes';
import type { ForwardedRef } from 'react';
import { forwardRef, memo, useCallback } from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router';
import { Link } from 'react-router';

//*****************************************************************************************
// App Link
//*****************************************************************************************

export type AppLinkProps<Path extends AppRoute['path']> = Omit<
  RouterLinkProps,
  'to' | 'pathname' | 'search' | 'hash'
> & {
  to: AppLinkTo<Path>;
};

export function WrappedAppLink<const Path extends AppRoute['path']>(
  { children, to, onClick, ...props }: AppLinkProps<Path>,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  const { href, state } = useAppTo<Path>(to);
  const navigate = useAppNavigate<Path>();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();
      if ('openRoute' in to) navigate.openRoute(to.openRoute);
      else if ('replaceRoute' in to) navigate.replaceRoute(to.replaceRoute);
      else if ('replaceSearchObject' in to) navigate.replaceSearchObject(to.replaceSearchObject);
      else if ('replaceURLSearchParams' in to) navigate.replaceURLSearchParams(to.replaceURLSearchParams);
      onClick?.(event);
    },
    [navigate, onClick, to]
  );

  return (
    <Link {...props} ref={ref} to={href} state={state} onClick={handleClick}>
      {children}
    </Link>
  );
}

WrappedAppLink.displayName = 'WrappedAppLink';

export const AppLink = memo(forwardRef(WrappedAppLink)) as <const Path extends AppRoute['path']>(
  props: AppLinkProps<Path> & { ref?: ForwardedRef<HTMLAnchorElement> }
) => React.JSX.Element | null;

(AppLink as unknown as { displayName: string }).displayName = 'AppLink';
