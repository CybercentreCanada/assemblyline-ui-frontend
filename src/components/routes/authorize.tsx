/* eslint-disable jsx-a11y/anchor-is-valid */
import { Backdrop, Button, Typography, useTheme } from '@mui/material';
import useAppLayout from 'commons_deprecated/components/hooks/useAppLayout';
import CardCentered from 'commons_deprecated/components/layout/pages/CardCentered';
import useALContext from 'components/hooks/useALContext';
import getXSRFCookie from 'helpers/xsrf';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import ForbiddenPage from './403';

const VALID_SCOPES = ['r', 'w', 'rw'];

export default function AppRegistration() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(['authorize']);
  const theme = useTheme();
  const { getBanner } = useAppLayout();
  const { user: currentUser } = useALContext();

  const params = new URLSearchParams(location.search);
  const rUrl = params.get('redirect_url');
  const clientID = params.get('client_id');
  const scope = params.get('scope');
  const server = params.get('server');

  return currentUser.roles.includes('obo_access') ? (
    <Backdrop open style={{ backgroundColor: theme.palette.background.default, zIndex: 10000 }} transitionDuration={0}>
      <CardCentered>
        {getBanner(theme)}
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', justifyContent: 'center' }}>
          {!rUrl || !clientID || !scope || !server || VALID_SCOPES.indexOf(scope) === -1 ? (
            <>
              <div style={{ marginBottom: '3rem' }}>{t('invalid')}</div>
              <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
                {t('button.back')}
              </Button>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <Typography component="span" variant="h6" color="primary">
                  {server}{' '}
                </Typography>
                <Typography component="span" variant="h6">
                  {t('access')}
                </Typography>
              </div>
              <Typography variant="subtitle2" gutterBottom>
                {t('scope')}
              </Typography>
              <Typography variant="caption" color="secondary" gutterBottom style={{ marginTop: '1rem' }}>
                {t(`scope.${scope}`)}
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                gutterBottom
                style={{ marginTop: '2rem', textAlign: 'left' }}
              >
                {t('warning')}
              </Typography>
              <div
                style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '3rem' }}
              >
                <Button variant="text" href={`${rUrl}${rUrl.indexOf('?') === -1 ? '?' : '&'}error=cancelled`}>
                  {t('button.cancel')}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  href={`/api/v4/auth/obo_token/?XSRF_TOKEN=${getXSRFCookie()}&${location.search.substring(1)}`}
                >
                  {t('button.allow')}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardCentered>
    </Backdrop>
  ) : (
    <ForbiddenPage />
  );
}
