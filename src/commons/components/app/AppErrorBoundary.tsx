import { Button, CssBaseline, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import PageCenter from 'commons/components/pages/PageCenter';
import { useTranslation } from 'react-i18next';
import { GiSpottedBug } from 'react-icons/gi';

const useStyles = makeStyles(theme => ({
  snackroot: {
    [theme.breakpoints.only('xs')]: { wordBreak: 'break-word' }
  },
  bug: {
    animation: `$bugPath 4000ms ${theme.transitions.easing.easeInOut}`,
    animationIterationCount: 'infinite'
  },
  '@keyframes bugPath': {
    '0%': {
      transform: 'translateY(0) translateX(-5px) rotate(-5deg)'
    },
    '3%': {
      transform: 'translateY(-10px) translateX(-10px) rotate(5deg)'
    },
    '6%': {
      transform: 'translateY(-20px) translateX(-15px) rotate(-5deg)'
    },
    '9%': {
      transform: 'translateY(-30px) translateX(-20px) rotate(5deg)'
    },
    '12%': {
      transform: 'translateY(-40px) translateX(-25px) rotate(-5deg)'
    },
    '15%': {
      transform: 'translateY(-50px) translateX(-30px) rotate(5deg)'
    },
    '18%': {
      transform: 'translateY(-60px) translateX(-35px) rotate(-5deg)'
    },
    '21%': {
      transform: 'translateY(-70px) translateX(-40px) rotate(5deg)'
    },
    '24%': {
      transform: 'translateY(-80px) translateX(-45px) rotate(-5deg)'
    },
    '27%': {
      transform: 'translateY(-90px) translateX(-50px) rotate(5deg)'
    },
    '30%': {
      transform: 'translateY(-100px) translateX(-55px) rotate(-5deg)'
    },
    '33%': {
      transform: 'translateY(-100px) translateX(-55px) rotate(-150deg)'
    },
    '36%': {
      transform: 'translateY(-90px) translateX(-55px) rotate(-155deg)'
    },
    '39%': {
      transform: 'translateY(-80px) translateX(-55px) rotate(-150deg)'
    },
    '42%': {
      transform: 'translateY(-70px) translateX(-55px) rotate(-155deg)'
    },
    '45%': {
      transform: 'translateY(-60px) translateX(-55px) rotate(-150deg)'
    },
    '48%': {
      transform: 'translateY(-50px) translateX(-55px) rotate(-155deg)'
    },
    '51%': {
      transform: 'translateY(-40px) translateX(-55px) rotate(-150deg)'
    },
    '54%': {
      transform: 'translateY(-30px) translateX(-55px) rotate(-155deg)'
    },
    '57%': {
      transform: 'translateY(-20px) translateX(-55px) rotate(-150deg)'
    },
    '60%': {
      transform: 'translateY(-10px) translateX(-55px) rotate(-155deg)'
    },
    '63%': {
      transform: 'translateY(0) translateX(-55px) rotate(-150deg)'
    },
    '66%': {
      transform: 'translateY(0) translateX(-55px) rotate(-240deg)'
    },
    '69%': {
      transform: 'translateY(0) translateX(-50px) rotate(-245deg)'
    },
    '72%': {
      transform: 'translateY(0) translateX(-45px) rotate(-240deg)'
    },
    '75%': {
      transform: 'translateY(0) translateX(-40px) rotate(-245deg)'
    },
    '78%': {
      transform: 'translateY(0) translateX(-35px) rotate(-240deg)'
    },
    '81%': {
      transform: 'translateY(0) translateX(-30px) rotate(-245deg)'
    },
    '84%': {
      transform: 'translateY(0) translateX(-25px) rotate(-240deg)'
    },
    '87%': {
      transform: 'translateY(0) translateX(-20px) rotate(-245deg)'
    },
    '90%': {
      transform: 'translateY(0) translateX(-15px) rotate(-240deg)'
    },
    '93%': {
      transform: 'translateY(0) translateX(-10px) rotate(-245deg)'
    },
    '96%': {
      transform: 'translateY(0) translateX(-5px) rotate(-240deg)'
    },
    '100%': {
      transform: 'translateY(0) translateX(0) rotate(0)'
    }
  }
}));

// TODO: Add Error Boundary
export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const classes = useStyles();
  const downSM = useMediaQuery(theme.breakpoints.down('sm'));
  const isXS = useMediaQuery(theme.breakpoints.only('xs'));

  return (
    <div role="alert">
      <CssBaseline />
      <PageCenter width={isXS ? '100%' : '70%'} margin={4}>
        <div style={{ paddingTop: theme.spacing(10), fontSize: 200, color: theme.palette.secondary.main }}>
          <GiSpottedBug fontSize="inherit" className={classes.bug} />
        </div>
        <Typography variant={downSM ? 'h4' : 'h3'} gutterBottom>
          {t('error.title')}
        </Typography>
        <Typography variant={downSM ? 'body1' : 'h6'} gutterBottom>
          {t('error.description')}
        </Typography>
        <Paper
          component="pre"
          variant="outlined"
          style={{
            padding: theme.spacing(2),
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            minHeight: downSM ? theme.spacing(8) : theme.spacing(16),
            display: 'flex',
            alignContent: 'center',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {error.message}
        </Paper>
        <Button onClick={resetErrorBoundary} style={{ margin: theme.spacing(4) }} color="primary">
          {t('error.button')}
        </Button>
      </PageCenter>
    </div>
  );
};
