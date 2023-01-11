import makeStyles from '@mui/styles/makeStyles';
import { default as React } from 'react';

const useStyles = makeStyles(theme => ({
  memdump: {
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

const WrappedMemDumpBody = ({ body }) => {
  const classes = useStyles();
  return <pre className={classes.memdump}>{body}</pre>;
};

export const MemDumpBody = React.memo(WrappedMemDumpBody);
