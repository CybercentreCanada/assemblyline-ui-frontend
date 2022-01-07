import { Grid, TextField, Tooltip, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { default as React, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StoreState, useSetting, useStore } from '..';

export const WrappedHexSettings = (states: StoreState) => {
  const { t } = useTranslation(['hexViewer']);
  const { nextSettingValue, nextSettingValues, onSettingClose, onSettingColumnsChange } = useSetting();
  const { setLayoutColumns, setHexBase } = useStore();
  const { settingsOpen, layoutColumns, hexBase, isLoaded } = states;

  const [columns, setColumns] = useState<string>(null);

  useEffect(() => {
    setColumns(nextSettingValue.current.columns);
  }, [isLoaded, nextSettingValue]);

  const handleColumnsChange = event => setLayoutColumns(parseInt(event.target.value));

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
                    onChange={handleColumnsChange}
                    style={{ margin: 0 }}
                  />
                </Grid>
                <HexSelect
                  label={t('columns.label')}
                  description={t('columns.description')}
                  items={nextSettingValues.current.columns}
                  value={columns}
                  onChange={event => {
                    onSettingColumnsChange(event.target.value as string);
                    setColumns(event.target.value as string);
                  }}
                />
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
                    onChange={handleColumnsChange}
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
                {/* <Grid item xs={10} sm={2}>
                  <Select
                    id="user_spec_params"
                    fullWidth
                    // value={tempUserParams.type}
                    // onChange={handleSPTypeChange}
                    variant="outlined"
                    margin="dense"
                  >
                    <MenuItem value="bool">bool</MenuItem>
                    <MenuItem value="int">int</MenuItem>
                    <MenuItem value="list">list ({t('params.comma')})</MenuItem>
                    <MenuItem value="str">str</MenuItem>
                  </Select>
                </Grid> */}
              </Grid>
              {/* <Grid container spacing={1} alignItems="center">
                <Grid item xs={10} sm={3} style={{ wordBreak: 'break-word' }}>
                  {'test'}
                </Grid>
                <Grid item xs={10} sm={9}>
                  <InputField
                    fullWidth
                    type={'number'}
                    size="small"
                    margin="dense"
                    variant="outlined"
                    InputProps={{ inputProps: { min: 1 } }}
                    value={columns}
                    onChange={event => setColumns(parseInt(event.target.value))}
                    style={{ margin: 0 }}
                  />
                </Grid>
              </Grid> */}
            </Grid>
          </Grid>

          {/* <DialogContentText id="alert-dialog-description">
            <TextField
              id="standard-number"
              label="Columns"
              type="number"
              InputLabelProps={{
                shrink: true
              }}
              value={columns}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                setColumns(parseInt(event.target.value))
              }
            />
          </DialogContentText> */}
        </DialogContent>
        {/* <DialogActions>
          <Button onClick={() => onCloseSettings(store)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => onCloseSettings(store)} color="primary" autoFocus>
            Save
          </Button>
        </DialogActions> */}
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
    prevProps.layoutColumns === nextProps.layoutColumns &&
    prevProps.hexBase === nextProps.hexBase
);
export default HexSettings;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      display: 'block',
      marginTop: theme.spacing(2)
    },
    formControl: {
      width: '100%'
    },
    select: {
      width: '100%',
      '& > .MuiSelect-root': {
        paddingTop: theme.spacing(1.25),
        paddingBottom: theme.spacing(1.25)
      }
    },
    item: {
      width: '100%'
    }
  })
);

const HexSelect = ({
  label = '',
  description = '',
  items = [],
  value = '',
  onChange = () => null
}: {
  label?: string;
  description?: string;
  items?: Array<string>;
  value?: string;
  onChange?: (
    event: React.ChangeEvent<{
      name?: string;
      value: unknown;
    }>
  ) => void;
}) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);
  return (
    <>
      <Grid item xs={10} sm={3} style={{ wordBreak: 'break-word' }}>
        <Tooltip title={description} placement="right">
          <Typography variant="subtitle2">{label}</Typography>
        </Tooltip>
      </Grid>
      <Grid item xs={10} sm={9}>
        <FormControl className={classes.formControl}>
          <Select
            className={classes.select}
            open={open}
            onOpen={handleOpen}
            onClose={handleClose}
            value={value}
            onChange={onChange}
            autoWidth
            fullWidth
            variant="outlined"
          >
            {items.map(item => (
              <MenuItem key={item} className={classes.item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </>
  );
};
