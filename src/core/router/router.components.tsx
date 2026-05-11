import type { AppRoute } from 'core/routes';
import type { ForwardedRef } from 'react';
import { forwardRef, memo, useCallback } from 'react';
import { Link } from 'react-router';
import { useAppNavigate, useAppRouteLocation } from './router.hooks';
import type { AppLinkProps } from './router.models';

//*****************************************************************************************
// App Link
//*****************************************************************************************
export function WrappedAppLink<const Route extends AppRoute>(
  { children, to = null, onClick = () => null, ...props }: AppLinkProps<Route>,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  const { href, state } = useAppRouteLocation(to);
  const navigate = useAppNavigate();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();
      navigate(to);
      onClick(event);
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

export const AppLink = memo(forwardRef(WrappedAppLink)) as <const Route extends AppRoute>(
  props: AppLinkProps<Route> & { ref?: ForwardedRef<HTMLAnchorElement> }
) => React.JSX.Element | null;

(AppLink as unknown as { displayName: string }).displayName = 'AppLink';
