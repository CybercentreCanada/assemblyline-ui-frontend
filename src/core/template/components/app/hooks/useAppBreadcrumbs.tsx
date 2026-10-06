import { AppBreadcrumbsContext, type AppBreadcrumbsContextType } from 'core/template/components/app/AppContexts';
import { useAppConfigs } from 'core/template/components/app/hooks/useAppConfigs';
import { useContext } from 'react';

export function useAppBreadcrumbs<T = AppBreadcrumbsContextType>() {
  const { overrides } = useAppConfigs();
  return useContext(overrides?.providers?.breadcrumbs?.context ?? AppBreadcrumbsContext) as T;
}
