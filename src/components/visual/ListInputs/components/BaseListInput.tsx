import type { FormHelperTextProps, ListItemButtonProps, ListItemProps } from '@mui/material';
import { FormHelperText, ListItem, ListItemButton, useTheme } from '@mui/material';
import React, { type FC } from 'react';

interface BaseListItemProps extends ListItemProps {
  disabled?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  FormHelperTextProps?: FormHelperTextProps;
}

export const BaseListItem: React.FC<BaseListItemProps> = React.memo(
  ({ children = null, error = false, helperText = null, FormHelperTextProps = null, ...props }: BaseListItemProps) => {
    const theme = useTheme();

    return (
      <ListItem
        {...props}
        sx={{ minHeight: '50px', paddingTop: theme.spacing(0.5), paddingBottom: theme.spacing(0.5), ...props?.sx }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0, width: '100%' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', minWidth: 0, width: '100%', columnGap: theme.spacing(1) }}
          >
            {children}
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: 0, width: '100%' }}
          >
            {!error ? null : (
              <FormHelperText
                sx={{ color: theme.palette.error.main, ...FormHelperTextProps?.sx }}
                variant="outlined"
                {...FormHelperTextProps}
              >
                {helperText}
              </FormHelperText>
            )}
          </div>
        </div>
      </ListItem>
    );
  }
);

interface BaseListItemButtonProps extends ListItemButtonProps {}

export const BaseListItemButton: FC<BaseListItemButtonProps> = props => {
  const theme = useTheme();
  return (
    <ListItemButton
      role={undefined}
      {...props}
      sx={{
        gap: theme.spacing(0.5),
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        ...props?.sx
      }}
    />
  );
};
