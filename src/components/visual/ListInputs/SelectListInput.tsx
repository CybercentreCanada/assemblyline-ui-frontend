import type { ListItemTextProps, MenuItemProps, SelectProps } from '@mui/material';
import { ListItemText, MenuItem, Select } from '@mui/material';
import {
  StyledHelperText,
  StyledListInputInner,
  StyledListInputLoading,
  StyledListInputText,
  StyledListInputWrapper,
  StyledListItemRoot,
  StyledListItemText,
  StyledPasswordAdornment,
  StyledResetAdornment
} from 'components/visual/ListInputs/lib/listinputs.components';
import {
  useErrorCallback,
  useInputBlur,
  useInputChange,
  useInputFocus,
  usePropID
} from 'components/visual/ListInputs/lib/listinputs.hook';
import type { ListInputProps, ListInputValues } from 'components/visual/ListInputs/lib/listinputs.model';
import { PropProvider, usePropStore } from 'components/visual/ListInputs/lib/listinputs.provider';
import React from 'react';

export type Option = {
  primary: ListItemTextProps['primary'];
  secondary?: ListItemTextProps['secondary'];
  value: MenuItemProps['value'] | boolean;
};

export type SelectListInputProps<O extends readonly Option[]> = ListInputValues<
  O[number]['value'],
  O[number]['value']
> &
  ListInputProps & {
    displayEmpty?: SelectProps['displayEmpty'];
    options?: O;
  };

const WrappedSelectListInput = <O extends readonly Option[]>() => {
  const [get, setStore] = usePropStore<SelectListInputProps<O>>();

  const capitalize = get('capitalize');
  const disabled = get('disabled');
  const displayEmpty = get('displayEmpty');
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
  const width = get('width');

  const handleBlur = useInputBlur<SelectListInputProps<O>>();
  const handleChange = useInputChange<SelectListInputProps<O>>();
  const handleFocus = useInputFocus<SelectListInputProps<O>>();

  return (
    <StyledListItemRoot>
      <StyledListInputWrapper>
        <StyledListInputInner>
          <StyledListInputText />

          {loading ? (
            <StyledListInputLoading />
          ) : (
            <>
              <StyledPasswordAdornment />
              <StyledResetAdornment />
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
                sx={{
                  maxWidth: width,
                  minWidth: width,
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
                    <StyledListItemText
                      primary={option.primary ? option.primary : '\u00A0'}
                      secondary={option.secondary}
                    />
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
        </StyledListInputInner>

        <StyledHelperText />
      </StyledListInputWrapper>
    </StyledListItemRoot>
  );
};

export const SelectListInput = <O extends readonly Option[]>({
  preventRender = false,
  value,
  ...props
}: SelectListInputProps<O>) => {
  const errorMessage = useErrorCallback({ preventRender, value, ...props });

  return preventRender ? null : (
    <PropProvider<SelectListInputProps<O>>
      props={{
        capitalize: false,
        displayEmpty: false,
        errorMessage,
        inputValue: value,
        options: [] as unknown as O,
        preventRender,
        value,
        ...props
      }}
    >
      <WrappedSelectListInput<O> />
    </PropProvider>
  );
};

SelectListInput.displayName = 'SelectListInput';
