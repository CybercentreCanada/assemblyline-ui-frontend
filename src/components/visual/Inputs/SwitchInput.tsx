import type {
  ButtonProps,
  FormHelperTextProps,
  IconButtonProps,
  SwitchProps,
  TooltipProps,
  TypographyProps
} from '@mui/material';
import { Button, FormControl, FormControlLabel, Skeleton, Switch, useTheme } from '@mui/material';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo, useState } from 'react';
import { HelperText } from './components/HelperText';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

type Props = Omit<ButtonProps, 'onChange' | 'onClick' | 'value'> & {
  error?: (value: boolean) => string;
  errorProps?: FormHelperTextProps;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  label: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  tiny?: boolean;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: SwitchProps['checked'];
  onChange?: (event: React.MouseEvent<HTMLLabelElement | HTMLButtonElement, MouseEvent>, value: boolean) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

export const SwitchInput: React.FC<Props> = React.memo(
  ({
    disabled = false,

    error = () => null,
    errorProps = null,
    helperText = null,
    helperTextProps = null,
    id = null,
    label = null,
    labelProps = null,
    loading = false,
    preventDisabledColor = false,
    preventRender = false,
    readOnly = false,
    reset = false,
    resetProps = null,
    tiny = false,
    tooltip = null,
    tooltipProps = null,
    value = false,
    onChange = () => null,
    onReset = () => null,
    onError = () => null,
    ...buttonProps
  }: Props) => {
    const theme = useTheme();

    const [focused, setFocused] = useState<boolean>(false);

    const errorValue = useMemo<string>(() => error(value), [error, value]);

    return preventRender ? null : (
      <Tooltip title={loading ? null : tooltip} {...tooltipProps}>
        <FormControl size="small" fullWidth>
          <Button
            disabled={loading || disabled || readOnly}
            fullWidth
            size="small"
            onClick={event => {
              event.stopPropagation();
              event.preventDefault();
              onChange(event, !value);

              const err = error(!value);
              if (err) onError(err);
            }}
            onFocus={event => setFocused(document.activeElement === event.target)}
            onBlur={() => setFocused(false)}
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
                      '&>.Mui-disabled': { ...((preventDisabledColor || readOnly) && { color: 'inherit !important' }) }
                    }}
                  />
                )
              }
              disabled={loading || disabled || readOnly}
              label={label}
              slotProps={{
                typography: {
                  color: !disabled && errorValue ? 'error' : focused ? 'primary' : 'textPrimary',
                  marginLeft: theme.spacing(1),
                  overflow: 'hidden',
                  textAlign: 'start',
                  textOverflow: 'ellipsis',
                  variant: 'body2',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  ...((preventDisabledColor || readOnly) && { color: 'inherit !important' }),
                  ...labelProps
                }
              }}
              sx={{
                overflow: 'hidden',
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

          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
            <div>
              <ResetInput
                id={id || label}
                preventRender={loading || !reset || disabled || readOnly}
                tiny={tiny}
                onReset={onReset}
                {...resetProps}
              />
            </div>
          </div>
        </FormControl>
      </Tooltip>
    );
  }
);
