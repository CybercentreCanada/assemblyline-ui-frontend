import { AppPreferenceConfigs } from '@tui/core';
import { useMemo } from 'react';

export const useAppPreferences = () => {
  return useMemo<AppPreferenceConfigs>((): AppPreferenceConfigs => ({}), []);
};
