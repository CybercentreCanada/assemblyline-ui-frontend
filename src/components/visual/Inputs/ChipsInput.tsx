import type { AutocompleteProps } from '@mui/material';
import { Autocomplete, InputAdornment, TextField, useTheme } from '@mui/material';
import CustomChip from 'components/visual/CustomChip';
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
import type { ElementType } from 'react';
import React, { useMemo, useState } from 'react';

export type ChipsInputProps = Omit<
  AutocompleteProps<string[], boolean, boolean, boolean, ElementType>,
  'isOptionEqualToValue' | 'renderInput' | 'options' | 'onChange' | 'value' | 'defaultValue'
> &
  InputProps<string[]> & {
    isOptionEqualToValue?: (option: string, value: string) => boolean;
    options?: AutocompleteProps<string, boolean, boolean, boolean, ElementType>['options'];
  };

const WrappedChipsInput = (props: ChipsInputProps) => {
  const theme = useTheme();

  const {
    autoComplete,
    disabled,
    endAdornment = null,
    error = () => '',
    isOptionEqualToValue = () => null,
    loading = false,
    monospace = false,
    options = [],
    password = false,
    placeholder = null,
    preventRender = false,
    readOnly = false,
    rootProps = null,
    startAdornment = null,
    tiny = false,
    value,
    onBlur = () => null,
    onChange = () => null,
    onError = () => null,
    onFocus = () => null
  } = props;

  const [focused, setFocused] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);

  const errorValue = useMemo<string>(() => error(value), [error, value]);
  const preventPasswordRender = usePreventPassword(props);
  const preventResetRender = usePreventReset(props);

  return preventRender ? null : (
    <div {...rootProps} style={{ textAlign: 'left', ...rootProps?.style }}>
      <StyledFormLabel props={props} focused={focused} />
      <StyledFormControl props={props}>
        {loading ? (
          <StyledInputSkeleton props={props} />
        ) : (
          <Autocomplete
            autoComplete={autoComplete}
            id={getAriaLabel(props)}
            freeSolo
            multiple
            size="small"
            value={value}
            options={options}
            disabled={disabled}
            readOnly={readOnly}
            isOptionEqualToValue={isOptionEqualToValue ?? ((option, value) => option === value)}
            onChange={(e, v: string[], p) => {
              onChange(e, v, p);

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
            renderInput={params => (
              <TextField
                {...params}
                id={getAriaLabel(props)}
                variant="outlined"
                error={!!errorValue}
                type={password && showPassword ? 'password' : 'text'}
                placeholder={placeholder}
                {...(readOnly && !disabled && { focused: null })}
                slotProps={{
                  input: {
                    ...params?.InputProps,
                    ...(!preventResetRender && { style: { paddingRight: '85px' } }),
                    'aria-describedby': getAriaDescribedBy(props),
                    startAdornment: (
                      <>
                        {startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>}
                        {params?.InputProps?.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {preventPasswordRender && preventResetRender && !endAdornment ? null : (
                          <InputAdornment
                            position="end"
                            sx={{
                              position: 'absolute',
                              right: '37px',
                              top: '50%',
                              transform: 'translate(0, -50%)',
                              ...(!focused && { visibility: 'hidden' })
                            }}
                            style={{ display: 'hidden' }}
                          >
                            <PasswordInput
                              props={props}
                              showPassword={showPassword}
                              onShowPassword={() => setShowPassword(p => !p)}
                            />
                            <ResetInput props={props} />
                            {endAdornment}
                          </InputAdornment>
                        )}
                        {params?.InputProps?.endAdornment}
                      </>
                    )
                  }
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    ...(tiny && {
                      paddingTop: '2px !important',
                      paddingBottom: '2px !important',
                      fontSize: '14px'
                    }),
                    ...(readOnly && !disabled && { cursor: 'default' })
                  },

                  '& .MuiInputBase-input': {
                    ...(readOnly && !disabled && { cursor: 'default' }),
                    ...(monospace && { fontFamily: 'monospace' })
                  },

                  '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                    ...(readOnly &&
                      !disabled && {
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                      })
                  }
                }}
              />
            )}
            renderValue={(values: string[], getItemProps) =>
              values.map((option: string, index: number) => {
                const { key, ...itemProps } = getItemProps({ index });
                return (
                  <CustomChip
                    key={key}
                    label={option}
                    wrap
                    {...itemProps}
                    onDelete={disabled ? undefined : itemProps.onDelete}
                    sx={{
                      ...(readOnly &&
                        !disabled && {
                          cursor: 'default'
                        }),
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
                );
              })
            }
          />
        )}
        <HelperText props={props} />
      </StyledFormControl>
    </div>
  );
};

export const ChipsInput: (props: ChipsInputProps) => React.ReactNode = React.memo(WrappedChipsInput);
