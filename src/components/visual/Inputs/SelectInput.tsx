import type { ListItemTextProps, MenuItemProps, SelectProps } from '@mui/material';
import { InputAdornment, ListItemText, MenuItem, Select, useTheme } from '@mui/material';
import {
  HelperText,
  PasswordInput,
  ResetInput,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
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
    options?: O;
    displayEmpty?: SelectProps['displayEmpty'];
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
  const password = get('password');
  const readOnly = get('readOnly');
  const showPassword = get('showPassword');
  const tiny = get('tiny');
  const value = get('value');

  // const handleChange = useCallback(
  //   (event: React.SyntheticEvent, newValue: O[number]['value']) => {
  //     setStore(s => {
  //       const err = s.error(newValue);
  //       s.onError(err);
  //       if (!err) s.onChange(event, newValue);
  //       return { ...s, inputValue: newValue, errorMsg: err };
  //     });
  //   },
  //   [setStore]
  // );

  // const handleFocus = useCallback(
  //   (event: React.FocusEvent) => {
  //     setStore(s => {
  //       s.onFocus(event);
  //       return { ...s, focused: !s.readOnly && !s.disabled && document.activeElement === event.target };
  //     });
  //   },
  //   [setStore]
  // );

  // const handleBlur = useCallback(
  //   (event: React.FocusEvent) => {
  //     setStore(s => {
  //       s.onBlur(event);
  //       return { ...s, focused: false, inputValue: null };
  //     });
  //   },
  //   [setStore]
  // );

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
            value={options?.some(o => o.value === (inputValue ?? value)) ? (inputValue ?? value) : ''}
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
            variant="outlined"
            MenuProps={{ sx: { maxWidth: 'min-content' } }}
            inputProps={{
              sx: {
                display: 'flex',
                alignItems: 'center',
                ...(tiny && {
                  paddingTop: theme.spacing(0.25),
                  paddingBottom: theme.spacing(0.25)
                })
              }
            }}
            renderValue={option => (
              <ListItemText
                primary={options?.find(o => o.value === option)?.primary || ''}
                slotProps={{
                  primary: {
                    sx: {
                      paddingRight: '0px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
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
            endAdornment={
              !endAdornment && !password ? null : (
                <InputAdornment position="end" style={{ marginRight: theme.spacing(2) }}>
                  <PasswordInput />
                  <ResetInput />
                  {endAdornment}
                </InputAdornment>
              )
            }
          >
            {options.map((option, i) => (
              <MenuItem
                key={i}
                value={option.value as MenuItemProps['value']}
                sx={{
                  '&>div': { margin: 0, cursor: 'pointer !important' },
                  ...(capitalize && { textTransform: 'capitalize' })
                }}
              >
                <ListItemText
                  primary={option.primary}
                  secondary={option.secondary}
                  slotProps={{
                    primary: {
                      sx: {
                        overflow: 'auto',
                        textOverflow: 'initial',
                        whiteSpace: 'normal',
                        ...(tiny && { variant: 'body2' }),
                        ...(capitalize && { textTransform: 'capitalize' })
                      }
                    },
                    secondary: {
                      sx: {
                        overflow: 'auto',
                        textOverflow: 'initial',
                        whiteSpace: 'normal',
                        ...(tiny && { variant: 'body2' })
                      }
                    }
                  }}
                />
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
  options = [] as unknown as O,
  preventRender = false,
  ...props
}: SelectInputProps<O>) => {
  const parsedProps = useInputParsedProps({ ...props, options, preventRender });

  return preventRender ? null : (
    <PropProvider<SelectInputProps<O>> props={parsedProps}>
      <WrappedSelectInput />
    </PropProvider>
  );
};
