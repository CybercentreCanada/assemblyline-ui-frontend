import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from '@mui/material';
import type { AppNavigationStore, InferAppNavigationPropsFromPath } from 'core/router';
import {
  clearBlockedPages,
  getAppNavigationStateFromApi,
  getAppRouterStateFromApi,
  getBlockedPages,
  hasBlockedPages,
  useAppExternalHref,
  useAppNavigate,
  useAppNavigationStoreApi,
  useAppRouterStoreApi,
  useAppSetNavigationStore
} from 'core/router';
import { findAppRouteFromKey, getAppLocationParamStateFromApi, useAppLocationParamStoreApi } from 'core/routes';
import type { ForwardedRef } from 'react';
import { forwardRef, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LinkProps as RouterLinkProps } from 'react-router';
import { Link } from 'react-router';

//*****************************************************************************************
// App Link
//*****************************************************************************************

export type AppLinkProps<Origin extends AppRoute['path']> = InferAppNavigationPropsFromPath<Origin> &
  Omit<RouterLinkProps, 'to' | 'pathname' | 'search' | 'hash'>;

export function WrappedAppLink<const Origin extends AppRoute['path']>(
  { children, nav = null, navDeps = null, onClick, ...props }: AppLinkProps<Origin>,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  const href = useAppExternalHref<Origin>(nav, navDeps);
  const navigate = useAppNavigate();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      onClick?.(event);
      if (!nav) return;

      event.preventDefault();
      event.stopPropagation();
      nav?.(navigate);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, onClick, ...(navDeps ?? [nav])]
  );

  return (
    <Link {...props} ref={ref} to={href} onClick={handleClick}>
      {children}
    </Link>
  );
}

WrappedAppLink.displayName = 'WrappedAppLink';

export const AppLink = memo(forwardRef(WrappedAppLink)) as <const Origin extends AppRoute['path']>(
  props: AppLinkProps<Origin> & { ref?: ForwardedRef<HTMLAnchorElement> }
) => React.JSX.Element | null;

(AppLink as unknown as { displayName: string }).displayName = 'AppLink';

//*****************************************************************************************
// App Navigate
//*****************************************************************************************

export type AppNavigateProps<Origin extends AppRoute['path']> = InferAppNavigationPropsFromPath<Origin>;

export function WrappedAppNavigate<const Origin extends AppRoute['path']>({
  nav,
  navDeps = null
}: AppNavigateProps<Origin>) {
  const navigate = useAppNavigate();

  const hasNavigatedRef = useRef<boolean>(false);

  useLayoutEffect(() => {
    if (!nav || hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    nav(navigate);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, ...(navDeps ?? [nav])]);

  return null;
}

WrappedAppNavigate.displayName = 'WrappedAppNavigate';

export const AppNavigate = memo(WrappedAppNavigate) as <const Origin extends AppRoute['path']>(
  props: AppNavigateProps<Origin>
) => React.JSX.Element | null;

(AppNavigate as unknown as { displayName: string }).displayName = 'AppNavigate';

//*****************************************************************************************
// App Router Blocker
//*****************************************************************************************

export const AppNavigationBlocker = memo(() => {
  const { t } = useTranslation(['router']);
  const locationParamStoreApi = useAppLocationParamStoreApi();
  const navigationStoreApi = useAppNavigationStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const setNavigationStore = useAppSetNavigationStore();

  const [open, setOpen] = useState<boolean>(false);

  const shouldClearBlockedPages = useRef<boolean>(false);

  const blockedPageMentions = useMemo<string[]>(() => {
    const navigationState = getAppNavigationStateFromApi(navigationStoreApi);
    const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);

    return getBlockedPages(navigationState)
      .map(([pageKey, reason]) => {
        const route = findAppRouteFromKey(locationState, pageKey);
        const title = t(route.title.key, { ns: route.title.ns });

        switch (reason) {
          case 'unsaved_changes':
            return t('router_blocker_reason_unsaved_changes', { page: title });
          case 'data_loss_on_leave':
            return t('router_blocker_reason_data_loss_on_leave', { page: title });
          case 'external_leave_risk':
            return t('router_blocker_reason_external_leave_risk', { page: title });
          default:
            return null;
        }
      })
      .filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, locationParamStoreApi, navigationStoreApi, t]);

  const handleCancel = useCallback(() => {
    setOpen(false);
    shouldClearBlockedPages.current = false;
  }, []);

  const handleAccept = useCallback(() => {
    setOpen(false);
    shouldClearBlockedPages.current = true;
  }, []);

  const handleDialogExited = useCallback(() => {
    if (!shouldClearBlockedPages.current) return;
    shouldClearBlockedPages.current = false;
    setNavigationStore(clearBlockedPages);
  }, [setNavigationStore]);

  const handleNavigationChange = useCallback(
    (store: AppNavigationStore) => {
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      if (hasBlockedPages(store, routerState) && store.id !== routerState.id) setOpen(true);
      else setOpen(false);
    },
    [routerStoreApi]
  );

  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      const navigationState = getAppNavigationStateFromApi(navigationStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      if (!hasBlockedPages(navigationState, routerState)) return;
      event.preventDefault();
      event.returnValue = '';
    },
    [navigationStoreApi, routerStoreApi]
  );

  useEffect(() => {
    if (!navigationStoreApi) return;
    handleNavigationChange(navigationStoreApi.getState());
    return navigationStoreApi.subscribe(handleNavigationChange);
  }, [handleNavigationChange, navigationStoreApi]);

  useEffect(() => {
    if (!navigationStoreApi) return;
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [handleBeforeUnload, navigationStoreApi]);

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      slotProps={{
        transition: {
          onExited: handleDialogExited
        }
      }}
      aria-labelledby="app-navigate-blocker-title"
      aria-describedby="app-navigate-blocker-description"
    >
      <DialogTitle id="app-navigate-blocker-title">{t('router_prompt_title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {blockedPageMentions.flatMap((mention, i) => (
            <DialogContentText key={`${mention}-${i}`}>{mention}</DialogContentText>
          ))}
          <DialogContentText>{t('router_prompt_text')}</DialogContentText>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          {t('router_prompt_cancel')}
        </Button>
        <Button onClick={handleAccept} color="primary" autoFocus>
          {t('router_prompt_accept')}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

AppNavigationBlocker.displayName = 'AppNavigationBlocker';
