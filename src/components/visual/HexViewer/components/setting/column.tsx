import { FormControl, Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { COLUMNS, NumericField, StoreProps, useDispatch } from '../..';

export const WrappedHexColumnSetting = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const theme = useTheme();
  const upSM = useMediaQuery(theme.breakpoints.up('sm'));
  const { onSettingAutoColumnsChange, onSettingColumnsChange } = useDispatch();

  const {
    column: { auto: columnAuto, size: columnSize }
  } = store.setting;

  return (
    <>
      <Grid item sm={4} xs={12} style={{ wordBreak: 'break-word' }}>
        <Tooltip title={t('columns.description')} placement={upSM ? 'right' : 'bottom-start'}>
          <Typography variant="subtitle2">{t('columns.label')}</Typography>
        </Tooltip>
      </Grid>
      <Grid item sm={2} xs={4} style={{ textAlign: 'right' }}>
        <FormControlLabel
          control={
            <Checkbox
              name={t('columns.auto')}
              checked={columnAuto}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => onSettingAutoColumnsChange()}
            />
          }
          label={t('columns.auto')}
        />
      </Grid>
      <Grid item sm={6} xs={8}>
        <FormControl style={{ width: '100%' }}>
          <NumericField
            id={t('columns.label')}
            placeholder={t('columns.description')}
            fullWidth
            margin="dense"
            value={columnSize as number}
            min={1}
            max={264}
            base={10}
            options={COLUMNS.map(c => c.columns)}
            disabled={columnAuto}
            allowNull={false}
            onChange={event => onSettingColumnsChange(event.target.valueAsNumber as number)}
          />
        </FormControl>
      </Grid>
    </>
  );
};

export const HexColumnSetting = React.memo(
  WrappedHexColumnSetting,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.setting.column.auto === nextProps.store.setting.column.auto &&
    prevProps.store.setting.column.size === nextProps.store.setting.column.size
);
