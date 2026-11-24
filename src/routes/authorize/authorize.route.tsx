import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import { Backdrop, Button, Typography, useTheme } from '@mui/material';
import useALContext from 'core/config/useALContext';
import { createAppRoute, useAppNavigate, useAppSearchSnapshot } from 'core/router';
import PageCardCentered from 'core/template/branding/AppPageCardCentered';
import { useAppUser } from 'core/template/components/app/hooks';
import useAppBannerVert from 'core/template/components/app/hooks/useAppBannerVert';
import type { CustomUser } from 'models/api/user';
import type { Role, Scope } from 'models/base/user';
import { SCOPES } from 'models/base/user';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import getXSRFCookie from 'shared/utils/xsrf';

const VALID_SCOPES: Omit<Scope, 'c'>[] = SCOPES.filter(s => s !== 'c');

export const AuthorizePage = memo(() => {
  const navigate = useAppNavigate<'/authorize'>();
  const search = useAppSearchSnapshot<'/authorize'>();
  const { t } = useTranslation(['authorize']);
  const theme = useTheme();
  const banner = useAppBannerVert();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { configuration } = useALContext();

  const params = search.toParams();
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
              <Button variant="contained" color="primary" onClick={() => navigate.here().closePanel({ route: '/' })}>
                {t('button.back')}
              </Button>
            </>
          ) : !rUrl || !clientID || (!scope && !roles) || !server || (scope && VALID_SCOPES.indexOf(scope) === -1) ? (
            <>
              <div style={{ marginBottom: '3rem' }}>{t('invalid')}</div>
              <Button variant="contained" color="primary" onClick={() => navigate.here().closePanel({ route: '/' })}>
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
                  {roles.map((role, i) => (
                    <Typography key={i} variant="caption">
                      {t(`role.${role}`)}
                    </Typography>
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
                  href={`/api/v4/auth/obo_token/?XSRF_TOKEN=${getXSRFCookie()}&${search.toParams().toString()}`}
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
});

export const AuthorizeRoute = createAppRoute({
  component: AuthorizePage,

  path: '/authorize',
  // TODO: revise in the new version
  search: s => ({
    redirect_url: s.string(''),
    client_id: s.string(''),
    server: s.string(''),
    scope: s.string(''),
    roles: s.string('')
  }),

  ancestor: null,
  shortname: () => ['app_route.authorize.shortname', { ns: 'authorize' }],
  fullname: () => ['app_route.authorize.fullname', { ns: 'authorize' }],
  shorticon: () => <KeyOutlinedIcon />,
  fullicon: () => <KeyOutlinedIcon />,

  disabled: () => false,
  forbidden: () => false
});
