import type { InteractionProps, ReactJsonViewProps, ThemeObject } from '@microlink/react-json-view';
import ReactJson from '@microlink/react-json-view';
import type {
  FormHelperTextProps,
  IconButtonProps,
  TextFieldProps,
  TooltipProps,
  TypographyProps
} from '@mui/material';
import { FormControl, FormHelperText, Skeleton, Typography, useTheme } from '@mui/material';
import { useAppTheme } from 'commons/components/app/hooks';
import type { ResetInputProps } from 'components/visual/Inputs/components/ResetInput';
import { ResetInput } from 'components/visual/Inputs/components/ResetInput';
import { Tooltip } from 'components/visual/Tooltip';
import React, { useMemo } from 'react';

export type JSONInputProps = Omit<ReactJsonViewProps, 'src' | 'onAdd' | 'onDelete' | 'onEdit'> & {
  disabled?: boolean;
  endAdornment?: TextFieldProps['InputProps']['endAdornment'];
  error?: (value: object) => string;
  errorProps?: FormHelperTextProps;
  helperText?: string;
  helperTextProps?: FormHelperTextProps;
  id?: string;
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  placeholder?: string;
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  readOnly?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  tiny?: boolean;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: object;
  onBlur?: () => void;
  onChange?: (event: InteractionProps, value: object) => void;
  onError?: (error: string) => void;
  onFocus?: () => void;
  onReset?: IconButtonProps['onClick'];
};

const WrappedJSONInput = ({
  disabled = false,
  endAdornment = null,
  error = () => null,
  errorProps = null,
  helperText = null,
  helperTextProps = null,
  id: idProp = null,
  label: labelProp = null,
  labelProps,
  loading,
  placeholder = null,
  preventDisabledColor = false,
  preventRender,
  readOnly = false,
  reset = false,
  resetProps = null,
  tiny = false,
  tooltip = null,
  tooltipProps = null,
  value,
  onBlur = () => null,
  onChange = () => null,
  onError = () => null,
  onFocus = () => null,
  onReset = () => null
}: JSONInputProps) => {
  const theme = useTheme();
  const { isDark: isDarkTheme } = useAppTheme();

  const label = useMemo<string>(() => labelProp ?? '\u00A0', [labelProp]);
  const id = useMemo<string>(() => (idProp || label).replaceAll(' ', '-'), [idProp, label]);
  const errorValue = useMemo<string>(() => error(value), [error, value]);

  const jsonTheme = useMemo<ThemeObject>(
    () => ({
      base00: 'transparent', // Background
      base01: theme.palette.grey[isDarkTheme ? 800 : 300], // Add key title + Edit value background
      base02: theme.palette.grey[isDarkTheme ? 700 : 400], // Borders and DataType Background
      base03: '#444', // Unused
      base04: theme.palette.grey[isDarkTheme ? 700 : 400], // Object size and Add key border
      base05: theme.palette.grey[isDarkTheme ? 400 : 600], // Undefined and Add key background
      base06: '#444', // Unused
      base07: theme.palette.text.primary, // Brace, Key and Borders
      base08: theme.palette.text.secondary, // NaN
      base09: isDarkTheme ? theme.palette.warning.light : theme.palette.warning.dark, // Strings and Icons
      base0A: theme.palette.grey[isDarkTheme ? 300 : 800], // Null, Regex and edit text color
      base0B: isDarkTheme ? theme.palette.error.light : theme.palette.error.dark, // Float
      base0C: isDarkTheme ? theme.palette.secondary.light : theme.palette.secondary.dark, // Array Key
      base0D: isDarkTheme ? theme.palette.info.light : theme.palette.info.dark, // Date, function, expand icon
      base0E: isDarkTheme ? theme.palette.info.light : theme.palette.info.dark, // Boolean
      base0F: isDarkTheme ? theme.palette.error.light : theme.palette.error.dark // Integer
    }),
    [
      isDarkTheme,
      theme.palette.error.dark,
      theme.palette.error.light,
      theme.palette.grey,
      theme.palette.info.dark,
      theme.palette.info.light,
      theme.palette.secondary.dark,
      theme.palette.secondary.light,
      theme.palette.text.primary,
      theme.palette.text.secondary,
      theme.palette.warning.dark,
      theme.palette.warning.light
    ]
  );

  return preventRender ? null : (
    <div style={{ textAlign: 'left' }}>
      <Tooltip title={tooltip} {...tooltipProps}>
        <Typography
          color={!disabled && errorValue ? 'error' : 'textSecondary'}
          gutterBottom
          overflow="hidden"
          textAlign="start"
          textOverflow="ellipsis"
          variant="body2"
          whiteSpace="nowrap"
          width="100%"
          sx={{
            ...(disabled &&
              !preventDisabledColor && {
                WebkitTextFillColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
              })
          }}
          {...labelProps}
          children={label}
        />
      </Tooltip>
      <FormControl fullWidth error={!!errorValue}>
        {loading ? (
          <Skeleton sx={{ height: '40px', transform: 'unset', ...(tiny && { height: '28px' }) }} />
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '4px',
                ...(errorValue && { border: `1px solid ${theme.palette.error.main}` })
              }}
            >
              <ReactJson
                theme={jsonTheme}
                name={false}
                enableClipboard={false}
                groupArraysAfterLength={10}
                displayDataTypes={false}
                displayObjectSize={false}
                src={value}
                onAdd={
                  disabled || readOnly
                    ? false
                    : event => {
                        onChange(event, event.updated_src);

                        const err = error(event.updated_src);
                        if (err) onError(err);
                      }
                }
                onDelete={
                  disabled || readOnly
                    ? false
                    : event => {
                        onChange(event, event.updated_src);

                        const err = error(event.updated_src);
                        if (err) onError(err);
                      }
                }
                onEdit={
                  disabled || readOnly
                    ? false
                    : event => {
                        onChange(event, event.updated_src);

                        const err = error(event.updated_src);
                        if (err) onError(err);
                      }
                }
                style={{
                  fontSize: '1rem',
                  padding: '4px',
                  overflowX: 'auto',
                  width: '100%',
                  ...(!tiny
                    ? {
                        minHeight: theme.spacing(5)
                      }
                    : {
                        paddingTop: '2px !important',
                        paddingBottom: '2px !important'
                      })
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  right: theme.spacing(0.75),
                  top: theme.spacing(0.75),
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ResetInput
                  id={id}
                  preventRender={loading || !reset || disabled || readOnly}
                  tiny={tiny}
                  onReset={onReset}
                  {...resetProps}
                />
              </div>
            </div>
            {disabled ? null : errorValue ? (
              <FormHelperText
                sx={{ color: theme.palette.error.main, ...errorProps?.sx }}
                variant="outlined"
                {...errorProps}
              >
                {errorValue}
              </FormHelperText>
            ) : helperText ? (
              <FormHelperText
                sx={{ color: theme.palette.text.secondary, ...helperTextProps?.sx }}
                variant="outlined"
                {...helperTextProps}
              >
                {helperText}
              </FormHelperText>
            ) : null}
          </>
        )}
      </FormControl>
    </div>
  );
};

export const JSONInput: React.FC<JSONInputProps> = React.memo(WrappedJSONInput);
