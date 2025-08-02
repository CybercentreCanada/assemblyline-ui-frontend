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
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import { isValidValue } from 'components/visual/Inputs/lib/inputs.utils';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

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

const WrappedSelectInput = <O extends readonly Option[]>() => {
  const theme = useTheme();

  const [get, setStore] = usePropStore<SelectInputProps<O>>();

  const capitalize = get(s => s.capitalize);
  const disabled = get(s => s.disabled);
  const displayEmpty = get(s => s.displayEmpty);
  const endAdornment = get(s => s.endAdornment);
  const errorMsg = get(s => s.errorMsg);
  const inputValue = get(s => s.inputValue);
  const loading = get(s => s.loading);
  const monospace = get(s => s.monospace);
  const options = get(s => s.options);
  const password = get(s => s.password);
  const readOnly = get(s => s.readOnly);
  const showPassword = get(s => s.showPassword);
  const tiny = get(s => s.tiny);
  const value = get(s => s.value);

  const handleChange = useCallback(
    (event: React.SyntheticEvent, newValue: O[number]['value']) => {
      setStore(s => {
        const err = s.error(newValue);
        s.onError(err);
        if (!err) s.onChange(event, newValue);
        return { ...s, inputValue: newValue, errorMsg: err };
      });
    },
    [setStore]
  );

  const handleFocus = useCallback(
    (event: React.FocusEvent) => {
      setStore(s => {
        s.onFocus(event);
        return { ...s, focused: !s.readOnly && !s.disabled && document.activeElement === event.target };
      });
    },
    [setStore]
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent) => {
      setStore(s => {
        s.onBlur(event);
        return { ...s, focused: false, inputValue: null };
      });
    },
    [setStore]
  );

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
            onChange={event => handleChange(event as React.SyntheticEvent, event.target.value as O[number]['value'])}
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
                  <ResetInput onChange={handleChange} />
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
};

export const SelectInput: <O extends readonly Option[]>(props: SelectInputProps<O>) => React.ReactNode = React.memo(
  <O extends readonly Option[]>({
    error = () => '',
    options = [] as unknown as O,
    preventRender = false,
    required = false,
    value,
    ...props
  }: SelectInputProps<O>) => {
    const { t } = useTranslation('inputs');

    const newError = useCallback(
      (val: O[number]['value']): string => {
        const err = error(val);
        if (err) return err;
        if (required && !isValidValue(val)) return t('error.required');
        return '';
      },
      [error, required, t]
    );

    return preventRender ? null : (
      <PropProvider<SelectInputProps<O>>
        data={{
          ...props,
          error: newError,
          errorMsg: newError(value),
          options,
          required,
          value
        }}
      >
        <WrappedSelectInput<O> />
      </PropProvider>
    );
  }
);
