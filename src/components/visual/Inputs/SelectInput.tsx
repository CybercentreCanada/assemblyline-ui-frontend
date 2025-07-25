import type { ListItemTextProps, MenuItemProps, SelectProps } from '@mui/material';
import { InputAdornment, ListItemText, MenuItem, Select, useTheme } from '@mui/material';
import { HelperText } from 'components/visual/Inputs/components/HelperText';
import {
  getAriaDescribedBy,
  getAriaLabel,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  usePreventPassword,
  usePreventReset
} from 'components/visual/Inputs/components/InputComponents';
import { PasswordInput } from 'components/visual/Inputs/components/PasswordInput';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import type { InputProps } from 'components/visual/Inputs/models/Input';
import React, { useState } from 'react';

export type Option = {
  primary: ListItemTextProps['primary'];
  secondary?: ListItemTextProps['secondary'];
  value: MenuItemProps['value'] | boolean;
};

export type SelectInputProps<O extends Option[] = []> = Omit<SelectProps, 'error' | 'options' | 'value' | 'onChange'> &
  InputProps<O[number]['value']> & {
    capitalize?: boolean;
    options: O;
  };

const WrappedSelectInput = <O extends Option[]>({ ...props }: SelectInputProps<O>) => {
  const theme = useTheme();

  return null;

  const {
    capitalize = false,
    disabled,
    displayEmpty = false,
    endAdornment = null,
    error = () => '',
    loading = false,
    monospace = false,
    options = null,
    password = false,
    preventRender = false,
    readOnly = false,
    rootProps = null,
    tiny = false,
    value = null,
    onBlur = () => null,
    onChange = () => null,
    onError = () => null,
    onFocus = () => null
  } = props;

  const [focused, setFocused] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);

  const preventPasswordRender = usePreventPassword(props);
  const preventResetRender = usePreventReset(props);

  return preventRender ? null : (
    <div {...rootProps} style={{ textAlign: 'left', ...rootProps?.style }}>
      <StyledFormLabel props={props} focused={focused} />
      <StyledFormControl props={props}>
        {loading ? (
          <StyledInputSkeleton props={props} />
        ) : (
          <Select
            aria-describedby={getAriaDescribedBy(props)}
            disabled={disabled}
            displayEmpty={displayEmpty}
            fullWidth
            readOnly={readOnly}
            size="small"
            value={options?.some(o => o.value === value) ? value : ''}
            variant="outlined"
            onChange={event => {
              const v = event.target.value as string;
              onChange(event, v);

              const err = error(v);
              if (err) onError(err);
            }}
            onFocus={(event, ...other) => {
              setFocused(!readOnly && !disabled && document.activeElement === event.target);
              onFocus(event, ...other);
            }}
            onBlur={(event, ...other) => {
              setFocused(false);
              onBlur(event, ...other);
            }}
            MenuProps={{ sx: { maxWidth: 'min-content' } }}
            inputProps={{
              id: getAriaLabel(props),
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
                      ...(readOnly && { cursor: 'default', userSelect: 'text' })
                    },
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
                }}
                sx={{
                  margin: 0,
                  ...(readOnly && { marginLeft: '6px' }),
                  ...(monospace && { fontFamily: 'monospace' }),
                  ...(password &&
                    showPassword && {
                      fontFamily: 'password',
                      WebkitTextSecurity: 'disc',
                      MozTextSecurity: 'disc',
                      textSecurity: 'disc'
                    })
                }}
              />
            )}
            endAdornment={
              preventPasswordRender && preventResetRender && !endAdornment ? null : (
                <InputAdornment position="end" style={{ marginRight: theme.spacing(2) }}>
                  <PasswordInput
                    props={props}
                    showPassword={showPassword}
                    onShowPassword={() => setShowPassword(p => !p)}
                  />
                  <ResetInput props={props} />
                  {endAdornment}
                </InputAdornment>
              )
            }
          >
            {/* {hasEmpty && <MenuItem value={null} sx={{ height: '36px' }}></MenuItem>} */}
            {options?.map((option, i) => (
              <MenuItem
                key={i}
                value={option.value as unknown as MenuItemProps['value']}
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
        <HelperText props={props} />
      </StyledFormControl>
    </div>
  );
};

export const SelectInput: <O extends Option[]>(props: SelectInputProps<O>) => React.ReactNode =
  React.memo(WrappedSelectInput);
