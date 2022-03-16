import { Grid, makeStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { default as React } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckBoxNumericField, SelectField, StoreProps, useDispatch, useReducer } from '../..';

const useHexStyles = makeStyles(theme => ({
  root: {
    paddingBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center'
  },
  toolbar: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '1200px',
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  },
  divider: {
    height: 28,
    margin: 4
  },
  dialog: {}
}));

export const WrappedHexSettings = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const classes = useHexStyles();
  // const { onSettingClose, onSettingSave } = useSetting();
  // const { onHexBaseChange } = useHex();
  // const { onLayoutAutoColumnsChange, onLayoutColumnsChange, onLayoutAutoRowsChange, onLayoutRowsChange } = useLayout();
  // const { onScrollSpeedChange, onScrollResize } = useScroll();

  // useLayoutEffect(() => {
  //   return () => onSettingSave();
  // }, [layoutColumns, layoutAutoColumns, layoutRows, layoutAutoRows, hexBase, scrollSpeed, onSettingSave]);

  const { refs } = useReducer();
  const { onSettingClose, onSettingOffsetBaseChange, onSettingAutoColumnsChange, onSettingColumnsChange } =
    useDispatch();

  // const {
  //   settingsOpen,
  //   hexBaseValues,
  //   layoutColumns,
  //   layoutAutoColumns,
  //   layoutRows,
  //   layoutAutoRows,
  //   hexBase,
  //   scrollSpeed
  // } = states;

  const {
    offset: { base: offset },
    setting: {
      open: settingsOpen,
      offsetBase: { value: offsetBaseValue, v: offsetBaseValues }
    }
  } = store;

  return (
    <div>
      <Dialog className={classes.dialog} open={settingsOpen} onClose={() => onSettingClose()}>
        <DialogTitle>{t('settings.title')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12}>
              <Grid container spacing={1} alignItems="center">
                <SelectField
                  label={t('base.label')}
                  description={t('base.description')}
                  value={offsetBaseValue}
                  items={offsetBaseValues}
                  onChange={onSettingOffsetBaseChange}
                />

                <CheckBoxNumericField
                  label={t('columns.label')}
                  description={t('columns.description')}
                  checkedLabel={t('columns.auto')}
                  checked={store.layout.column.auto}
                  onChecked={onSettingAutoColumnsChange}
                  value={store.layout.column.size}
                  onNumberChange={(value: number) => {
                    onSettingColumnsChange(value);
                    // onLayoutColumnsChange(value);
                    // onScrollResize();
                  }}
                  min={1}
                  max={264}
                />
                {/*
                <CheckBoxNumberField
                  label={t('rows.label')}
                  description={t('rows.description')}
                  checkedLabel={t('rows.auto')}
                  checked={layoutAutoRows}
                  onChecked={onLayoutAutoRowsChange}
                  value={layoutRows}
                  onNumberChange={(value: number) => {
                    onLayoutRowsChange(value);
                    onScrollResize();
                  }}
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
                </Grid> */}
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
    prevProps: Readonly<React.PropsWithChildren<StoreProps>>,
    nextProps: Readonly<React.PropsWithChildren<StoreProps>>
  ) =>
    prevProps.store.setting.open === nextProps.store.setting.open &&
    prevProps.store.setting.offsetBase.values === nextProps.store.setting.offsetBase.values &&
    prevProps.store.setting.offsetBase.value === nextProps.store.setting.offsetBase.value &&
    prevProps.store.layout.column.auto === nextProps.store.layout.column.auto &&
    prevProps.store.layout.column.size === nextProps.store.layout.column.size
  // (prevProps: Readonly<React.PropsWithChildren<HexStore>>, nextProps: Readonly<React.PropsWithChildren<HexStore>>) =>
  //   prevProps.settingsOpen === nextProps.settingsOpen &&
  //   prevProps.hexBaseValues === nextProps.hexBaseValues &&
  //   prevProps.layoutColumns === nextProps.layoutColumns &&
  //   prevProps.layoutAutoColumns === nextProps.layoutAutoColumns &&
  //   prevProps.layoutRows === nextProps.layoutRows &&
  //   prevProps.layoutAutoRows === nextProps.layoutAutoRows &&
  //   prevProps.hexBase === nextProps.hexBase &&
  //   prevProps.scrollSpeed === nextProps.scrollSpeed
);
export default HexSettings;
