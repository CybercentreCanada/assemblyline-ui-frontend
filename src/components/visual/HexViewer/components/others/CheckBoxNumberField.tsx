import { FormControl, Grid, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { default as React } from 'react';

export type CheckBoxNumberFieldProps = {
  label?: string;
  description?: string;
  checkedLabel?: string;
  checked?: boolean;
  onChecked?: (checked: boolean) => void;
  value?: number;
  onNumberChange?: (value: number) => void;
  min?: number;
  max?: number;
};

export const WrappedCheckBoxNumberField = ({
  label = '',
  description = '',
  checkedLabel = '',
  checked = false,
  onChecked = () => null,
  value = 0,
  onNumberChange = () => null,
  min = 0,
  max = 1
}: CheckBoxNumberFieldProps) => {
  const theme = useTheme();
  const upSM = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <>
      <Grid item sm={4} xs={12} style={{ wordBreak: 'break-word' }}>
        <Tooltip title={description} placement={upSM ? 'right' : 'bottom-start'}>
          <Typography variant="subtitle2">{label}</Typography>
        </Tooltip>
      </Grid>
      <Grid item sm={2} xs={4} style={{ textAlign: 'right' }}>
        <FormControlLabel
          control={
            <Checkbox
              name={checkedLabel}
              checked={checked}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChecked(event.target.checked)}
            />
          }
          label={checkedLabel}
        />
      </Grid>
      <Grid item sm={6} xs={8}>
        <FormControl style={{ width: '100%' }}>
          <TextField
            fullWidth
            type="number"
            size="small"
            margin="dense"
            variant="outlined"
            disabled={checked}
            InputProps={{ inputProps: { min: min, max: max } }}
            value={value}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
              onNumberChange(parseInt(event.target.value));
            }}
            style={{ margin: 0 }}
          />
        </FormControl>
      </Grid>
    </>
  );
};

export const CheckBoxNumberField = React.memo(WrappedCheckBoxNumberField);
export default CheckBoxNumberField;
