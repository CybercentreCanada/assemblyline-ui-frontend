import AltRouteOutlinedIcon from '@mui/icons-material/AltRouteOutlined';
import { useAppRoutes } from 'app/core.routes';
import useALContext from 'core/config/useALContext';
import { createAppRoute } from 'core/router';
import PageFullWidth from 'core/template/components/pages/PageFullWidth';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import type { DevelopmentRoutesTableRowData } from 'routes/development-routes';
import { DevelopmentRoutesTable, toRouteTableRow } from 'routes/development-routes';
import { PageHeader } from 'ui/layouts/PageHeader';

export const DevelopmentRoutesPage = memo(() => {
  const { t } = useTranslation('developmentRoutes');
  const { configuration, user } = useALContext();

  const routes = useAppRoutes();

  const notAllowed = useMemo(
    () => !user.is_admin || !['development', 'staging'].includes(configuration.system.type),
    [configuration.system.type, user.is_admin]
  );

  const rows = useMemo<DevelopmentRoutesTableRowData[]>(
    () =>
      notAllowed
        ? []
        : [...routes]
            .sort((first, second) => first.path.localeCompare(second.path))
            .map(route => toRouteTableRow(route, configuration as unknown as AppConfigStore)),
    [configuration, notAllowed, routes]
  );

  return notAllowed ? (
    <Navigate to="/forbidden" replace />
  ) : (
    <PageFullWidth>
      <PageHeader primary={t('page.title')} secondary={t('page.registered_routes', { count: rows.length })} />
      <DevelopmentRoutesTable rows={rows} />
    </PageFullWidth>
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
