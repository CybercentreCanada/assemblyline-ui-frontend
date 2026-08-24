import { MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import { useAppConfigs } from 'commons/components/app/hooks';
import { AppThemesContext } from 'commons/components/app/providers/AppThemesProvider';

import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const AppThemePicker = () => {
  const { t } = useTranslation();
  const configs = useAppConfigs();
  const { current, themes, setTheme } = useContext(
    configs.overrides?.providers?.themesProvider?.context ?? AppThemesContext
  );

  const onChange = (event: SelectChangeEvent) => {
    setTheme(event.target.value);
  };

  const currentId = useMemo(() => themes?.findIndex(_theme => _theme.configs === current), [current, themes]);

  return (
    <Select fullWidth size="small" value={`${currentId}`} onChange={onChange}>
      {themes.map((_theme, index) => (
        <MenuItem key={_theme.id} value={index}>
          {t(_theme.i18nKey)}
        </MenuItem>
      ))}
    </Select>
  );
};
