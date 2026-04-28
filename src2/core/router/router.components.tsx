import { AppRoute } from 'core/routes';
import { forwardRef, memo, useCallback } from 'react';
import { Link } from 'react-router';
import { useAppNavigate, useAppRouteLocation } from './router.hooks';
import { AppLinkProps } from './router.models';

//*****************************************************************************************
// App Link
//*****************************************************************************************

export function WrappedAppLink<const Route extends AppRoute>(
  { children, ...props }: AppLinkProps<Route>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  const { href, state } = useAppRouteLocation(props?.to);
  const navigate = useAppNavigate();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();
      navigate(props?.to);
      props?.onClick?.(event);
    },
    [props?.to]
  );

  return (
    <Link {...props} ref={ref} to={href} state={state} onClick={handleClick}>
      {children}
    </Link>
  );
}

export const AppLink = memo(forwardRef(WrappedAppLink)) as <const Route extends AppRoute>(
  props: AppLinkProps<Route> & { ref?: React.ForwardedRef<HTMLAnchorElement> }
) => React.JSX.Element | null;

WrappedAppLink.displayName = 'WrappedAppLink';
(AppLink as any).displayName = 'AppLink';
