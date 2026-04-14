import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../app';
import { MODULE_NAME } from '../../name';

export const AppThemePicker = () => {
  const { t } = useTranslation(MODULE_NAME);
  const { t: clientT } = useTranslation();
  const { current, themes, setTheme } = useAppTheme();

  const onChange = (event: SelectChangeEvent) => {
    setTheme(event.target.value);
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="personalization-theme-label">{t('personalization.theme')}</InputLabel>
      <Select
        id="personalization-theme"
        label={t('personalization.theme')}
        labelId="personalization-theme-label"
        value={current.id}
        onChange={onChange}
      >
        {themes.map(_theme => (
          <MenuItem key={_theme.id} value={_theme.id}>
            {_theme.i18nKey.startsWith('tui.') ? t(_theme.i18nKey) : clientT(_theme.i18nKey)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
