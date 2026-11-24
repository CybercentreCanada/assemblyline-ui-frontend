import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from '@mui/material';
import { getAppConfigStateFromApi, useAppConfigStoreApi } from 'core/config';
import type { AppLocation, AppNavigationStore } from 'core/router';
import {
  findAppRouteFromKey,
  getAppLocationParamStateFromApi,
  getAppNavigationStateFromApi,
  getAppRouterStateFromApi,
  getBlockedPages,
  getHashFragmentsFromRouter,
  getLocationStateFromRouter,
  getRouteParamFromKey,
  hasBlockedPages,
  restoreNavigationStoreFromRouter,
  setNavigationBlockerBypass,
  useAppLocationParamStoreApi,
  useAppNavigationStoreApi,
  useAppRouterStoreApi,
  useAppSetNavigationStore
} from 'core/router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Button } from 'ui/buttons/Button';

export const NavigationBlocker = memo(() => {
  const { t } = useTranslation(['router']);
  const location = useLocation() as AppLocation;
  const navigate = useNavigate();
  const configStoreApi = useAppConfigStoreApi();
  const locationParamStoreApi = useAppLocationParamStoreApi();
  const navigationStoreApi = useAppNavigationStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const setNavigationStore = useAppSetNavigationStore();

  const [open, setOpen] = useState<boolean>(false);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  const acceptedNavigationId = useRef<string | null>(null);
  const locationStateId = location.state?.id;

  const blockedPageMentions = useMemo<string[]>(() => {
    const navigationState = getAppNavigationStateFromApi(navigationStoreApi);
    const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);

    return getBlockedPages(navigationState)
      .map(([pageKey, reason]) => {
        const route = findAppRouteFromKey(locationState, pageKey);
        const routeParam = getRouteParamFromKey(locationState, pageKey);
        const configState = getAppConfigStateFromApi(configStoreApi);
        const name = route.fullname(routeParam as never, configState);
        const title = name && t(name?.[0], name?.[1]);

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
  }, [configStoreApi, open, locationParamStoreApi, navigationStoreApi, t]);

  const handleCancel = useCallback(() => {
    setOpen(false);
    acceptedNavigationId.current = null;

    const routerState = getAppRouterStateFromApi(routerStoreApi);
    const shouldRestoreBrowserLocation = locationStateId !== routerState.id;
    setNavigationStore(store => restoreNavigationStoreFromRouter(store, routerState));

    if (shouldRestoreBrowserLocation) {
      const restoredNavigation = getAppNavigationStateFromApi(navigationStoreApi);
      const fragments = getHashFragmentsFromRouter(restoredNavigation);
      void navigate(!fragments.length ? '/v1' : `/v1#${fragments.join('#')}`, {
        state: getLocationStateFromRouter(restoredNavigation),
        replace: true
      });
    }
  }, [locationStateId, navigate, navigationStoreApi, routerStoreApi, setNavigationStore]);

  const handleAccept = useCallback(() => {
    setOpen(false);
    acceptedNavigationId.current = getAppNavigationStateFromApi(navigationStoreApi).id;
  }, [navigationStoreApi]);

  const handleDialogExited = useCallback(() => {
    const navigationId = acceptedNavigationId.current;
    acceptedNavigationId.current = null;
    if (!navigationId) return;
    setNavigationStore(store => {
      return store.id !== navigationId ? store : setNavigationBlockerBypass(store, true);
    });
  }, [setNavigationStore]);

  const handleDialogEntered = useCallback(() => {
    requestAnimationFrame(() => acceptButtonRef.current?.focus());
  }, []);

  const handleNavigationChange = useCallback(
    (store: AppNavigationStore) => {
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      if (store.options?.ignoreBlocker) {
        setOpen(false);
        return;
      }
      if (hasBlockedPages(store, routerState) && store.id !== routerState.id) setOpen(true);
      else setOpen(false);
    },
    [routerStoreApi]
  );

  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      const navigationState = getAppNavigationStateFromApi(navigationStoreApi);
      if (!getBlockedPages(navigationState).length) return;
      event.preventDefault();
      event.returnValue = '';
    },
    [navigationStoreApi]
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
          onEntered: handleDialogEntered,
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
          <DialogContentText id="app-navigate-blocker-description">{t('router_prompt_text')}</DialogContentText>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          {t('router_prompt_cancel')}
        </Button>
        <Button ref={acceptButtonRef} onClick={handleAccept} color="primary" autoFocus>
          {t('router_prompt_accept')}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

NavigationBlocker.displayName = 'NavigationBlocker';
