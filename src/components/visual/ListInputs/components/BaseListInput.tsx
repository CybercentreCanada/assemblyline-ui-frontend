import type { FormHelperTextProps, ListItemButtonProps, ListItemProps, ListItemTextProps } from '@mui/material';
import { FormHelperText, ListItem, ListItemButton, ListItemText, useTheme } from '@mui/material';
import React, { type FC } from 'react';

interface BaseListItemProps extends ListItemProps {
  error?: boolean;
  helperText?: React.ReactNode;
  FormHelperTextProps?: FormHelperTextProps;
}

export const BaseListItem: React.FC<BaseListItemProps> = React.memo(
  ({ children = null, error = false, helperText = null, FormHelperTextProps = null, ...props }: BaseListItemProps) => {
    const theme = useTheme();

    return (
      <ListItem {...props}>
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

export const BaseListItemButton: FC<BaseListItemButtonProps> = ({ sx, ...other }) => {
  const theme = useTheme();
  return <ListItemButton role={undefined} sx={{ gap: theme.spacing(0.5), ...sx }} {...other} />;
};

interface BaseListItemTextProps extends ListItemTextProps {
  capitalize?: boolean;
}

export const BaseListItemText: FC<BaseListItemTextProps> = ({
  id,
  capitalize = false,
  sx,
  primary,
  primaryTypographyProps,
  secondaryTypographyProps,
  ...other
}) => {
  const theme = useTheme();
  return (
    <ListItemText
      primary={
        <label htmlFor={id || primary.toString()} style={{ cursor: 'pointer' }}>
          {primary}
        </label>
      }
      primaryTypographyProps={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        ...(capitalize && { textTransform: 'capitalize' }),
        ...primaryTypographyProps
      }}
      secondaryTypographyProps={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        ...secondaryTypographyProps
      }}
      sx={{
        marginRight: theme.spacing(2),
        margin: `${theme.spacing(0.25)} 0`,
        '&:hover>*': {
          overflow: 'auto',
          whiteSpace: 'wrap'
        },
        ...sx
      }}
      {...other}
    />
  );
};
