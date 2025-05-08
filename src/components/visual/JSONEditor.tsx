import { useTheme } from '@mui/material';
import { useAppTheme } from 'commons/components/app/hooks';
import React from 'react';
import type { ReactJsonViewProps } from 'react-json-view';
import ReactJson from 'react-json-view';

const WrappedJSONEditor: React.FC<ReactJsonViewProps> = (inputProps: ReactJsonViewProps) => {
  const theme = useTheme();
  const { isDark: isDarkTheme } = useAppTheme();

  const jsonTheme = {
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
  };

  return (
    <ReactJson
      theme={jsonTheme}
      name={false}
      enableClipboard={false}
      groupArraysAfterLength={10}
      displayDataTypes={false}
      displayObjectSize={false}
      {...inputProps}
    />
  );
};

export const JSONEditor = React.memo(WrappedJSONEditor);
export default JSONEditor;
