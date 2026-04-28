import type { AppRoute } from 'core/routes';
import React, { forwardRef, memo } from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router';

type RouterLinkProps = Omit<LinkProps, 'to' | 'pathname' | 'search' | 'hash'>;
type RouteLinkForPath<Path extends AppRoute['path']> = Extract<AppRouteLink, { path: Path }>;

export type LinkProps<Path extends AppRoute['path'] = AppRoute['path'], Props = RouterLinkProps> = Omit<
  Props,
  keyof RouteLinkForPath<Path>
> &
  RouteLinkForPath<Path>;

function WrappedLink<const Path extends AppRoute['path']>(
  { children, ...props }: LinkProps<Path>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  const to = useLinkTo(props);
  const handleClick = useLinkOnClick(props);

  return (
    <Link ref={ref} to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}

export const Link = memo(forwardRef(WrappedLink)) as <const Path extends AppRoute['path']>(
  props: LinkProps<Path> & { ref?: React.ForwardedRef<HTMLAnchorElement> }
) => React.JSX.Element | null;

WrappedLink.displayName = 'WrappedLink';
(Link as React.FC<LinkProps>).displayName = 'Link';
