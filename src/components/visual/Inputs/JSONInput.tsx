import type { ThemeObject } from '@microlink/react-json-view';
import ReactJson from '@microlink/react-json-view';
import { useTheme } from '@mui/material';
import { useAppTheme } from 'commons/components/app/hooks';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  HelperText,
  PasswordAdornment,
  ResetAdornment,
  StyledEndAdornmentBox,
  StyledFormControl,
  StyledFormLabel,
  StyledInputSkeleton,
  StyledRoot
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputChange, useValidation } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputOptions, InputRuntimeState, InputValueModel } from 'components/visual/Inputs/lib/inputs.model';
import { DEFAULT_INPUT_CONTROLLER_PROPS } from 'components/visual/Inputs/lib/inputs.model';
import React, { useMemo } from 'react';

export type JSONInputProps = InputValueModel<object> & InputOptions;

type JSONInputController = JSONInputProps & InputRuntimeState;

const WrappedJSONInput = () => {
  const theme = useTheme();
  const { isDark: isDarkTheme } = useAppTheme();
  const [get] = usePropStore<JSONInputController>();

  const disabled = get('disabled');
  const errorMessage = get('errorMessage');
  const inputValue = get('inputValue') ?? null;
  const loading = get('loading');
  const monospace = get('monospace');
  const password = get('password');
  const readOnly = get('readOnly');
  const showPassword = get('showPassword');
  const tiny = get('tiny');

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

  const handleChange = useInputChange<object>();

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
                ...(errorMessage && { border: `1px solid ${theme.palette.error.main}` })
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
                    : event =>
                        handleChange(event as unknown as React.SyntheticEvent, event.updated_src, event.updated_src)
                }
                onDelete={
                  disabled || readOnly
                    ? false
                    : event =>
                        handleChange(event as unknown as React.SyntheticEvent, event.updated_src, event.updated_src)
                }
                onEdit={
                  disabled || readOnly
                    ? false
                    : event =>
                        handleChange(event as unknown as React.SyntheticEvent, event.updated_src, event.updated_src)
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
                <PasswordAdornment />
                <ResetAdornment />
              </StyledEndAdornmentBox>
            </div>
            <HelperText />
          </>
        )}
      </StyledFormControl>
    </StyledRoot>
  );
};

export const JSONInput = ({ preventRender = false, value, ...props }: JSONInputProps) => {
  const { status: validationStatus, message: validationMessage } = useValidation<object>({
    value: value ?? null,
    rawValue: value ?? null,
    ...props
  });

  return preventRender ? null : (
    <PropProvider<JSONInputController>
      initialProps={DEFAULT_INPUT_CONTROLLER_PROPS as JSONInputController}
      props={{ preventRender, inputValue: value, value, errorMessage, validationStatus, validationMessage, ...props }}
    >
      <WrappedJSONInput />
    </PropProvider>
  );
};
