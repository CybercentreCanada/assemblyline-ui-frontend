import type { ButtonProps as MuiButtonProps, TooltipProps } from '@mui/material';
import { Button as MuiButton, Skeleton } from '@mui/material';
import type { InferAppNavigationPropsFromPath } from 'core/router';
import { AppLink } from 'core/router';
import { memo, useMemo } from 'react';
import { getTextContent } from 'shared/utils/utils';
import { Tooltip } from 'ui/Tooltip';
import { CircularProgress } from 'ui/buttons/CircularProgress';

export type ButtonProps<Origin extends AppRoute['route']> = MuiButtonProps &
  InferAppNavigationPropsFromPath<Origin> & {
    loading?: boolean;
    preventRender?: boolean | (() => boolean);
    progress?: boolean;
    tooltip?: TooltipProps['title'];
    tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  };

export const Button = memo(function <Origin extends AppRoute['route']>({
  children = null,
  disabled = false,
  id = null,
  loading = false,
  preventRender: preventRenderProp = false,
  progress = false,
  size = 'medium',
  nav = null,
  navDeps = null,
  tooltip = null,
  tooltipProps = null,
  ...props
}: ButtonProps<Origin>) {
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
    <Tooltip title={tooltip} placement="bottom" noDiv {...tooltipProps}>
      <MuiButton
        id={id ?? getTextContent(children)}
        disabled={progress || disabled}
        size={size}
        {...(!nav ? null : { component: AppLink, nav, navDeps })}
        {...props}
      >
        {children}
        <CircularProgress progress={progress} />
      </MuiButton>
    </Tooltip>
  );
});

Button.displayName = 'Button';
