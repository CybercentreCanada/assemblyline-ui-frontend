import { makeStyles } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

type TextDividerProps = {
  forcePaper?: (value: boolean) => void;
};

export default function TextDividerProps<TextDividerProps>({ forcePaper = false }) {
  const { t } = useTranslation();
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
        backgroundColor: forcePaper ? theme.palette.background.paper : theme.palette.background.default
      }
    }
  }));
  const classes = useStyles();
  return (
    <div>
      <div className={classes.divider}>
        <div className={classes.inner}>{t('divider')}</div>
      </div>
    </div>
  );
}
