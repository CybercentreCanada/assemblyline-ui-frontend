import { AppBreadcrumbsContext, type AppBreadcrumbsContextType } from 'commons/components/app/AppContexts';
import { useAppConfigs } from 'commons/components/app/hooks/useAppConfigs';
import { useContext } from 'react';

export function useAppBreadcrumbs<T = AppBreadcrumbsContextType>() {
  const { overrides } = useAppConfigs();
  return useContext(overrides?.providers?.breadcrumbs?.context ?? AppBreadcrumbsContext) as T;
}
