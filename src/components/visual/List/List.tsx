import type { ListProps as MuiListProps } from '@mui/material';
import { List as MuiList, Paper, useTheme } from '@mui/material';
import type { FC } from 'react';

export type ListProps = MuiListProps & {
  inset?: boolean;
};

export const List: FC<ListProps> = ({ children, inset = false, ...listProps }) => {
  const theme = useTheme();

  return (
    <MuiList
      component={props => <Paper {...props} component="ul" />}
      disablePadding
      sx={{
        marginBottom: theme.spacing(1),
        ...(inset && { marginLeft: '56px' }),
        '&>:not(:last-child)': {
          borderBottom: `thin solid ${theme.palette.divider}`
        },
        ...listProps?.sx
      }}
      {...listProps}
    >
      {children}
    </MuiList>
  );
};
