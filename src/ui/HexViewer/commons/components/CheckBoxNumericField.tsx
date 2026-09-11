import { FormControl, Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { default as React } from 'react';
import { NumericField } from '..';

export type CheckBoxNumericFieldProps = {
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

export const WrappedCheckBoxNumericField = ({
  label = '',
  description = '',
  checkedLabel = '',
  checked = false,
  onChecked = () => null,
  value = 0,
  onNumberChange = () => null,
  min = 0,
  max = 1
}: CheckBoxNumericFieldProps) => {
  const theme = useTheme();
  const upSM = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <>
      <Grid size={{ xs: 12, sm: 4 }} style={{ wordBreak: 'break-word' }}>
        <Tooltip title={description} placement={upSM ? 'right' : 'bottom-start'}>
          <Typography variant="subtitle2">{label}</Typography>
        </Tooltip>
      </Grid>
      <Grid size={{ xs: 4, sm: 2 }} style={{ textAlign: 'right' }}>
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
      <Grid size={{ xs: 8, sm: 6 }}>
        <FormControl style={{ width: '100%' }} size="small">
          <NumericField
            id={label}
            placeholder={description}
            fullWidth
            size="small"
            margin="dense"
            value={value}
            min={min}
            max={max}
            base={10}
            onChange={event => onNumberChange(event.target.valueAsNumber as number)}
          />
        </FormControl>
      </Grid>
    </>
  );
};

export const CheckBoxNumericField = React.memo(WrappedCheckBoxNumericField);
export default CheckBoxNumericField;
