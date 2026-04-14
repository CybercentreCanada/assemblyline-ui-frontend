import { useContext, useMemo } from 'react';
import type { AppPreferenceConfigs } from '../AppConfigs';
import { AppContext } from '../AppContexts';
import { AppDefaultsLeftNavConfigs, AppDefaultsPreferencesConfigs, AppDefaultsTopNavConfigs } from '../AppDefaults';

export const useAppPreferences = (): AppPreferenceConfigs => {
  const { preferences } = useContext(AppContext);

  // Merge user provided configs with defaults.
  return useMemo(() => {
    const _configs = {
      preferences: {
        ...AppDefaultsPreferencesConfigs,
        ...(preferences || {}),
        topnav: {
          ...AppDefaultsTopNavConfigs,
          ...(preferences?.topnav || {})
        },
        leftnav: {
          ...AppDefaultsLeftNavConfigs,
          ...(preferences?.leftnav || {})
        }
      }
    };

    // Indicates whether we should render the personalization section of the UserProfile.
    const allowPersonalization =
      _configs.preferences.allowAutoHideTopbar ||
      _configs.preferences.allowBreadcrumbs ||
      _configs.preferences.allowQuickSearch ||
      _configs.preferences.allowReset ||
      _configs.preferences.allowThemeSelection ||
      _configs.preferences.allowLayoutSelection;

    // Rebuild new context.
    return {
      allowPersonalization,
      ..._configs.preferences
    };
  }, [preferences]);
};
