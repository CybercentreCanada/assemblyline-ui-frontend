import type {
  CheckboxProps,
  IconButtonProps,
  ListItemButtonProps,
  ListItemProps,
  ListItemTextProps
} from '@mui/material';
import { Checkbox, ListItem, ListItemButton, ListItemIcon, useTheme } from '@mui/material';
import type { AnchorProps } from 'components/core/TableOfContent/Anchor';
import { Anchor } from 'components/core/TableOfContent/Anchor';
import type { ResetListInputProps } from 'components/visual/ListInputs/components/ResetListInput';
import { ResetListInput } from 'components/visual/ListInputs/components/ResetListInput';
import React, { type FC, type MouseEvent } from 'react';
import { ListItemText } from './ListItemText';

export type ListHeaderProps = Omit<ListItemProps, 'onChange'> & {
  anchor?: boolean;
  anchorProps?: AnchorProps;
  buttonProps?: ListItemButtonProps;
  checkboxProps?: CheckboxProps;
  checked?: CheckboxProps['checked'];
  disabled?: boolean;
  divider?: boolean;
  edge?: CheckboxProps['edge'];
  indeterminate?: CheckboxProps['indeterminate'];
  preventRender?: boolean;
  primary: React.ReactNode;
  primaryProps?: ListItemTextProps['primaryTypographyProps'];
  reset?: boolean;
  resetProps?: ResetListInputProps;
  secondary?: React.ReactNode;
  secondaryProps?: ListItemTextProps['secondaryTypographyProps'];
  onChange?: (
    event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    checked: boolean,
    indeterminate: boolean
  ) => void;
  onReset?: IconButtonProps['onClick'];
};

export const ListHeader: FC<ListHeaderProps> = ({
  anchor = false,
  anchorProps = null,
  buttonProps,
  checkboxProps,
  checked = null,
  disabled = false,
  divider = false,
  edge = 'end',
  id = null,
  indeterminate = null,
  preventRender = false,
  primary = null,
  primaryProps = null,
  reset = null,
  resetProps = null,
  secondary = null,
  secondaryProps = null,
  onChange = null,
  onReset = () => null,
  ...listItemProps
}) => {
  const theme = useTheme();

  return preventRender ? null : (
    <Anchor anchor={id} label={primary.toString()} disabled={!anchor} {...anchorProps}>
      <ListItem
        key={id || primary.toString()}
        disableGutters
        disablePadding
        disabled={disabled}
        {...listItemProps}
        sx={{ ...(divider && { borderBottom: `1px solid ${theme.palette.divider}` }), ...listItemProps?.sx }}
      >
        {onChange === null ? (
          <>
            {checked !== null && (
              <ListItemIcon>
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  disableRipple
                  edge={edge}
                  indeterminate={indeterminate}
                  inputProps={{ id: id || primary.toString(), ...checkboxProps?.inputProps }}
                  sx={{ cursor: 'initial', ...checkboxProps?.sx }}
                  tabIndex={-1}
                  {...checkboxProps}
                />
              </ListItemIcon>
            )}
            <ListItemText
              id={id}
              primary={primary}
              primaryTypographyProps={{
                variant: 'body1',
                sx: { ...(!checked && !indeterminate && { opacity: 0.38 }), ...primaryProps?.sx },
                ...primaryProps
              }}
              secondary={secondary}
              secondaryTypographyProps={{
                sx: { ...(!checked && !indeterminate && { opacity: 0.38 }), ...secondaryProps?.sx },
                ...secondaryProps
              }}
            />
          </>
        ) : (
          <ListItemButton
            role={undefined}
            dense
            disableGutters
            disabled={disabled}
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              onChange(event, checked, indeterminate);
            }}
            {...buttonProps}
            sx={{
              padding: 0,
              ...(divider && { borderBottom: `1px solid ${theme.palette.divider}` }),
              ...buttonProps?.sx
            }}
          >
            {checked !== null && (
              <ListItemIcon>
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  disableRipple
                  edge={edge}
                  indeterminate={indeterminate}
                  inputProps={{ id: id || primary.toString(), ...checkboxProps?.inputProps }}
                  sx={{ ...checkboxProps?.sx }}
                  tabIndex={-1}
                  {...checkboxProps}
                />
              </ListItemIcon>
            )}
            <ListItemText
              id={id}
              primary={primary}
              primaryTypographyProps={{
                variant: 'body1',
                sx: { ...(!checked && !indeterminate && { opacity: 0.38 }), ...primaryProps?.sx },
                ...primaryProps
              }}
              secondary={secondary}
              secondaryTypographyProps={{
                sx: { ...(!checked && !indeterminate && { opacity: 0.38 }), ...secondaryProps?.sx },
                ...secondaryProps
              }}
              cursor="pointer"
            />
            <ResetListInput
              id={id || primary.toString()}
              preventRender={!reset || disabled}
              onReset={onReset}
              sx={{ opacity: '1 !important' }}
              {...resetProps}
            />
          </ListItemButton>
        )}
      </ListItem>
    </Anchor>
  );
};
