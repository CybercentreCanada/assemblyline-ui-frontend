import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import { Link, Skeleton, Typography, styled, useTheme } from '@mui/material';
import { useApiMutation, useApiQuery } from 'core/api';
import { useAppConfig } from 'core/config';
import { useAppSetInterfaceStore } from 'core/interface';
import { createAppRoute } from 'core/routes';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import { NotFoundPage } from 'routes/not-found/not-found';
import { AppBanner } from 'ui/branding/AppBanner';
import { Button } from 'ui/buttons/Button';
import { PageCenter } from 'ui/pages/PageCenter';

//*****************************************************************************************
// ToS Page
//*****************************************************************************************

const TosContainer = styled('div')(({ theme }) => ({
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
}));

TosContainer.displayName = 'TosContainer';

export const ToSPage = memo(() => {
  const { t } = useTranslation(['tos']);
  const theme = useTheme();

  const currentUser = useAppConfig(s => s.user);
  const configuration = useAppConfig(s => s.configuration);
  const setInterfaceStore = useAppSetInterfaceStore();

  const handleAccept = useApiMutation(() => ({
    url: `/api/v4/user/tos/${currentUser.username}/`,
    onSuccess: () =>
      setInterfaceStore(s => {
        s.auth.mode = 'app';
        return s;
      })
  }));

  const { data: tos } = useApiQuery<string>({ url: '/api/v4/help/tos/', disabled: !configuration?.ui?.tos });

  return !configuration?.ui?.tos ? (
    <NotFoundPage />
  ) : (
    <PageCenter margin={4} width="100%">
      <TosContainer>
        <AppBanner />
        <div style={{ marginBottom: theme.spacing(6), textAlign: 'left' }}>
          <Typography variant="h3" gutterBottom>
            {t('title')}
          </Typography>
        </div>
        {!tos ? (
          <>
            <Skeleton style={{ marginBottom: 12 }} />
            <Skeleton style={{ marginBottom: 12 }} />
            <Skeleton style={{ marginBottom: 12 }} />
            <Skeleton style={{ marginBottom: 12 }} />
            <Skeleton style={{ marginBottom: 12 }} />
            <Skeleton />
          </>
        ) : (
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
                  disabled={handleAccept.isPending}
                  progress={handleAccept.isPending}
                  style={{ marginTop: '3rem', marginBottom: '3rem' }}
                  variant="contained"
                  onClick={handleAccept.mutate}
                >
                  {t('button')}
                </Button>
                <Button
                  color="secondary"
                  disabled={handleAccept.isPending}
                  progress={handleAccept.isPending}
                  style={{ marginLeft: '1rem', marginTop: '3rem', marginBottom: '3rem' }}
                  variant="contained"
                  onClick={() => {
                    setInterfaceStore(s => {
                      s.auth.mode = 'logout';
                      return s;
                    });
                  }}
                >
                  {t('logout')}
                </Button>
              </div>
            )}
          </>
        )}
      </TosContainer>
    </PageCenter>
  );
});

ToSPage.displayName = 'ToSPage';

//*****************************************************************************************
// ToS Route
//*****************************************************************************************

export const ToSRoute = createAppRoute({
  component: ToSPage,

  path: '/tos',

  ancestor: null,
  shortname: () => ({ i18nKey: 'breadcrumb.tos', ns: 'app' }),
  fullname: () => ({ i18nKey: 'breadcrumb.tos', ns: 'app' }),
  shorticon: () => <ReceiptOutlinedIcon />,
  fullicon: () => <ReceiptOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});
