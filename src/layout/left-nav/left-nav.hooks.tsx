import type { AppPreferenceConfigs } from '@tui/core';
import { getAppConfigStateFromApi, useAppConfigStoreApi } from 'core/config';
import { getAppLocationParamStateFromApi, useAppLocationParamStore, useAppLocationParamStoreApi } from 'core/routes';
import type { AppLeftNavItem } from 'layout/left-nav/left-nav.models';
import { getLeftNavMenuItem } from 'layout/left-nav/left-nav.utils';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * @name useParseTemplateLeftNavMenu
 * @description Converts app left-nav items into the template's left-nav menu config, dropping hidden routes and empty menus.
 * @param leftNavs - Left-nav items to convert
 * @returns Left-nav menu config consumed by the template
 */
export const useParseTemplateLeftNavMenu = (
  leftNavs: AppLeftNavItem[] = []
): AppPreferenceConfigs['leftnav']['menus'] => {
  const { t, i18n } = useTranslation();

  const configStoreApi = useAppConfigStoreApi();
  const locationParamStoreApi = useAppLocationParamStoreApi();
  const routesLength = useAppLocationParamStore(s => Object.keys(s?.routes || {}).length);

  const buildMenu = useCallback((): AppPreferenceConfigs['leftnav']['menus'] => {
    const configState = getAppConfigStateFromApi(configStoreApi);
    const locationParamState = getAppLocationParamStateFromApi(locationParamStoreApi);

    const items = leftNavs
      .map((item, index) => getLeftNavMenuItem(item, index, locationParamState, configState, t))
      .filter(item => item !== null);

    return [{ id: 'menu', type: 'menu', items }];
  }, [configStoreApi, locationParamStoreApi, leftNavs, t]);

  const [menu, setMenu] = useState<AppPreferenceConfigs['leftnav']['menus']>(buildMenu);

  useEffect(() => {
    const unsubscribeConfig = configStoreApi?.subscribe(() => setMenu(buildMenu()));

    return () => {
      unsubscribeConfig?.();
    };
  }, [buildMenu, configStoreApi]);

  useEffect(() => {
    setMenu(buildMenu());
  }, [buildMenu, i18n.language, routesLength]);

  return menu;
};
