import type {
  ButtonProps,
  FormHelperTextProps,
  IconButtonProps,
  SwitchProps,
  TooltipProps,
  TypographyProps
} from '@mui/material';
import { Button, FormControl, FormControlLabel, Skeleton, Switch, useTheme } from '@mui/material';
import { HelperText } from 'components/visual/Inputs/components/HelperText';
import { PasswordInput } from 'components/visual/Inputs/components/PasswordInput';
import type { ResetInputProps } from 'components/visual/Inputs/components/ResetInput';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo, useState } from 'react';

export type SwitchInputProps = Omit<ButtonProps, 'onChange' | 'onClick' | 'value'> & {
  endAdornment?: React.ReactNode;
  error?: (value: boolean) => string;
  errorProps?: FormHelperTextProps;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  monospace?: boolean;
  password?: boolean;
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  showOverflow?: boolean;
  tiny?: boolean;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: SwitchProps['checked'];
  onChange?: (event: React.MouseEvent<HTMLLabelElement | HTMLButtonElement, MouseEvent>, value: boolean) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

export const SwitchInput: React.FC<SwitchInputProps> = React.memo(
  ({
    disabled = false,
    endAdornment = null,
    error = () => null,
    errorProps = null,
    helperText = null,
    helperTextProps = null,
    id: idProp = null,
    label: labelProp = null,
    labelProps = null,
    loading = false,
    monospace = false,
    password = false,
    preventDisabledColor = false,
    preventRender = false,
    readOnly = false,
    reset = false,
    resetProps = null,
    showOverflow = false,
    tiny = false,
    tooltip = null,
    tooltipProps = null,
    value = false,
    onBlur = () => null,
    onChange = () => null,
    onError = () => null,
    onFocus = () => null,
    onReset = () => null,
    ...buttonProps
  }: SwitchInputProps) => {
    const theme = useTheme();

    const [focused, setFocused] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(true);

    const label = useMemo<string>(() => labelProp ?? '\u00A0', [labelProp]);
    const id = useMemo<string>(() => (idProp || label).replaceAll(' ', '-'), [idProp, label]);
    const errorValue = useMemo<string>(() => error(value), [error, value]);

    const preventResetRender = useMemo<boolean>(
      () => loading || !reset || disabled || readOnly,
      [disabled, loading, readOnly, reset]
    );

    const preventPasswordRender = useMemo<boolean>(
      () => loading || !password || disabled || readOnly,
      [disabled, loading, password, readOnly]
    );

    return preventRender ? null : (
      <Tooltip title={loading ? null : tooltip} {...tooltipProps}>
        <FormControl size="small" fullWidth>
          <Button
            disabled={loading || disabled || readOnly}
            fullWidth
            color="inherit"
            size="small"
            onClick={event => {
              event.stopPropagation();
              event.preventDefault();
              onChange(event, !value);

              const err = error(!value);
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
            sx={{
              justifyContent: 'start',
              color: 'inherit',
              textTransform: 'none',
              height: '40px',
              paddingLeft: theme.spacing(2),
              ...((preventDisabledColor || readOnly) && { color: 'inherit !important' }),
              ...(tiny && {
                height: 'auto'
              })
            }}
            {...buttonProps}
          >
            <FormControlLabel
              control={
                loading ? (
                  <div>
                    <Skeleton
                      variant="circular"
                      sx={{
                        height: '24px',
                        width: '24px',
                        marginLeft: theme.spacing(0.75),
                        marginRight: theme.spacing(1.25)
                      }}
                    />
                  </div>
                ) : (
                  <Switch
                    checked={value}
                    disableFocusRipple
                    disableRipple
                    disableTouchRipple
                    size="small"
                    sx={{
                      '&>.Mui-disabled': {
                        ...((preventDisabledColor || readOnly) && { color: 'inherit !important' })
                      }
                    }}
                  />
                )
              }
              disabled={loading || disabled || readOnly}
              label={
                <div
                  style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: theme.spacing(1) }}
                >
                  <span
                    style={{
                      ...(!showOverflow && { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }),
                      ...(monospace && { fontFamily: 'monospace' }),
                      ...(password &&
                        showPassword && {
                          fontFamily: 'password',
                          WebkitTextSecurity: 'disc',
                          MozTextSecurity: 'disc',
                          textSecurity: 'disc'
                        })
                    }}
                  >
                    {label}
                  </span>
                  {endAdornment}
                </div>
              }
              slotProps={{
                typography: {
                  color: !disabled && errorValue ? 'error' : focused ? 'primary' : 'textPrimary',
                  marginLeft: theme.spacing(1),
                  textAlign: 'start',
                  variant: 'body2',
                  width: '100%',
                  ...(!showOverflow && { textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }),
                  ...((preventDisabledColor || readOnly) && { color: 'inherit !important' }),
                  ...labelProps
                }
              }}
              sx={{
                ...(!showOverflow && { overflow: 'hidden' }),
                ...(!(loading || !reset || disabled || readOnly) && { paddingRight: theme.spacing(2) })
              }}
            />
          </Button>
          <HelperText
            id={id}
            label={label}
            disabled={disabled}
            errorProps={errorProps}
            errorText={errorValue}
            helperText={helperText}
            helperTextProps={helperTextProps}
          />

          {preventPasswordRender && preventResetRender ? null : (
            <div
              style={{
                position: 'absolute',
                right: theme.spacing(0.75),
                top: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <PasswordInput
                id={id}
                preventRender={preventPasswordRender}
                tiny={tiny}
                showPassword={showPassword}
                onShowPassword={() => setShowPassword(p => !p)}
              />
              <ResetInput id={id} preventRender={preventResetRender} tiny={tiny} onReset={onReset} {...resetProps} />
            </div>
          )}
        </FormControl>
      </Tooltip>
    );
  }
);
