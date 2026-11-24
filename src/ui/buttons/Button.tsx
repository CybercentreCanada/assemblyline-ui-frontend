import type { ButtonProps as MuiButtonProps, TooltipProps } from '@mui/material';
import { Button as MuiButton, Skeleton } from '@mui/material';
import type { InferAppNavigationPropsFromPath } from 'core/router';
import { AppLink } from 'core/router';
import { memo, useMemo } from 'react';
import { getTextContent } from 'shared/utils/utils';
import { CircularProgress } from 'ui/buttons/CircularProgress';
import { Tooltip } from 'ui/Tooltip';

export type ButtonProps<Origin extends AppRoute['path'] = AppRoute['path']> = MuiButtonProps &
  InferAppNavigationPropsFromPath<Origin> & {
    link?: boolean;
    loading?: boolean;
    preventRender?: boolean | (() => boolean);
    progress?: boolean;
    to?:
      | string
      | { pathname?: string; search?: string; hash?: string }
      | (() => string | { pathname?: string; search?: string; hash?: string });
    tooltip?: TooltipProps['title'];
    tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  };

export const Button = memo(function <Origin extends AppRoute['path'] = AppRoute['path']>({
  children = null,
  disabled = false,
  id = null,
  loading = false,
  preventRender: preventRenderProp = false,
  progress = false,
  size = 'medium',
  nav = null,
  navDeps = null,
  to = null,
  tooltip = null,
  tooltipProps = null,
  ...props
}: ButtonProps<Origin>) {
  const href = useMemo(() => {
    const target = typeof to === 'function' ? to() : to;
    return typeof target === 'string'
      ? target
      : target
        ? `${target.pathname ?? ''}${target.search ?? ''}${target.hash ?? ''}`
        : null;
  }, [to]);
  const externalHref = useMemo(() => (href && /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href) ? href : null), [href]);
  const resolvedNav = useMemo<InferAppNavigationPropsFromPath<Origin>['nav']>(
    () => nav ?? (href && !externalHref ? navigation => navigation.to().create(href) : null),
    [externalHref, href, nav]
  );
  const resolvedNavDeps = useMemo(() => navDeps ?? (href ? [href] : null), [href, navDeps]);
  const preventRender = useMemo<boolean>(
    () => (loading ? false : typeof preventRenderProp === 'function' ? preventRenderProp() : preventRenderProp),
    [loading, preventRenderProp]
  );

  return loading ? (
    <MuiButton disabled size={size} sx={{ padding: 0 }}>
      <Skeleton
        id={id ?? getTextContent(children)}
        variant="rounded"
        width="50px"
        sx={{
          flex: 1,
          ...(size === 'small' && { height: '30.75px' }),
          ...(size === 'medium' && { height: '36.5px' }),
          ...(size === 'large' && { height: '42.25px' })
        }}
      />
    </MuiButton>
  ) : preventRender ? null : (
    <Tooltip title={tooltip} placement="bottom" {...tooltipProps}>
      <MuiButton
        id={id ?? getTextContent(children)}
        disabled={progress || disabled}
        size={size}
        {...props}
        {...(resolvedNav
          ? { component: AppLink, nav: resolvedNav, navDeps: resolvedNavDeps }
          : externalHref
            ? { href: externalHref }
            : null)}
      >
        {children}
        <CircularProgress progress={progress} />
      </MuiButton>
    </Tooltip>
  );
});

Button.displayName = 'Button';
