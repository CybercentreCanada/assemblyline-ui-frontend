/* eslint-disable jsx-a11y/anchor-is-valid */
import { Backdrop, Button, Typography, useTheme } from '@mui/material';
import useAppBanner from 'commons/components/app/hooks/useAppBanner';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageCardCentered from 'commons/components/pages/PageCardCentered';
import useALContext from 'components/hooks/useALContext';
import { CustomUser } from 'components/hooks/useMyUser';
import { Role, Scope, SCOPES } from 'components/models/base/user';
import getXSRFCookie from 'helpers/xsrf';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';

const VALID_SCOPES: Omit<Scope, 'c'>[] = SCOPES.filter(s => s !== 'c');

export default function AppRegistration() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(['authorize']);
  const theme = useTheme();
  const banner = useAppBanner();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { configuration } = useALContext();

  const params = new URLSearchParams(location.search);
  const rUrl = params.get('redirect_url');
  const clientID = params.get('client_id');
  const scope = params.get('scope');
  const rolesP = params.get('roles');
  const server = params.get('server');

  let roles = [];
  if (rolesP) {
    roles = (rolesP.split(',') as Role[]).filter(r => configuration.user.roles.includes(r));
  }

  return (
    <Backdrop open style={{ backgroundColor: theme.palette.background.default, zIndex: 10000 }} transitionDuration={0}>
      <PageCardCentered>
        {banner}
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', justifyContent: 'center' }}>
          {!currentUser.roles.includes('obo_access') ? (
            <>
              <Typography style={{ marginBottom: '3rem' }}>{t('forbidden')}</Typography>
              <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
                {t('button.back')}
              </Button>
            </>
          ) : !rUrl || !clientID || (!scope && !roles) || !server || (scope && VALID_SCOPES.indexOf(scope) === -1) ? (
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
              {scope && (
                <Typography variant="caption" color="secondary" gutterBottom style={{ marginTop: '1rem' }}>
                  {t(`scope.${scope}`)}
                </Typography>
              )}
              {roles.length > 0 && (
                <>
                  <Typography variant="caption" color="secondary" gutterBottom style={{ marginTop: '1rem' }}>
                    {t(`roles`)}
                  </Typography>
                  {roles.map(role => (
                    <Typography variant="caption">{t(`role.${role}`)}</Typography>
                  ))}
                </>
              )}
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
      </PageCardCentered>
    </Backdrop>
  );
}
