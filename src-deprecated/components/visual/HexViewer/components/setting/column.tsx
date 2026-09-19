import { FormControl, Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import type { StoreProps } from 'components/visual/HexViewer';
import { COLUMNS, NumericField, useDispatch, useStore } from 'components/visual/HexViewer';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const WrappedHexColumnSetting = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const theme = useTheme();
  const upSM = useMediaQuery(theme.breakpoints.up('sm'));
  const { onSettingAutoColumnChange } = useDispatch();
  const { update } = useStore();

  return (
    <>
      <Grid size={{ xs: 12, sm: 4 }} style={{ wordBreak: 'break-word' }}>
        <Tooltip title={t('columns.description')} placement={upSM ? 'right' : 'bottom-start'}>
          <Typography variant="subtitle2">{t('columns.label')}</Typography>
        </Tooltip>
      </Grid>
      <Grid size={{ xs: 4, sm: 2 }} style={{ textAlign: 'left' }}>
        <FormControlLabel
          control={
            <Checkbox
              name={t('columns.auto')}
              checked={store.setting.layout.column.auto}
              onChange={() => onSettingAutoColumnChange()}
            />
          }
          label={t('columns.auto')}
        />
      </Grid>
      <Grid size={{ xs: 8, sm: 6 }}>
        <FormControl style={{ width: '100%' }}>
          <NumericField
            id={t('columns.label')}
            placeholder={t('columns.description')}
            fullWidth
            size="small"
            margin="dense"
            value={store.setting.layout.column.max}
            min={1}
            max={264}
            base={10}
            options={COLUMNS.filter(c => ![0, 1].includes(c.columns)).map(c => c.columns)}
            disabled={store.setting.layout.column.auto}
            allowNull={false}
            direction="inverse"
            onChange={event => update.store.setting.layout.column.setMax(event.target.valueAsNumber)}
          />
        </FormControl>
      </Grid>
    </>
  );
};

export const HexColumnSetting = React.memo(
  WrappedHexColumnSetting,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.setting.layout.column.auto === nextProps.store.setting.layout.column.auto &&
    prevProps.store.setting.layout.column.max === nextProps.store.setting.layout.column.max &&
    prevProps.store.mode.language === nextProps.store.mode.language
);
