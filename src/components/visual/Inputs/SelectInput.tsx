import type { ListItemTextProps, MenuItemProps, SelectProps } from '@mui/material';
import { ListItemText, MenuItem, Select } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  useInputBlur,
  useInputChange,
  useInputFocus,
  useInputId,
  useValidation
} from 'components/visual/Inputs/hooks/inputs.hook';
import {
  HelperText,
  MenuAdornment,
  PasswordAdornment,
  ResetAcomponents/visual/Inputs/components/inputs.components
  StyledEndAdornment,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledListItemText,
  StyledRoot
} from 'components/visual/Inputs/lib/inputs.components';
import type { InputOptions, InputRuntimeState, InputValueModel } from 'components/visual/Inputs/models/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'components/visual/Inputs/models/inputs.model';
import React from 'react';

export type Option = {
  primary: ListItemTextProps['primary'];
  secondary?: ListItemTextProps['secondary'];
  value: MenuItemProps['value'] | boolean;
};

export type SelectInputProps<O extends readonly Option[]> = InputValueModel<O[number]['value'], O[number]['value']> &
  InputOptions & {
    capitalize?: boolean;
    displayEmpty?: SelectProps['displayEmpty'];
    options?: O;
  };

type SelectInputController<O extends readonly Option[]> = SelectInputProps<O> & InputRuntimeState;

const WrappedSelectInput = <O extends readonly Option[]>() => {
  const [get, setStore] = usePropStore<SelectInputController<O>>();

  const capitalize = get('capitalize');
  const disabled = get('disabled');
  const displayEmpty = get('displayEmpty');
  const endAdornment = get('endAdornment');
  const id = useInputId();
  const isMenuOpen = get('isMenuOpen');
  const isPasswordVisible = get('isPasswordVisible');
  const loading = get('loading');
  const monospace = get('monospace');
  const options = get('options');
  const overflowHidden = get('overflowHidden');
  const password = get('password');
  const rawValue = get('rawValue');
  const readOnly = get('readOnly');
  const tiny = get('tiny');
  const validationStatus = get('validationStatus');
  const value = get('value');

  const handleBlur = useInputBlur<O[number]['value']>();
  const handleChange = useInputChange<O[number]['value']>();
  const handleFocus = useInputFocus<O[number]['value']>();

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
            error={validationStatus === 'error'}
            fullWidth
            id={id}
            readOnly={readOnly}
            size="small"
            open={isMenuOpen}
            value={options?.some(o => o.value === rawValue) ? rawValue : ''}
            onChange={event => handleChange(event as React.SyntheticEvent, event.target.value, event.target.value)}
            onFocus={handleFocus}
            onBlur={e => handleBlur(e, value, value)}
            onClose={() => setStore({ isMenuOpen: false })}
            onOpen={() => setStore({ isMenuOpen: true })}
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
                        isPasswordVisible && {
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
  const { status: validationStatus, message: validationMessage } = useValidation<O[number]['value']>({
    value: value ?? '',
    rawValue: value ?? '',
    ...props
  });

  return preventRender ? null : (
    <PropProvider<SelectInputController<O>>
      initialProps={DEFAULT_INPUT_CONTROLLER_PROPS as SelectInputController<O>}
      props={{
        capitalize: false,
        displayEmpty: false,
        rawValue: value,
        hasMenuAdornment: true,
        options: [] as unknown as O,
        validationStatus,
        validationMessage,
        preventRender,
        value,
        ...props
      }}
    >
      <WrappedSelectInput />
    </PropProvider>
  );
};
