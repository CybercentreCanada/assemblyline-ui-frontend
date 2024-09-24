import { useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import type { JSONBody as JSONData } from 'components/models/base/result_body';
import { default as React } from 'react';
import ReactJson from 'react-json-view';

const useStyles = makeStyles(theme => ({
  json: {
    '@media print': {
      backgroundColor: '#00000005',
      border: '1px solid #DDD'
    },
    backgroundColor: theme.palette.mode === 'dark' ? '#ffffff05' : '#00000005',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px',
    padding: '4px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    margin: '0.25rem 0'
  }
}));

type Props = {
  body: JSONData;
  printable: boolean;
};

const WrappedJSONBody = ({ body, printable }: Props) => {
  const classes = useStyles();
  const theme = useTheme();

  if (printable) {
    const pprint = JSON.stringify(body, undefined, 2);
    return (
      <pre id="json" className={classes.json}>
        <code>{pprint}</code>
      </pre>
    );
  } else {
    const jsonTheme = {
      base00: 'transparent', // Background
      base01: '#f1f1f1', // Edit key text
      base02: theme.palette.mode === 'dark' ? theme.palette.text.disabled : theme.palette.divider, // Borders and DataType Background
      base03: '#444', // Unused
      base04: theme.palette.grey[theme.palette.mode === 'dark' ? 700 : 400], // Object size and Add key border
      base05: theme.palette.grey[theme.palette.mode === 'dark' ? 700 : 700], // Undefined and Add key background
      base06: '#444', // Unused
      base07: theme.palette.text.primary, // Brace, Key and Borders
      base08: theme.palette.text.secondary, // NaN
      base09: theme.palette.mode === 'dark' ? theme.palette.warning.light : theme.palette.warning.dark, // Strings and Icons
      base0A: '#333', // Null, Regex and edit color
      base0B: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark, // Float
      base0C: theme.palette.mode === 'dark' ? theme.palette.secondary.light : theme.palette.secondary.dark, // Array Key
      base0D: theme.palette.mode === 'dark' ? theme.palette.info.light : theme.palette.info.dark, // Date, function, expand icon
      base0E: theme.palette.mode === 'dark' ? theme.palette.info.light : theme.palette.info.dark, // Boolean
      base0F: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark // Integer
    };

    return (
      <ReactJson
        name={false}
        src={body}
        theme={jsonTheme}
        indentWidth={2}
        iconStyle="square"
        groupArraysAfterLength={25}
        displayDataTypes={false}
        shouldCollapse={field => Object.keys(field.src).length > 25}
        style={{
          backgroundColor: theme.palette.mode === 'dark' ? '#FFFFFF05' : '#00000005',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '4px',
          padding: '4px',
          maxHeight: '500px',
          overflow: 'auto'
        }}
      />
    );
  }
};

export const JSONBody = React.memo(WrappedJSONBody);
