import { Grid, TextField, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { default as React } from 'react';
import { useTranslation } from 'react-i18next';
import { StoreState, useLayout, useStore } from '..';

export const WrappedHexSettings = (states: StoreState) => {
  const { t } = useTranslation(['adminServices']);
  const { onCloseSettings } = useLayout();

  const { setLayoutColumns, setHexBase } = useStore();
  const { settingsOpen, layoutColumns, hexBase } = states;

  const handleColumnsChange = event => setLayoutColumns(parseInt(event.target.value));

  return (
    <div>
      <Dialog
        open={settingsOpen}
        onClose={() => onCloseSettings()}
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
