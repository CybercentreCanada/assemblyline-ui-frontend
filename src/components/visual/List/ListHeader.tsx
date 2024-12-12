import type { CheckboxProps, ListItemButtonProps, ListItemProps, ListItemTextProps } from '@mui/material';
import { Checkbox, ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import { type FC } from 'react';

export interface ListHeaderProps extends ListItemProps {
  primaryProps?: ListItemTextProps['primaryTypographyProps'];
  secondaryProps?: ListItemTextProps['secondaryTypographyProps'];
  checkboxProps?: CheckboxProps;
  buttonProps?: ListItemButtonProps;

  underlined?: boolean;
  edge?: 'start' | 'end';
  button?: boolean;
  disabled?: boolean;
}

export const ListHeader: FC<ListHeaderProps> = ({
  id,
  primaryProps,
  secondaryProps,
  checkboxProps,
  buttonProps,
  underlined = false,
  edge = 'end',
  button = false,
  disabled = false,
  ...other
}) => {
  const theme = useTheme();

  return button ? (
    <ListItem id={id} disableGutters disablePadding disabled={disabled} {...other}>
      <ListItemButton
        dense
        disableGutters
        {...buttonProps}
        sx={{
          padding: 0,
          '&.MuiButtonBase-root:hover': { bgcolor: 'transparent' },
          ...(underlined && { borderBottom: `1px solid ${theme.palette.divider}` })
        }}
      >
        {checkboxProps && (
          <ListItemIcon>
            <Checkbox edge={edge} tabIndex={-1} disableRipple inputProps={{ id: `${id}-input` }} {...checkboxProps} />
          </ListItemIcon>
        )}
        <ListItemText
          primary={primaryProps?.children}
          primaryTypographyProps={{
            htmlFor: `${id}-input`,
            component: 'label',
            variant: 'body1',
            sx: { '&:hover': { cursor: 'pointer' } },
            ...primaryProps
          }}
          secondary={secondaryProps?.children}
          secondaryTypographyProps={secondaryProps}
        />
      </ListItemButton>
    </ListItem>
  ) : (
    <ListItem
      id={id}
      disableGutters
      disablePadding
      disabled={disabled}
      sx={{ ...(underlined && { borderBottom: `1px solid ${theme.palette.divider}` }) }}
      {...other}
    >
      {checkboxProps && (
        <ListItemIcon>
          <Checkbox
            edge={edge}
            tabIndex={-1}
            disableRipple
            disabled
            inputProps={{ id: `${id}-input` }}
            {...checkboxProps}
          />
        </ListItemIcon>
      )}
      <ListItemText
        primary={primaryProps?.children}
        primaryTypographyProps={{ variant: 'body1', ...primaryProps }}
        secondary={secondaryProps?.children}
        secondaryTypographyProps={secondaryProps}
      />
    </ListItem>
  );
};
