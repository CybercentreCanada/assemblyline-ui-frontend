import type { ListItemTextProps, MenuItemProps, SelectProps } from '@mui/material';
import { IconButton, ListItemText, MenuItem, Select, useTheme } from '@mui/material';
import {
  HelperText,
  PasswordAdornment,
  ResetAdornment,
  StyledEndAdornment,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledListItemText,
  StyledRoot
} from 'components/visual/Inputs/lib/inputs.components';
import {
  useErrorMessage,
  useInputBlur,
  useInputChange,
  useInputFocus,
  usePropID
} from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import React, { useState } from 'react';

export type Option = {
  primary: ListItemTextProps['primary'];
  secondary?: ListItemTextProps['secondary'];
  value: MenuItemProps['value'] | boolean;
};

export type SelectInputProps<O extends readonly Option[]> = InputValues<O[number]['value'], O[number]['value']> &
  InputProps & {
    capitalize?: boolean;
    displayEmpty?: SelectProps['displayEmpty'];
    options?: O;
  };

const WrappedSelectInput = <O extends readonly Option[]>() => {
  const theme = useTheme();

  const [get] = usePropStore<SelectInputProps<O>>();

  const capitalize = get('capitalize');
  const disabled = get('disabled');
  const displayEmpty = get('displayEmpty');
  const endAdornment = get('endAdornment');
  const errorMsg = useErrorMessage();
  const id = usePropID();
  const inputValue = get('inputValue');
  const loading = get('loading');
  const monospace = get('monospace');
  const options = get('options') ?? [];
  const overflowHidden = get('overflowHidden');
  const password = get('password');
  const readOnly = get('readOnly');
  const resetProps = get('resetProps');
  const showPassword = get('showPassword');
  const tiny = get('tiny');

  const [open, setOpen] = useState<boolean>(false);

  const handleBlur = useInputBlur<SelectInputProps<O>>();
  const handleChange = useInputChange<SelectInputProps<O>>();
  const handleFocus = useInputFocus<SelectInputProps<O>>();

  return (
    <StyledRoot>
      <StyledFormLabel />
      <StyledFormControl>
        {loading ? (
          <StyledInputSkeleton />
        ) : (
          <Select
            disabled={disabled}
            displayEmpty={displayEmpty}
            error={!!errorMsg}
            fullWidth
            id={id}
            readOnly={readOnly}
            size="small"
            open={open}
            value={options?.some(o => o.value === inputValue) ? inputValue : ''}
            onChange={event => handleChange(event as React.SyntheticEvent, event.target.value, event.target.value)}
            onFocus={handleFocus}
            onBlur={e => handleBlur(e)}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            renderValue={option => (
              <ListItemText
                primary={options?.find(o => o.value === option)?.primary || ''}
                sx={{ margin: 0 }}
                slotProps={{
                  primary: {
                    ...(tiny && { variant: 'body2' }),
                    sx: {
                      paddingRight: '0px',
                      cursor: 'pointer',
                      ...(disabled && { cursor: 'default', userSelect: 'text' }),
                      ...(capitalize && { textTransform: 'capitalize' }),
                      ...(!overflowHidden && {
                        whiteSpace: 'wrap',
                        overflow: 'auto',
                        textOverflow: 'ellipsis'
                      }),
                      ...(readOnly && { cursor: 'default', userSelect: 'text' }),
                      ...(monospace && { fontFamily: 'monospace' }),
                      ...(password &&
                        showPassword && {
                          fontFamily: 'password',
                          WebkitTextSecurity: 'disc',
                          MozTextSecurity: 'disc',
                          textSecurity: 'disc'
                        })
                    }
                  }
                }}
              />
            )}
            slotProps={{ input: { id: id } }}
            MenuProps={{ sx: { maxWidth: 'min-content' } }}
            IconComponent={() => null}
            endAdornment={
              <StyledEndAdornment preventRender={false}>
                <PasswordAdornment />
                <ResetAdornment />
                {endAdornment}

                <IconButton
                  aria-label={`${id}-select-menu`}
                  color="secondary"
                  type="button"
                  tabIndex={-1}
                  onClick={() => setOpen(true)}
                  {...resetProps}
                  sx={{
                    padding: tiny ? theme.spacing(0.75) : theme.spacing(1),
                    transition: theme.transitions.create('transform', {
                      duration: theme.transitions.duration.shortest
                    }),
                    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                    ...resetProps?.sx
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 8 L12 20 L24 8 Z" />
                  </svg>
                </IconButton>
              </StyledEndAdornment>
            }
            sx={{
              '&.MuiInputBase-root': {
                paddingRight: '9px',
                ...(!tiny && { minHeight: '40px' })
              },
              '& .MuiSelect-select': {
                padding: '8px 8px 8px 14px !important',
                ...(tiny && {
                  padding: '4.5px 8px 4.5px 14px !important'
                })
              }
            }}
          >
            {options?.map((option, i) => (
              <MenuItem key={i} value={option.value as MenuItemProps['value']}>
                <StyledListItemText primary={option.primary ? option.primary : '\u00A0'} secondary={option.secondary} />
              </MenuItem>
            ))}
          </Select>
        )}
        <HelperText />
      </StyledFormControl>
    </StyledRoot>
  );
};

export const SelectInput = <O extends readonly Option[]>({ preventRender = false, ...props }: SelectInputProps<O>) => {
  return preventRender ? null : (
    <PropProvider<SelectInputProps<O>>
      props={{ capitalize: false, displayEmpty: false, options: [] as unknown as O, preventRender, ...props }}
    >
      <WrappedSelectInput />
    </PropProvider>
  );
};
