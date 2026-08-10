import { AppSwitcher } from '@tui/apps';
import type { AppPreferenceConfigs } from '@tui/core';
import { AppBreadcrumbs } from 'core/template/components/Breadcrumbs';
import { DocumentationButton } from 'core/template/components/DocumentationButton';
import { EmailButton } from 'core/template/components/EmailButton';
import { QuickSearch } from 'core/template/components/QuickSearch';
import { UserProfile } from 'core/template/components/UserProfile';
import { useGetTemplateLeftNavMenu } from 'core/template/template.hooks';
import type { AppLeftNavItem } from 'core/template/template.models';
import { Notifications } from 'layout/notifications';
import { useMemo } from 'react';

export type UseAppPreferencesProps = {
  preferences: AppPreferenceConfigs;
  leftNav: AppLeftNavItem[];
};

export const useAppPreferences = ({ preferences, leftNav }: UseAppPreferencesProps) => {
  const leftNavMenu = useGetTemplateLeftNavMenu(leftNav);

  return useMemo<AppPreferenceConfigs>(() => {
    preferences.leftnav.menus = leftNavMenu;
    preferences.topnav.slots.breadcrumbs.left = [<AppBreadcrumbs key="breadcrumbs" />];
    preferences.topnav.slots.search.right = [
      <QuickSearch key="quick-search" />,
      <DocumentationButton key="documentation" />,
      <EmailButton key="email" />,
      <Notifications key="notifications" />,
      <AppSwitcher key="app-switcher" />,
      <UserProfile key="user-profile" />
    ];

    return preferences;
  }, [leftNavMenu, preferences]);
};
