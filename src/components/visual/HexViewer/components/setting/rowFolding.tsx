import { Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { default as React } from 'react';
import { useTranslation } from 'react-i18next';
import { StoreProps, useStore } from '../..';

export const WrappedRowFoldingSetting = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const theme = useTheme();
  const upSM = useMediaQuery(theme.breakpoints.up('sm'));
  const { update } = useStore();

  return (
    <>
      <Grid size={{ xs: 12, sm: 4 }} style={{ wordBreak: 'break-word' }}>
        <Tooltip title={t('layout.folding.active.description')} placement={upSM ? 'right' : 'bottom-start'}>
          <Typography variant="subtitle2">{t('layout.folding.active.label')}</Typography>
        </Tooltip>
      </Grid>
      <Grid size={{ xs: 4, sm: 2 }} style={{ textAlign: 'left' }}>
        <FormControlLabel
          control={
            <Checkbox
              name={t('layout.folding.active.checkbox')}
              checked={store.setting.layout.folding.active}
              onChange={() => update.store.setting.layout.folding.setActive(active => !active)}
            />
          }
          label={t('layout.folding.active.checkbox')}
        />
      </Grid>
      <Grid size={{ xs: 8, sm: 6 }}></Grid>
    </>
  );
};

export const RowFoldingSetting = React.memo(
  WrappedRowFoldingSetting,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.setting.layout.folding.active === nextProps.store.setting.layout.folding.active &&
    prevProps.store.mode.language === nextProps.store.mode.language
);
