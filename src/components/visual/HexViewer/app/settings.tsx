import { Grid, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { default as React, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckBoxNumberField, SelectField, StoreState, useHex, useLayout, useScroll, useSetting } from '..';

export const WrappedHexSettings = (states: StoreState) => {
  const {
    settingsOpen,
    hexBaseValues,
    layoutColumns,
    layoutAutoColumns,
    layoutRows,
    layoutAutoRows,
    hexBase,
    scrollSpeed
  } = states;

  const theme = useTheme();
  const upSM = useMediaQuery(theme.breakpoints.up('sm'));
  const { t } = useTranslation(['hexViewer']);
  const { onSettingClose, onSettingSave } = useSetting();
  const { onHexBaseChange } = useHex();
  const { onLayoutAutoColumnsChange, onLayoutColumnsChange, onLayoutAutoRowsChange, onLayoutRowsChange } = useLayout();
  const { onScrollSpeedChange } = useScroll();

  useLayoutEffect(() => {
    return () => onSettingSave();
  }, [layoutColumns, layoutAutoColumns, layoutRows, layoutAutoRows, hexBase, scrollSpeed, onSettingSave]);

  return (
    <div>
      <Dialog open={settingsOpen} onClose={() => onSettingClose()}>
        <DialogTitle>{t('settings.title')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12}>
              <Grid container spacing={1} alignItems="center">
                <SelectField
                  label={t('base.label')}
                  description={t('base.description')}
                  value={hexBase}
                  items={hexBaseValues}
                  onChange={onHexBaseChange}
                />
                <CheckBoxNumberField
                  label={t('columns.label')}
                  description={t('columns.description')}
                  checkedLabel={t('columns.auto')}
                  checked={layoutAutoColumns}
                  onChecked={onLayoutAutoColumnsChange}
                  value={layoutColumns}
                  onNumberChange={onLayoutColumnsChange}
                  min={1}
                  max={264}
                />
                <CheckBoxNumberField
                  label={t('rows.label')}
                  description={t('rows.description')}
                  checkedLabel={t('rows.auto')}
                  checked={layoutAutoRows}
                  onChecked={onLayoutAutoRowsChange}
                  value={layoutRows}
                  onNumberChange={onLayoutRowsChange}
                  min={1}
                  max={264}
                />
                <Grid item sm={4} xs={12} style={{ wordBreak: 'break-word' }}>
                  <Tooltip title={t('scrollspeed.description')} placement={upSM ? 'right' : 'bottom-start'}>
                    <Typography variant="subtitle2">{t('scrollspeed.label')}</Typography>
                  </Tooltip>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    margin="dense"
                    variant="outlined"
                    InputProps={{ inputProps: { min: 1 } }}
                    value={scrollSpeed}
                    onChange={event => onScrollSpeedChange(parseInt(event.target.value))}
                    style={{ margin: 0 }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const HexSettings = React.memo(
  WrappedHexSettings,
  (
    prevProps: Readonly<React.PropsWithChildren<StoreState>>,
    nextProps: Readonly<React.PropsWithChildren<StoreState>>
  ) =>
    prevProps.settingsOpen === nextProps.settingsOpen &&
    prevProps.hexBaseValues === nextProps.hexBaseValues &&
    prevProps.layoutColumns === nextProps.layoutColumns &&
    prevProps.layoutAutoColumns === nextProps.layoutAutoColumns &&
    prevProps.layoutRows === nextProps.layoutRows &&
    prevProps.layoutAutoRows === nextProps.layoutAutoRows &&
    prevProps.hexBase === nextProps.hexBase &&
    prevProps.scrollSpeed === nextProps.scrollSpeed
);
export default HexSettings;
