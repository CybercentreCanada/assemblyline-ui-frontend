import { DisabledRoute } from 'core/router/components/DisabledRoute';
import { ForbiddenRoute } from 'core/router/components/ForbiddenRoute';
import type { ComponentType, MemoExoticComponent, ReactNode } from 'react';
import { Route } from 'react-router';
import type { PathParams, TypedRoute } from '../models/router.models';
import { registerRoute } from '../store/router.store';
import { buildPath, toElement } from './router.utils';

export type CreateRouteProps<Path extends string> = {
  path: Path;
  search?: any;

  disabled?: boolean | (() => boolean);
  forbidden?: boolean | (() => boolean);
  loader?: (args: any) => Promise<unknown>;

  component: ReactNode | MemoExoticComponent<ComponentType<any>>;
  disabledComponent?: ReactNode | MemoExoticComponent<ComponentType<any>>;
  errorComponent?: ReactNode | MemoExoticComponent<ComponentType<any>>;
  forbiddenComponent?: ReactNode | MemoExoticComponent<ComponentType<any>>;
  pendingComponent?: ReactNode | MemoExoticComponent<ComponentType<any>>;
  quotaExceededComponent?: ReactNode | MemoExoticComponent<ComponentType<any>>;

  meta?: {
    title?: string;
    breadcrumb?: string | ((params: any) => string);
  };
};

export const createRoute = <Path extends string>({
  path,
  loader,
  disabled,
  component,
  forbidden,
  forbiddenComponent,
  disabledComponent
}: CreateRouteProps<Path>): TypedRoute<Path> => {
  void loader;

  const page = (
    <DisabledRoute disabled={disabled} fallback={disabledComponent}>
      <ForbiddenRoute forbidden={forbidden} fallback={forbiddenComponent}>
        {toElement(component)}
      </ForbiddenRoute>
    </DisabledRoute>
  );

  return registerRoute({
    path,
    page,
    params: null as PathParams<Path>,
    search: null,
    hash: null,
    route: <Route path={path} element={page} />,
    to: params => buildPath(path, params)
  });
};
