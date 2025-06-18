import type {
  FormHelperTextProps,
  IconButtonProps,
  TextFieldProps,
  TooltipProps,
  TypographyProps
} from '@mui/material';
import { FormControl, InputAdornment, InputLabel, Skeleton, TextField, Typography, useTheme } from '@mui/material';
import type { ResetInputProps } from 'components/visual/Inputs/components/ResetInput';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo, useState } from 'react';

export type TextAreaInputProps = Omit<TextFieldProps, 'rows' | 'onChange' | 'error'> & {
  endAdornment?: TextFieldProps['InputProps']['endAdornment'];
  error?: (value: string) => string;
  errorProps?: FormHelperTextProps;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  monospace?: boolean;
  placeholder?: TextFieldProps['InputProps']['placeholder'];
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
  rows: TextFieldProps['rows'];
  startAdornment?: TextFieldProps['InputProps']['startAdornment'];
  tiny?: boolean;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, value: string) => void;
  onReset?: IconButtonProps['onClick'];
  onError?: (error: string) => void;
};

export const TextAreaInput: React.FC<TextAreaInputProps> = React.memo(
  ({
    disabled,
    endAdornment = null,
    error = () => null,
    errorProps = null,
    helperText = null,
    helperTextProps = null,
    id: idProp = null,
    label: labelProp = null,
    labelProps,
    loading = false,
    monospace = false,
    placeholder = null,
    preventDisabledColor = false,
    preventRender = false,
    readOnly = false,
    reset = false,
    resetProps = null,
    rootProps = null,
    rows = 1,
    startAdornment = null,
    tiny = false,
    tooltip = null,
    tooltipProps = null,
    value,
    onBlur = () => null,
    onChange = () => null,
    onError = () => null,
    onFocus = () => null,
    onReset = () => null,
    ...textFieldProps
  }: TextAreaInputProps) => {
    const theme = useTheme();

    const [focused, setFocused] = useState<boolean>(false);

    const label = useMemo<string>(() => labelProp ?? '\u00A0', [labelProp]);
    const id = useMemo<string>(() => (idProp || label).replaceAll(' ', '-'), [idProp, label]);

    const errorValue = useMemo<string>(() => error(value), [error, value]);

    return preventRender ? null : (
      <div {...rootProps} style={{ textAlign: 'left', ...rootProps?.style }}>
        <Tooltip title={tooltip} {...tooltipProps}>
          <Typography
            color={!disabled && errorValue ? 'error' : focused ? 'primary' : 'textSecondary'}
            component={InputLabel}
            gutterBottom
            htmlFor={id}
            variant="body2"
            whiteSpace="nowrap"
            {...labelProps}
            children={label}
            sx={{
              ...labelProps?.sx,
              ...(disabled &&
                !preventDisabledColor && {
                  WebkitTextFillColor:
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
                })
            }}
          />
        </Tooltip>
        <FormControl fullWidth>
          {loading ? (
            <Skeleton
              sx={{ height: `calc(23px * ${rows} + 17px)`, transform: 'unset', ...(tiny && { height: '28px' }) }}
            />
          ) : (
            <TextField
              id={id}
              fullWidth
              size="small"
              multiline
              rows={rows}
              margin="dense"
              variant="outlined"
              value={value}
              disabled={disabled}
              error={!!errorValue}
              {...(readOnly && !disabled && { focused: null })}
              helperText={disabled ? null : errorValue || helperText}
              slotProps={{
                formHelperText: disabled
                  ? null
                  : errorValue
                    ? {
                        variant: 'outlined',
                        sx: { color: theme.palette.error.main, ...errorProps?.sx },
                        ...errorProps
                      }
                    : helperText
                      ? {
                          variant: 'outlined',
                          sx: { color: theme.palette.text.secondary, ...helperTextProps?.sx },
                          ...errorProps
                        }
                      : null,

                input: {
                  inputProps: {
                    ...(tiny && { sx: { padding: '2.5px 4px 2.5px 8px' } })
                  },
                  placeholder: placeholder,
                  readOnly: readOnly,
                  sx: {
                    paddingRight: '9px',
                    ...(tiny && { '& .MuiInputBase-root': { padding: '2px !important', fontSize: '14px' } })
                  },
                  startAdornment: (
                    <>{startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>}</>
                  ),
                  endAdornment: (
                    <>
                      {loading || !reset || disabled || readOnly ? null : (
                        <InputAdornment position="end">
                          <ResetInput
                            id={id}
                            preventRender={loading || !reset || disabled || readOnly}
                            tiny={tiny}
                            onReset={onReset}
                            {...resetProps}
                          />
                        </InputAdornment>
                      )}
                      {endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>}
                    </>
                  )
                }
              }}
              onChange={event => {
                onChange(event, event.target.value);

                const err = error(event.target.value);
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
                margin: 0,
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
              {...textFieldProps}
            />
          )}
        </FormControl>
      </div>
    );
  }
);
