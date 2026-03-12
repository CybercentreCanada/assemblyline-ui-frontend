import { Box, Link, Skeleton, Typography, useTheme } from '@mui/material';
import { useAPIMutation, useAPIQuery } from 'core/api';
import { useAppBanner } from 'core/preference/preference.hooks';
import { PageCenter } from 'layout/page/PageCenter';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import { Button } from 'ui/Buttons/Button';

export default function Tos() {
  const { t } = useTranslation(['tos']);
  const theme = useTheme();
  const Banner = useAppBanner();
  const { user: currentUser, configuration } = useALContext();

  const handleCancel = useAPIMutation(() => ({
    url: '/api/v4/auth/logout/',
    onSuccess: () => window.location.reload()
  }));

  const handleAccept = useAPIMutation(() => ({
    url: `/api/v4/user/tos/${currentUser.username}/`,
    onSuccess: () => window.location.reload()
  }));

  const { data: tos } = useAPIQuery<string>({ url: '/api/v4/help/tos/', disabled: !configuration?.ui?.tos });

  return configuration.ui.tos ? (
    <PageCenter margin={4} width="100%">
      <Box
        sx={{
          display: 'inline-block',
          textAlign: 'center',
          maxWidth: '960px',
          width: '100%',
          [theme.breakpoints.down('sm')]: {
            maxWidth: '100%'
          },
          [theme.breakpoints.only('md')]: {
            maxWidth: '630px'
          }
        }}
      >
        <Banner />
        <div style={{ marginBottom: theme.spacing(6), textAlign: 'left' }}>
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
              <div style={{ marginTop: theme.spacing(6) }}>
                <Typography variant="subtitle1" color="secondary">
                  {t('agreed')}
                </Typography>
              </div>
            ) : (
              <div>
                <Button
                  color="primary"
                  disabled={handleAccept.isPending || handleCancel.isPending}
                  progress={handleAccept.isPending || handleCancel.isPending}
                  style={{ marginTop: '3rem', marginBottom: '3rem' }}
                  variant="contained"
                  onClick={handleAccept.mutate}
                >
                  {t('button')}
                </Button>
                <Button
                  color="secondary"
                  disabled={handleAccept.isPending || handleCancel.isPending}
                  progress={handleAccept.isPending || handleCancel.isPending}
                  style={{ marginLeft: '1rem', marginTop: '3rem', marginBottom: '3rem' }}
                  variant="contained"
                  onClick={handleCancel.mutate}
                >
                  {t('logout')}
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
      </Box>
    </PageCenter>
  ) : (
    <NotFoundPage />
  );
}
