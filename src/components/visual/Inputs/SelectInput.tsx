import type { ListItemTextProps, MenuItemProps, SelectProps } from '@mui/material';
import { ListItemText, MenuItem, Select, useTheme } from '@mui/material';
import {
  HelperText,
  PasswordInput,
  ResetInput,
  StyledEndAdornment,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledListItemText,
  StyledRoot
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputHandlers, useInputParsedProps } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import React from 'react';

export type Option = {
  primary: ListItemTextProps['primary'];
  secondary?: ListItemTextProps['secondary'];
  value: MenuItemProps['value'] | boolean;
};

export type SelectInputProps<O extends readonly Option[]> = InputValues<O[number]['value']> &
  InputProps & {
    capitalize?: boolean;
    displayEmpty?: SelectProps['displayEmpty'];
    options?: O;
  };

const WrappedSelectInput = React.memo(<O extends readonly Option[]>() => {
  const theme = useTheme();

  const [get] = usePropStore<SelectInputProps<O>>();

  const capitalize = get('capitalize');
  const disabled = get('disabled');
  const displayEmpty = get('displayEmpty');
  const endAdornment = get('endAdornment');
  const errorMsg = get('errorMsg');
  const inputValue = get('inputValue');
  const loading = get('loading');
  const monospace = get('monospace');
  const options = get('options');
  const overflowHidden = get('overflowHidden');
  const password = get('password');
  const readOnly = get('readOnly');
  const showPassword = get('showPassword');
  const tiny = get('tiny');

  const { handleChange, handleFocus, handleBlur } = useInputHandlers<SelectInputProps<O>>();

  return (
    <StyledRoot>
      <StyledFormLabel />
      <StyledFormControl>
        {loading ? (
          <StyledInputSkeleton />
        ) : (
          <Select
            fullWidth
            size="small"
            displayEmpty={displayEmpty}
            disabled={disabled}
            readOnly={readOnly}
            value={options?.some(o => o.value === inputValue) ? inputValue : ''}
            error={!!errorMsg}
            onChange={event =>
              handleChange(
                event as React.SyntheticEvent,
                event.target.value as O[number]['value'],
                event.target.value as O[number]['value']
              )
            }
            onFocus={handleFocus}
            onBlur={handleBlur}
            renderValue={option => (
              <ListItemText
                primary={options?.find(o => o.value === option)?.primary || ''}
                sx={{ margin: 0 }}
                slotProps={{
                  primary: {
                    sx: {
                      paddingRight: '0px',
                      cursor: 'pointer',
                      ...(capitalize && { textTransform: 'capitalize' }),
                      ...(!overflowHidden && {
                        whiteSpace: 'wrap',
                        overflow: 'auto',
                        textOverflow: 'ellipsis'
                      }),
                      ...(readOnly && { cursor: 'default', userSelect: 'text' }),
                      ...(tiny && { variant: 'body2' }),
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
            MenuProps={{ sx: { maxWidth: 'min-content' } }}
            endAdornment={
              <StyledEndAdornment sx={{ marginRight: theme.spacing(2) }}>
                <PasswordInput />
                <ResetInput />
                {endAdornment}
              </StyledEndAdornment>
            }
            sx={{
              '& .MuiSelect-select': {
                ...(tiny && {
                  paddingTop: '4px !important',
                  paddingBottom: '4px !important',
                  fontSize: '14px'
                })
              }
            }}
          >
            {options.map((option, i) => (
              <MenuItem key={i} value={option.value as MenuItemProps['value']}>
                <StyledListItemText primary={option.primary} secondary={option.secondary} />
              </MenuItem>
            ))}
          </Select>
        )}
        <HelperText />
      </StyledFormControl>
    </StyledRoot>
  );
});

export const SelectInput = <O extends readonly Option[]>({
  capitalize = false,
  displayEmpty = false,
  options = [] as unknown as O,
  preventRender = false,
  ...props
}: SelectInputProps<O>) => {
  const parsedProps = useInputParsedProps({ ...props, capitalize, displayEmpty, options, preventRender });

  return preventRender ? null : (
    <PropProvider<SelectInputProps<O>> props={parsedProps}>
      <WrappedSelectInput />
    </PropProvider>
  );
};
