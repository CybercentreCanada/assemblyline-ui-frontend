import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import LinkIcon from '@mui/icons-material/Link';
import { Button, useTheme } from '@mui/material';
import { useAppTemplateLeftNav } from 'app/core.template';
import { getAppConfigStateFromApi, useAppConfigStoreApi } from 'core/config';
import { AppLink } from 'core/router';
import {
  createAppRoute,
  findAppRouteFromPath,
  getAppLocationParamStateFromApi,
  RouteName,
  useAppLocationParamStoreApi
} from 'core/routes';
import { AppPageCenter } from 'core/template';
import React, { memo, useMemo } from 'react';

export const ManagePage = memo(() => {
  const theme = useTheme();
  const configStoreApi = useAppConfigStoreApi();
  const locationParamStoreApi = useAppLocationParamStoreApi();
  const leftNav = useAppTemplateLeftNav();

  const items = useMemo(() => {
    const configState = getAppConfigStateFromApi(configStoreApi);
    const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
    const section = leftNav.find(item => item.link?.route === '/manage');

    return (section?.items ?? []).map(item => {
      const route = item.link?.route ? findAppRouteFromPath(locationState, item.link.route as never) : null;

      return {
        nav: nav => nav.to().only(item.link),
        icon: route?.shorticon?.(item?.link, configState),
        label: <RouteName name={route?.shortname?.(item?.link, configState)} />
      };
    });
  }, [configStoreApi, locationParamStoreApi, leftNav]);

  return (
    <AppPageCenter>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
        {items.map((item, i) => {
          const icon = React.isValidElement(item.icon)
            ? (item.icon as React.ReactElement<{ style?: React.CSSProperties }>)
            : null;

          return (
            <Button
              key={i}
              component={AppLink as React.ElementType}
              nav={item.nav}
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              <div
                style={{
                  height: '300px',
                  width: '300px',
                  padding: theme.spacing(10),
                  textAlign: 'center'
                }}
              >
                {icon ? (
                  React.cloneElement(icon, { style: { color: theme.palette.text.primary, fontSize: '8rem' } })
                ) : (
                  <LinkIcon style={{ fontSize: '8rem' }} />
                )}
                <span style={{ fontSize: 'medium' }}>{item.label}</span>
              </div>
            </Button>
          );
        })}
      </div>
    </AppPageCenter>
  );
});

export const ManageRoute = createAppRoute({
  component: ManagePage,

  path: '/manage',

  ancestor: null,
  shortname: () => ({ i18nKey: 'drawer.manage', ns: 'app' }),
  fullname: () => ({ i18nKey: 'drawer.manage', ns: 'app' }),
  shorticon: () => <BuildOutlinedIcon />,
  fullicon: () => <BuildOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) =>
    !config.user.roles.some(role =>
      [
        'badlist_view',
        'heuristic_view',
        'safelist_view',
        'signature_view',
        'signature_manage',
        'workflow_view'
      ].includes(role)
    )
});
