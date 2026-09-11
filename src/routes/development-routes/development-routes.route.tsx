import AltRouteOutlinedIcon from '@mui/icons-material/AltRouteOutlined';
import { useAppConfigStore } from 'core/config';
import { createAppRoute, useAppLocationParamStore } from 'core/router';
import { AppPageFullWidth } from 'core/template';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { DevelopmentRoutesTableRowData } from 'routes/development-routes';
import { DevelopmentRoutesTable, toRouteTableRow } from 'routes/development-routes';
import { PageHeader } from 'ui/layouts/PageHeader';

export const DevelopmentRoutesPage = memo(() => {
  const { t } = useTranslation('developmentRoutes');
  const configState = useAppConfigStore(state => state);
  const routes = useAppLocationParamStore(state => state.routes);

  const rows = useMemo<DevelopmentRoutesTableRowData[]>(
    () =>
      [...Object.values(routes)]
        .sort((first, second) => first.path.localeCompare(second.path))
        .map(route => toRouteTableRow(route, configState)),
    [configState, routes]
  );

  return (
    <AppPageFullWidth>
      <PageHeader primary={t('page.title')} secondary={t('page.registered_routes', { count: rows.length })} />
      <DevelopmentRoutesTable rows={rows} />
    </AppPageFullWidth>
  );
});

DevelopmentRoutesPage.displayName = 'DevelopmentRoutesPage';

export const DevelopmentRoutesRoute = createAppRoute({
  component: DevelopmentRoutesPage,

  path: '/development/routes',

  ancestor: '/development',
  shortname: () => ['app_route.development_routes.shortname', { ns: 'developmentRoutes' }],
  fullname: () => ['app_route.development_routes.fullname', { ns: 'developmentRoutes' }],
  shorticon: () => <AltRouteOutlinedIcon />,
  fullicon: () => <AltRouteOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location: unknown, config: AppConfigStore) =>
    !config.user.is_admin || !['development', 'staging'].includes(config.configuration.system.type)
});
