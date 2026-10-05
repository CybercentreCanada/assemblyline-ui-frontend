import { AppBreadcrumbsContext, type AppBreadcrumbsContextType } from 'deprecated/legacy/commons/components/app/AppContexts';
import { useAppConfigs } from 'deprecated/legacy/commons/components/app/hooks/useAppConfigs';
import { useContext } from 'react';

export function useAppBreadcrumbs<T = AppBreadcrumbsContextType>() {
  const { overrides } = useAppConfigs();
  return useContext(overrides?.providers?.breadcrumbs?.context ?? AppBreadcrumbsContext) as T;
}
