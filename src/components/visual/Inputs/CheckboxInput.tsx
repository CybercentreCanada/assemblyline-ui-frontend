import type { ButtonProps, FormHelperTextProps, IconButtonProps, TooltipProps, TypographyProps } from '@mui/material';
import { Button, Checkbox, FormControl, FormControlLabel, Skeleton, useTheme } from '@mui/material';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo, useState } from 'react';
import type { ExpandInputProps } from './components/ExpandInput';
import { ExpandInput } from './components/ExpandInput';
import { HelperText } from './components/HelperText';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

export type CheckboxInputProps = Omit<ButtonProps, 'onChange' | 'onClick' | 'value'> & {
  divider?: boolean;
  endAdornment?: React.ReactNode;
  error?: (value: boolean) => string;
  errorProps?: FormHelperTextProps;
  expand?: boolean;
  expandProps?: ExpandInputProps;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  indeterminate?: boolean;
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
  value: boolean;
  onExpand?: IconButtonProps['onClick'];
  onChange?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.FormEvent<HTMLButtonElement>,
    value: boolean
  ) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

export const CheckboxInput: React.FC<CheckboxInputProps> = React.memo(
  ({
    disabled = false,
    divider = false,
    endAdornment = null,
    error = () => null,
    errorProps = null,
    expand = null,
    expandProps = null,
    helperText = null,
    helperTextProps = null,
    id: idProp = null,
    indeterminate = false,
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
    onExpand = () => null,
    onChange = () => null,
    onReset = () => null,
    onError = () => null,
    ...buttonProps
  }: CheckboxInputProps) => {
    const theme = useTheme();

    const [focused, setFocused] = useState<boolean>(false);

    const id = useMemo<string>(() => (idProp || label).replaceAll(' ', '-'), [idProp, label]);

    const errorValue = useMemo<string>(() => error(value), [error, value]);

    return preventRender ? null : (
      <Tooltip title={loading ? null : tooltip} {...tooltipProps}>
        <FormControl
          size="small"
          fullWidth
          sx={{ ...(divider && { borderBottom: `1px solid ${theme.palette.divider}` }) }}
        >
          <Button
            color="inherit"
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
                  <Checkbox
                    checked={value}
                    indeterminate={indeterminate}
                    disableFocusRipple
                    disableRipple
                    disableTouchRipple
                    size="small"
                    sx={{
                      ...(tiny && { paddingTop: theme.spacing(0.25), paddingBottom: theme.spacing(0.25) }),
                      ...((preventDisabledColor || readOnly) && { color: 'inherit !important' })
                    }}
                  />
                )
              }
              disabled={loading || disabled || readOnly}
              label={
                <div
                  style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: theme.spacing(1) }}
                >
                  <span style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{label}</span>
                  {endAdornment}
                </div>
              }
              slotProps={{
                typography: {
                  color: !disabled && errorValue ? 'error' : focused ? 'primary' : 'textPrimary',
                  marginLeft: theme.spacing(1.25),
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
            <ResetInput
              id={id}
              preventRender={loading || !reset || disabled || readOnly}
              tiny={tiny}
              onReset={onReset}
              {...resetProps}
            />
            <ExpandInput id={id} open={expand} onExpand={onExpand} {...expandProps} />
          </div>
        </FormControl>
      </Tooltip>
    );
  }
);
