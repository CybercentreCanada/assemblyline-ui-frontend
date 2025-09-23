import type { ListItemTextProps, MenuItemProps, SelectProps } from '@mui/material';
import { ListItemText, MenuItem, Select } from '@mui/material';
import {
  HelperText,
  MenuAdornment,
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
  useErrorCallback,
  useInputBlur,
  useInputChange,
  useInputFocus,
  usePropID
} from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import React from 'react';

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
  const [get, setStore] = usePropStore<SelectInputProps<O>>();

  const capitalize = get('capitalize');
  const disabled = get('disabled');
  const displayEmpty = get('displayEmpty');
  const endAdornment = get('endAdornment');
  const errorMessage = get('errorMessage');
  const id = usePropID();
  const inputValue = get('inputValue');
  const loading = get('loading');
  const monospace = get('monospace');
  const options = get('options');
  const overflowHidden = get('overflowHidden');
  const password = get('password');
  const readOnly = get('readOnly');
  const showMenu = get('showMenu');
  const showPassword = get('showPassword');
  const tiny = get('tiny');
  const value = get('value');

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
            error={!!errorMessage}
            fullWidth
            id={id}
            readOnly={readOnly}
            size="small"
            open={showMenu}
            value={options?.some(o => o.value === inputValue) ? inputValue : ''}
            onChange={event => handleChange(event as React.SyntheticEvent, event.target.value, event.target.value)}
            onFocus={handleFocus}
            onBlur={e => handleBlur(e, value, value)}
            onClose={() => setStore({ showMenu: false })}
            onOpen={() => setStore({ showMenu: true })}
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
              <StyledEndAdornment>
                {endAdornment}
                <PasswordAdornment />
                <ResetAdornment />
                <MenuAdornment />
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
            {options.map((option, i) => (
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

export const SelectInput = <O extends readonly Option[]>({
  preventRender = false,
  value,
  ...props
}: SelectInputProps<O>) => {
  const errorMessage = useErrorCallback({ preventRender, value, ...props });

  return preventRender ? null : (
    <PropProvider<SelectInputProps<O>>
      props={{
        capitalize: false,
        displayEmpty: false,
        errorMessage,
        inputValue: value,
        menuAdornment: true,
        options: [] as unknown as O,
        preventRender,
        value,
        ...props
      }}
    >
      <WrappedSelectInput />
    </PropProvider>
  );
};
