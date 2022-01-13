import { Grid, TextField, Typography } from '@material-ui/core';
import Collapse from '@material-ui/core/Collapse';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { default as React, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckBoxNumberField,
  NumericField,
  SelectField,
  StoreState,
  useHex,
  useLayout,
  useSetting,
  useStore
} from '..';

export const WrappedHexSettings = (states: StoreState) => {
  const {
    settingsOpen,
    hexBaseValues,
    layoutColumns,
    layoutAutoColumns,
    layoutRows,
    layoutAutoRows,
    hexBase,
    initialized
  } = states;

  const { t } = useTranslation(['hexViewer']);
  const { onSettingClose } = useSetting();
  const { setHexBase } = useStore();
  const { onHexBaseChange } = useHex();
  const { onLayoutAutoColumnsChange, onLayoutColumnsChange, onLayoutAutoRowsChange, onLayoutRowsChange } = useLayout();

  const [value, setValue] = useState(0);

  return (
    <div>
      <Dialog
        open={settingsOpen}
        onClose={() => onSettingClose()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12}>
              <Typography variant="subtitle2">{t('grid parameters')}</Typography>
            </Grid>
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
                <Collapse in={layoutAutoRows} timeout="auto" unmountOnExit>
                  <Grid item xs={10} sm={3} style={{ wordBreak: 'break-word' }}>
                    {'rows [int]:'}
                  </Grid>
                  <Grid item xs={10} sm={9}>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      margin="dense"
                      variant="outlined"
                      InputProps={{ inputProps: { min: 1 } }}
                      value={layoutColumns}
                      onChange={event => onLayoutColumnsChange(parseInt(event.target.value))}
                      style={{ margin: 0 }}
                    />
                  </Grid>
                </Collapse>
                <Grid item xs={10} sm={3} style={{ wordBreak: 'break-word' }}>
                  {'rows [int]:'}
                </Grid>
                <Grid item xs={10} sm={9}>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    margin="dense"
                    variant="outlined"
                    InputProps={{ inputProps: { min: 1 } }}
                    value={layoutColumns}
                    onChange={event => onLayoutColumnsChange(parseInt(event.target.value))}
                    style={{ margin: 0 }}
                  />
                </Grid>
                <Grid item xs={10} sm={3} style={{ wordBreak: 'break-word' }}>
                  {'base [int]:'}
                </Grid>
                <Grid item xs={10} sm={9}>
                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    margin="dense"
                    variant="outlined"
                    InputProps={{ inputProps: { min: 2, max: 36 } }}
                    value={hexBase}
                    onChange={event => setHexBase(parseInt(event.target.value))}
                    style={{ margin: 0 }}
                  />
                </Grid>
                <Grid item xs={10} sm={3} style={{ wordBreak: 'break-word' }}>
                  {'base [int]:'}
                </Grid>
                <Grid item xs={10} sm={9}>
                  <NumericField
                    value={value}
                    base={16}
                    step={1}
                    fullWidth
                    onChange={event => {
                      // console.log(event.target.valueAsNumber);
                      setValue(event.target.valueAsNumber);
                    }}
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
    prevProps.hexBase === nextProps.hexBase
);
export default HexSettings;
