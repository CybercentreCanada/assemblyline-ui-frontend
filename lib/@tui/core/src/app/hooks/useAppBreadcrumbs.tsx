import { useContext } from 'react';
import { AppBreadcrumbsContext } from '../AppContexts';

export const useAppBreadcrumbs = () => {
  return useContext(AppBreadcrumbsContext);
};
