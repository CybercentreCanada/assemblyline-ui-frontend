import type { ReactJsonViewProps, ThemeObject } from '@microlink/react-json-view';
import ReactJson from '@microlink/react-json-view';
import { useTheme } from '@mui/material';
import { useAppTheme } from 'commons/components/app/hooks';
import {
  ExpandInput,
  HelperText,
  PasswordInput,
  ResetInput,
  StyledEndAdornmentBox,
  StyledFormControl
} from 'components/visual/Inputs/lib/inputs.components';
import type { InputProps } from 'components/visual/Inputs/lib/inputs.model';
import React, { useMemo, useState } from 'react';

export type JSONInputProps = Omit<ReactJsonViewProps, 'src' | 'onAdd' | 'onDelete' | 'onEdit'> & InputProps<object>;

const WrappedJSONInput = (props: JSONInputProps) => {
  return null;

  const {
    disabled = false,
    endAdornment = null,
    error = () => '',
    loading,
    monospace = false,
    password = false,
    preventRender,
    readOnly = false,
    rootProps,
    tiny = false,
    value,
    onChange = () => null,
    onError = () => null
  } = props;

  const theme = useTheme();
  const { isDark: isDarkTheme } = useAppTheme();

  const [showPassword, setShowPassword] = useState<boolean>(true);

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
    <div {...rootProps} style={{ textAlign: 'left', ...rootProps?.style }}>
      <StyledFormLabel props={props} />
      <StyledFormControl props={props}>
        {loading ? (
          <StyledInputSkeleton props={props} />
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
                        onChange(event as unknown as Event, event.updated_src);

                        const err = error(event.updated_src);
                        if (err) onError(err);
                      }
                }
                onDelete={
                  disabled || readOnly
                    ? false
                    : event => {
                        onChange(event as unknown as Event, event.updated_src);

                        const err = error(event.updated_src);
                        if (err) onError(err);
                      }
                }
                onEdit={
                  disabled || readOnly
                    ? false
                    : event => {
                        onChange(event as unknown as Event, event.updated_src);

                        const err = error(event.updated_src);
                        if (err) onError(err);
                      }
                }
                style={{
                  fontSize: '1rem',
                  padding: '4px',
                  overflowX: 'auto',
                  width: '100%',
                  ...(monospace && { fontFamily: 'monospace' }),
                  ...(!tiny
                    ? {
                        minHeight: theme.spacing(5)
                      }
                    : {
                        paddingTop: '2px !important',
                        paddingBottom: '2px !important'
                      }),
                  ...(password &&
                    showPassword && {
                      fontFamily: 'password',
                      WebkitTextSecurity: 'disc',
                      MozTextSecurity: 'disc',
                      textSecurity: 'disc'
                    })
                }}
              />

              <StyledEndAdornmentBox props={props}>
                <PasswordInput
                  props={props}
                  showPassword={showPassword}
                  onShowPassword={() => setShowPassword(p => !p)}
                />
                <ResetInput props={props} />
                <ExpandInput props={props} />
                {endAdornment}
              </StyledEndAdornmentBox>
            </div>
            <HelperText props={props} />
          </>
        )}
      </StyledFormControl>
    </div>
  );
};

export const JSONInput: React.FC<JSONInputProps> = React.memo(WrappedJSONInput);
