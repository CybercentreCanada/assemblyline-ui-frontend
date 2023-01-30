import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  divider: {
    display: 'inline-block',
    textAlign: 'center',
    width: '100%',
    margin: '30px 0',
    position: 'relative',
    borderTop: `1px solid ${theme.palette.divider}`
  },
  inner: {
    backgroundColor: theme.palette.background.paper,
    left: '50%',
    marginLeft: '-30px',
    position: 'absolute',
    top: '-10px',
    width: '60px',
    [theme.breakpoints.down('xs')]: {
      backgroundColor: theme.palette.background.default
    }
  },
  forcePaper: {
    [theme.breakpoints.down('xl')]: {
      backgroundColor: theme.palette.background.paper
    }
  }
}));

interface TextDividerProps {
  forcePaper?: boolean;
}

const TextDivider: React.FC<TextDividerProps> = ({ forcePaper = false }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div>
      <div className={clsx(classes.divider, forcePaper && classes.forcePaper)}>
        <div className={classes.inner}>{t('divider')}</div>
      </div>
    </div>
  );
};

export default TextDivider;
