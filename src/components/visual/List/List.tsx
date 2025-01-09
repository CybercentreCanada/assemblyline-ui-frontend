import type { ListProps as MuiListProps } from '@mui/material';
import { List as MuiList, Paper, useTheme } from '@mui/material';
import type { FC, HTMLAttributes, ReactNode } from 'react';
import type { ListHeaderProps } from './ListHeader';
import { ListHeader } from './ListHeader';

export interface ListProps extends ListHeaderProps {
  children?: ReactNode;
  checkboxPadding?: boolean;
  containerProps?: HTMLAttributes<HTMLDivElement>;
  listProps?: MuiListProps;
}

export const List: FC<ListProps> = ({
  children,
  checkboxPadding = false,
  containerProps,
  listProps,
  primary,
  primaryProps,
  ...other
}) => {
  const theme = useTheme();

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(0.5), ...containerProps?.style }}
      {...containerProps}
    >
      {!primary ? null : <ListHeader primary={primary} primaryProps={primaryProps} {...other} />}

      <MuiList
        component={props => <Paper {...props} component="ul" />}
        disablePadding
        sx={{
          marginBottom: theme.spacing(1),
          ...(checkboxPadding && { marginLeft: '56px' }),
          '&>:not(:last-child)': {
            borderBottom: `thin solid ${theme.palette.divider}`
          },
          ...listProps?.sx
        }}
        {...listProps}
      >
        {children}
      </MuiList>
    </div>
  );
};
