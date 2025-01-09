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

  primary?: React.ReactNode;
  secondary?: React.ReactNode;

  checkbox?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
  preventDefault?: boolean;
}

export const ListHeader: FC<ListHeaderProps> = ({
  id,

  checkboxProps,
  buttonProps,
  underlined = false,
  edge = 'end',
  button = false,
  disabled = false,

  primary = null,
  secondary = null,
  primaryProps = null,
  secondaryProps = null,

  checkbox = false,
  checked = null,
  indeterminate = null,
  preventDefault = false,
  ...other
}) => {
  const theme = useTheme();

  return button ? (
    <ListItem key={primary.toString()} id={id} disableGutters disablePadding disabled={disabled} {...other}>
      <ListItemButton
        role={undefined}
        dense
        disableGutters
        {...buttonProps}
        sx={{
          padding: 0,
          // '&.MuiButtonBase-root:hover': { bgcolor: 'transparent' },
          ...(underlined && { borderBottom: `1px solid ${theme.palette.divider}` })
        }}
      >
        {checkboxProps && (
          <ListItemIcon>
            <Checkbox
              edge={edge}
              tabIndex={-1}
              disableRipple
              inputProps={{ id: id || primary.toString() }}
              {...checkboxProps}
            />
          </ListItemIcon>
        )}
        <ListItemText
          primary={
            <label htmlFor={id || primary.toString()} style={{ cursor: 'pointer' }}>
              {primary}
            </label>
          }
          primaryTypographyProps={{
            variant: 'body1',
            sx: { '&:hover': { cursor: 'pointer' } },
            ...primaryProps
          }}
          secondary={secondary}
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
        primary={primary}
        primaryTypographyProps={{ variant: 'body1', ...primaryProps }}
        secondary={secondary}
        secondaryTypographyProps={secondaryProps}
      />
    </ListItem>
  );
};
