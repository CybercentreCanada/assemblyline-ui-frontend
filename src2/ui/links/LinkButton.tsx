import { useAppRouterOnClick, useAppRouterTo } from 'core/router';
import type { AppRoute } from 'core/routes';
import React, { forwardRef, memo } from 'react';
import { Link } from 'react-router';
import { LinkProps } from './Link';

function WrappedLinkButton<const Path extends AppRoute['path']>(
  { children, ...props }: LinkProps<Path>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  const to = useAppRouterTo(props);
  const handleClick = useAppRouterOnClick(props);

  return (
    <Link ref={ref} to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}

export const LinkButton = memo(forwardRef(WrappedLinkButton)) as <const Path extends AppRoute['path']>(
  props: LinkProps<Path> & { ref?: React.ForwardedRef<HTMLAnchorElement> }
) => React.JSX.Element | null;

WrappedLinkButton.displayName = 'WrappedAppLink';
(Link as React.FC<LinkProps>).displayName = 'AppLink';
