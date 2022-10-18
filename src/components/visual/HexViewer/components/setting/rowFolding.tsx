import { Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
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
      <Grid item sm={4} xs={12} style={{ wordBreak: 'break-word' }}>
        <Tooltip title={t('layout.folding.active.description')} placement={upSM ? 'right' : 'bottom-start'}>
          <Typography variant="subtitle2">{t('layout.folding.active.label')}</Typography>
        </Tooltip>
      </Grid>
      <Grid item sm={2} xs={4} style={{ textAlign: 'left' }}>
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
      <Grid item sm={6} xs={8}></Grid>
    </>
  );
};

export const RowFoldingSetting = React.memo(
  WrappedRowFoldingSetting,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.setting.layout.folding.active === nextProps.store.setting.layout.folding.active &&
    prevProps.store.mode.language === nextProps.store.mode.language
);
