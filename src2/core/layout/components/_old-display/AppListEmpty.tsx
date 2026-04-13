import type { FC } from 'react';
import { AppInfoPanel, type AppInfoPanelProps } from '../display/AppInfoPanel';

export const AppListEmpty: FC<Omit<AppInfoPanelProps, 'i18nKey'>> = props => {
  return <AppInfoPanel {...props} i18nKey="app.list.empty" />;
};
