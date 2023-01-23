import { Button, CircularProgress, Link, Typography, useTheme } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import makeStyles from '@mui/styles/makeStyles';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import PageCenter from 'commons_deprecated/components/layout/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import NotFoundPage from 'components/routes/404_dl';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';

export default function Tos() {
  const { t } = useTranslation(['tos']);
  const theme = useTheme();
  const [tos, setTos] = useState('');
  const [buttonLoading, setButtonLoading] = useState(false);
  const { user: currentUser, configuration } = useALContext();
  const banner = useAppBanner();
  const { apiCall } = useMyAPI();
  const useStyles = makeStyles(curTheme => ({
    no_pad: {
      padding: 0
    },
    page: {
      maxWidth: '960px',
      width: '100%',
      [curTheme.breakpoints.down('xl')]: {
        maxWidth: '100%'
      },
      [curTheme.breakpoints.only('md')]: {
        maxWidth: '630px'
      }
    },
    buttonProgress: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12
    }
  }));
  const classes = useStyles();
  const sp6 = theme.spacing(6);

  function acceptTOS() {
    apiCall({
      url: `/api/v4/user/tos/${currentUser.username}/`,
      onSuccess: () => window.location.reload(),
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  }

  function cancelTOS() {
    apiCall({
      url: '/api/v4/auth/logout/',
      onSuccess: () => window.location.reload(),
      onEnter: () => setButtonLoading(true),
      onExit: () => setButtonLoading(false)
    });
  }

  useEffect(() => {
    if (configuration.ui.tos) {
      apiCall({
        url: '/api/v4/help/tos/',
        onSuccess: api_data => setTos(api_data.api_response)
      });
    }
    // eslint-disable-next-line
  }, []);

  return configuration.ui.tos ? (
    <PageCenter margin={4} width="100%">
      <div className={classes.page} style={{ display: 'inline-block', textAlign: 'center' }}>
        <div>{banner}</div>
        <div style={{ marginBottom: sp6, textAlign: 'left' }}>
          <Typography variant="h3" gutterBottom>
            {t('title')}
          </Typography>
        </div>
        {tos ? (
          <>
            <div style={{ textAlign: 'left' }}>
              <Markdown components={{ a: props => <Link href={props.href}>{props.children}</Link> }}>{tos}</Markdown>
            </div>
            {currentUser.agrees_with_tos ? (
              <div style={{ marginTop: sp6 }}>
                <Typography variant="subtitle1" color="secondary">
                  {t('agreed')}
                </Typography>
              </div>
            ) : (
              <div>
                <Button
                  style={{ marginTop: '3rem', marginBottom: '3rem' }}
                  variant="contained"
                  color="primary"
                  disabled={buttonLoading}
                  onClick={acceptTOS}
                >
                  {t('button')}
                  {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                </Button>
                <Button
                  style={{ marginLeft: '1rem', marginTop: '3rem', marginBottom: '3rem' }}
                  variant="contained"
                  color="secondary"
                  disabled={buttonLoading}
                  onClick={cancelTOS}
                >
                  {t('logout')}
                  {buttonLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <Skeleton style={{ marginBottom: 12 }} />
            <Skeleton style={{ marginBottom: 12 }} />
            <Skeleton style={{ marginBottom: 12 }} />
            <Skeleton style={{ marginBottom: 12 }} />
            <Skeleton style={{ marginBottom: 12 }} />
            <Skeleton />
          </>
        )}
      </div>
    </PageCenter>
  ) : (
    <NotFoundPage />
  );
}
