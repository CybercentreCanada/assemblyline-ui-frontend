import { Code } from '@mui/icons-material';
import LinkIcon from '@mui/icons-material/Link';
import { Button, useTheme } from '@mui/material';
import { useAppTemplateLeftNav } from 'app/layout.left-nav';
import { getAppConfigStateFromApi, useAppConfigStoreApi } from 'core/config';
import { AppLink } from 'core/router';
import {
  createAppRoute,
  findAppRouteFromPath,
  getAppLocationParamStateFromApi,
  RouteName,
  useAppLocationParamStoreApi
} from 'core/routes';
import React, { memo, useMemo } from 'react';
import { PageCenter } from 'ui/pages/PageCenter';

export const DevelopmentPage = memo(() => {
  const theme = useTheme();
  const configStoreApi = useAppConfigStoreApi();
  const locationParamStoreApi = useAppLocationParamStoreApi();
  const leftNav = useAppTemplateLeftNav();

  const items = useMemo(() => {
    const configState = getAppConfigStateFromApi(configStoreApi);
    const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
    const section = leftNav.find(item => item.link?.route === '/development');

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
    <PageCenter margin={4} width="100%">
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
    </PageCenter>
  );
});

export const DevelopmentRoute = createAppRoute({
  component: DevelopmentPage,

  path: '/development',

  ancestor: null,
  shortname: () => ({ i18nKey: 'drawer.development', ns: 'app' }),
  fullname: () => ({ i18nKey: 'drawer.development', ns: 'app' }),
  shorticon: () => <Code />,
  fullicon: () => <Code />,

  disabled: () => false,
  forbidden: (_location, config) =>
    !config.user.is_admin || !['development', 'staging'].includes(config.configuration.system.type)
});
