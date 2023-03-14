import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button, Collapse, Paper, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import PageCenter from 'commons/components/pages/PageCenter';
import * as React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { GiSpottedBug } from 'react-icons/gi';

// TODO: Add Error Boundary
const useStyles = makeStyles(theme => ({
  snackroot: {
    [theme.breakpoints.only('xs')]: { wordBreak: 'break-word' }
  },
  bugContainer: {
    paddingTop: theme.spacing(10),
    fontSize: 200,
    color: theme.palette.secondary.main,
    [theme.breakpoints.down('md')]: {
      paddingTop: theme.spacing(2),
      transform: 'translateY(50px)'
    }
  },
  bug: {
    animation: `$bugPath 4000ms ${theme.transitions.easing.easeInOut}`,
    animationIterationCount: 'infinite'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2),
    width: '100%'
  },
  errorMessage: {
    paddingTop: theme.spacing(1),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  errorButton: {
    margin: theme.spacing(1),
    color: theme.palette.primary.main
  },
  errorStack: {
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    paddingBottom: theme.spacing(1)
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

const ExpandMore = styled((props: any & { expand: boolean }) => {
  const { expand, ...other } = props;
  return <SvgIcon {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  })
}));

export const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const classes = useStyles();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div role="alert">
      <PageCenter margin={4}>
        <div className={classes.bugContainer}>
          <GiSpottedBug className={classes.bug} fontSize="inherit" />
        </div>
        <Typography children={t('error.title')} variant={downSM ? 'h4' : 'h3'} gutterBottom />
        <Typography children={t('error.description')} variant={downSM ? 'body1' : 'h6'} gutterBottom />
        <Paper className={classes.errorContainer} variant="outlined">
          <Typography className={classes.errorMessage} children={error.message} variant="inherit" component="pre" />
          <Button className={classes.errorButton} onClick={() => setExpanded(e => !e)}>
            {expanded ? t('error.hideStack') : t('error.showStack')}
            <ExpandMore
              expand={expanded}
              onClick={() => setExpanded(e => !e)}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </Button>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Typography className={classes.errorStack} children={error.stack} variant="inherit" component="pre" />
          </Collapse>
        </Paper>
        <Button onClick={resetErrorBoundary} style={{ margin: theme.spacing(4) }} color="primary">
          {t('error.button')}
        </Button>
      </PageCenter>
    </div>
  );
};

type ProviderProps = {
  children?: React.ReactNode;
};

const WrappedAppErrorProvider = ({ children = null }: ProviderProps) => {
  return (
    <ErrorBoundary
      FallbackComponent={props => ErrorFallback(props)}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export const AppErrorProvider = React.memo(WrappedAppErrorProvider);
