import React from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router';
import { Link as RouterLink } from 'react-router';
import { PathParams, TypedRoute } from '../models/router.models';

type RouteTargetProps<Path extends string> = keyof PathParams<Path> extends never
  ? { to: TypedRoute<Path>; params?: never }
  : { to: TypedRoute<Path>; params: PathParams<Path> };

export type LinkProps<Path extends string = string> = Omit<RouterLinkProps, 'to'> &
  ({ to: string; params?: never } | RouteTargetProps<Path>);

export const Link = React.memo(({ to, ...props }: LinkProps) => {
  if (typeof to === 'string') {
    return <RouterLink to={to} {...props} />;
  }

  const { params, ...rest } = props;
  const href = to.to((params ?? {}) as PathParams<typeof to.path>);

  return <RouterLink to={href} {...rest} />;
});
