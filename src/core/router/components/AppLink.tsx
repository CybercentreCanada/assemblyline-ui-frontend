import type { InferAppNavigationPropsFromPath } from 'core/router';
import { useAppExternalHref, useAppNavigate } from 'core/router';
import type { ForwardedRef } from 'react';
import { forwardRef, memo, useCallback } from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router';
import { Link } from 'react-router';

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
      if (
        !nav ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        props.target != null ||
        props.download !== undefined
      )
        return;

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
