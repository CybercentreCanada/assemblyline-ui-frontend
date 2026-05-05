/* @deprecated - commented out due to missing dependencies
import { AppLink, AppLinkProps, useAppRouteLocation } from 'core/router';
import type { AppRoute } from 'core/routes';
import React, { forwardRef, memo } from 'react';
import type { LinkProps } from 'react-router';
import { IconButton } from 'ui/buttons/IconButton';

type RouterLinkProps = Omit<LinkProps, 'to' | 'pathname' | 'search' | 'hash'>;
type RouteLinkForPath<Path extends AppRoute['path']> = Extract<AppLinkProps<AppRoute>, { path: Path }>;

export type LinkIconButtonProps<Path extends AppRoute['path'] = AppRoute['path'], Props = RouterLinkProps> = Omit<
  Props,
  keyof RouteLinkForPath<Path>
> &
  RouteLinkForPath<Path>;

function WrappedLinkIconButton<const Path extends AppRoute['path']>(
  { children, ...props }: LinkIconButtonProps<Path>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  const { href, state } = useAppRouteLocation(props);
  const handleClick = useAppLinkOnClick(props);

  return (
    <IconButton ref={ref} component={AppLink} to={href} state={state} onClick={handleClick}>
      {children}
    </IconButton>
  );
}

export const LinkIconButton = memo(forwardRef(WrappedLinkIconButton)) as <const Path extends AppRoute['path']>(
  props: LinkIconButtonProps<Path> & { ref?: React.ForwardedRef<HTMLAnchorElement> }
) => React.JSX.Element | null;

WrappedLinkIconButton.displayName = 'WrappedLinkIconButton';
(LinkIconButton as React.FC<LinkIconButtonProps>).displayName = 'AppLiLinkIconButtonnk';
*/
