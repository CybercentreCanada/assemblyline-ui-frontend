import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = (forcePaper: boolean) =>
  makeStyles(theme => ({
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
      [theme.breakpoints.down('lg')]: {
        backgroundColor: forcePaper ? theme.palette.background.paper : theme.palette.background.default
      }
    }
  }))();

interface TextDividerProps {
  forcePaper?: boolean;
}

const TextDivider: React.FC<TextDividerProps> = ({ forcePaper = false }) => {
  const { t } = useTranslation();
  const classes = useStyles(forcePaper);

  return (
    <div>
      <div className={classes.divider}>
        <div className={classes.inner}>{t('divider')}</div>
      </div>
    </div>
  );
};

export default TextDivider;
