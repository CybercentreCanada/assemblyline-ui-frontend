import type { ThemeObject } from '@microlink/react-json-view';
import ReactJson from '@microlink/react-json-view';
import { useTheme } from '@mui/material';
import { useAppTheme } from 'commons/components/app/hooks';
import {
  HelperText,
  PasswordInput,
  ResetInput,
  StyledEndAdornmentBox,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputParsedProps } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputValues } from 'components/visual/Inputs/lib/inputs.model';
import { PropProvider, usePropStore } from 'components/visual/Inputs/lib/inputs.provider';
import React, { useCallback, useMemo } from 'react';

export type JSONInputProps = InputValues<object> & InputProps;

const WrappedJSONInput = React.memo(() => {
  const theme = useTheme();
  const { isDark: isDarkTheme } = useAppTheme();
  const [get, setStore] = usePropStore<JSONInputProps>();

  const disabled = get('disabled');
  const errorMsg = get('errorMsg');
  const inputValue = get('inputValue') ?? null;
  const loading = get('loading');
  const monospace = get('monospace');
  const password = get('password');
  const readOnly = get('readOnly');
  const showPassword = get('showPassword');
  const tiny = get('tiny');

  const error = get('error');
  const onChange = get('onChange');
  const onError = get('onError');

  const jsonTheme = useMemo<ThemeObject>(
    () => ({
      base00: 'transparent',
      base01: theme.palette.grey[isDarkTheme ? 800 : 300],
      base02: theme.palette.grey[isDarkTheme ? 700 : 400],
      base03: '#444',
      base04: theme.palette.grey[isDarkTheme ? 700 : 400],
      base05: theme.palette.grey[isDarkTheme ? 400 : 600],
      base06: '#444',
      base07: theme.palette.text.primary,
      base08: theme.palette.text.secondary,
      base09: isDarkTheme ? theme.palette.warning.light : theme.palette.warning.dark,
      base0A: theme.palette.grey[isDarkTheme ? 300 : 800],
      base0B: isDarkTheme ? theme.palette.error.light : theme.palette.error.dark,
      base0C: isDarkTheme ? theme.palette.secondary.light : theme.palette.secondary.dark,
      base0D: isDarkTheme ? theme.palette.info.light : theme.palette.info.dark,
      base0E: isDarkTheme ? theme.palette.info.light : theme.palette.info.dark,
      base0F: isDarkTheme ? theme.palette.error.light : theme.palette.error.dark
    }),
    [theme, isDarkTheme]
  );

  const handleChange = useCallback(
    (event: React.SyntheticEvent, newValue: object) => {
      const err = error(newValue);
      onError(err);
      if (!err) onChange(event, newValue);
      setStore(() => ({ ...(!err && { value: newValue }), inputValue: newValue, errorMsg: err }));
    },
    [error, onChange, onError, setStore]
  );

  return (
    <StyledRoot>
      <StyledFormLabel />
      <StyledFormControl>
        {loading ? (
          <StyledInputSkeleton />
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '4px',
                ...(errorMsg && { border: `1px solid ${theme.palette.error.main}` })
              }}
            >
              <ReactJson
                theme={jsonTheme}
                name={false}
                enableClipboard={false}
                groupArraysAfterLength={10}
                displayDataTypes={false}
                displayObjectSize={false}
                src={inputValue}
                onAdd={
                  disabled || readOnly
                    ? false
                    : event => handleChange(event as unknown as React.SyntheticEvent, event.updated_src)
                }
                onDelete={
                  disabled || readOnly
                    ? false
                    : event => handleChange(event as unknown as React.SyntheticEvent, event.updated_src)
                }
                onEdit={
                  disabled || readOnly
                    ? false
                    : event => handleChange(event as unknown as React.SyntheticEvent, event.updated_src)
                }
                style={{
                  fontSize: '1rem',
                  padding: '4px',
                  overflowX: 'auto',
                  width: '100%',
                  ...(monospace && { fontFamily: 'monospace' }),
                  ...(!tiny ? { minHeight: theme.spacing(5) } : { paddingTop: '2px', paddingBottom: '2px' }),
                  ...(password &&
                    showPassword && {
                      fontFamily: 'password',
                      WebkitTextSecurity: 'disc',
                      MozTextSecurity: 'disc',
                      textSecurity: 'disc'
                    })
                }}
              />
              <StyledEndAdornmentBox>
                <PasswordInput />
                <ResetInput />
              </StyledEndAdornmentBox>
            </div>
            <HelperText />
          </>
        )}
      </StyledFormControl>
    </StyledRoot>
  );
});

export const JSONInput = ({ preventRender = false, ...props }: JSONInputProps) => {
  const parsedProps = useInputParsedProps<object, object, JSONInputProps>({ ...props, preventRender });

  return preventRender ? null : (
    <PropProvider<JSONInputProps> props={parsedProps}>
      <WrappedJSONInput />
    </PropProvider>
  );
};
