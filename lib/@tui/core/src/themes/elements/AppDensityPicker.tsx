import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { AppDensityMode } from '../../app/AppConfigs';
import { useCookiesStore } from '../../cookies';
import { MODULE_NAME } from '../../name';

export const AppDensityPicker = () => {
  const { t } = useTranslation(MODULE_NAME);
  const density = useCookiesStore(store => store.density);
  const setDensity = useCookiesStore(store => store.setDensity);

  const onChange = (event: SelectChangeEvent) => {
    setDensity(event.target.value as AppDensityMode);
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="personalization-density-label">{t('personalization.density')}</InputLabel>
      <Select
        id="personalization-density"
        label={t('personalization.density')}
        labelId="personalization-density-label"
        value={density}
        onChange={onChange}
      >
        <MenuItem value="comfortable">{t('personalization.density.default')}</MenuItem>
        <MenuItem value="compact">{t('personalization.density.compact')}</MenuItem>
        <MenuItem value="dense">{t('personalization.density.dense')}</MenuItem>
      </Select>
    </FormControl>
  );
};
