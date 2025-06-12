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
import { useTranslation } from 'react-i18next';

export type TextAreaInputProps = Omit<TextFieldProps, 'rows' | 'onChange' | 'error'> & {
  endAdornment?: TextFieldProps['InputProps']['endAdornment'];
  error?: (value: string) => string;
  errorProps?: FormHelperTextProps;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  label: string;
  labelProps?: TypographyProps;
  loading?: boolean;
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

const WrappedTextAreaInput = ({
  disabled,
  endAdornment = null,
  error = () => null,
  errorProps = null,
  helperText = null,
  helperTextProps = null,
  id: idProp = null,
  label,
  labelProps,
  loading = false,
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
  const { t } = useTranslation();
  const theme = useTheme();

  const [focused, setFocused] = useState<boolean>(false);

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
                WebkitTextFillColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
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
          <Tooltip
            title={!readOnly ? null : t('readonly')}
            placement="bottom"
            arrow
            slotProps={{
              tooltip: { sx: { backgroundColor: theme.palette.primary.main } },
              arrow: { sx: { color: theme.palette.primary.main } }
            }}
          >
            <TextField
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
                    ? { variant: 'outlined', sx: { color: theme.palette.error.main, ...errorProps?.sx }, ...errorProps }
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
                setFocused(document.activeElement === event.target);
                onFocus(event, ...other);
              }}
              onBlur={(event, ...other) => {
                setFocused(false);
                onBlur(event, ...other);
              }}
              sx={{
                margin: 0,
                ...(readOnly &&
                  !disabled && {
                    '& .MuiInputBase-input': { cursor: 'default' },
                    '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'
                    }
                  })
              }}
              {...textFieldProps}
            />
          </Tooltip>
        )}
      </FormControl>
    </div>
  );
};

export const TextAreaInput = React.memo(WrappedTextAreaInput);
