import type { LinkProps, TypographyProps } from '@mui/material';
import { Link as MaterialLink, Skeleton, Typography, useTheme } from '@mui/material';
import { ActionableMenu } from 'components/visual/Actionables/components/ActionMenu';
import { useIsActionable } from 'components/visual/Actionables/lib/actionable.hooks';
import type { ActionableProps } from 'components/visual/Actionables/lib/actionable.models';
import { PropProvider, usePropStore } from 'components/visual/Actionables/lib/actionable.provider';
import ExternalLinks from 'components/visual/ExternalSearch';
import React, { useCallback } from 'react';

export type ActionableTextProps = ActionableProps & TypographyProps;

export const WrappedActionableText = React.memo((props: TypographyProps) => {
  const theme = useTheme();

  const [get, setStore] = usePropStore();

  const category = get('category');
  const loading = get('loading');
  const preventRender = get('preventRender');
  const type = get('type');
  const value = get('value');

  const isActionable = useIsActionable();

  const handleMenuClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault();
      setStore({ mouseX: event.clientX - 2, mouseY: event.clientY - 4 });
    },
    [setStore]
  );

  return preventRender ? null : loading ? (
    <Skeleton />
  ) : !isActionable ? (
    <Typography {...props}>{value}</Typography>
  ) : (
    <>
      <ActionableMenu />

      <MaterialLink
        {...(props as LinkProps)}
        onClick={handleMenuClick}
        onContextMenu={handleMenuClick}
        sx={{
          marginLeft: theme.spacing(-0.5),
          paddingLeft: theme.spacing(0.5),
          borderRadius: theme.spacing(0.5),
          textDecoration: 'none',
          minHeight: '22px',
          color: 'inherit',
          alignItems: 'center',
          display: 'flex',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: theme.palette.action.hover
          },
          ...props?.sx
        }}
      >
        <div style={{ marginTop: '2px' }}>{value}</div>
        <ExternalLinks category={category} type={type} value={value} />
      </MaterialLink>
    </>
  );
});

export const ActionableText = ({
  category = null,
  type = null,
  value = null,
  classification = null,
  ...props
}: ActionableTextProps) => (
  <PropProvider<ActionableTextProps>
    props={{
      category,
      type,
      value,
      classification
    }}
  >
    <WrappedActionableText {...props} />
  </PropProvider>
);
