import { FormControl, Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';
import type { PropsWithChildren } from 'react';
import { memo, default as React, useState } from 'react';

export type SelectFieldProps = {
  label?: string;
  description?: string;
  size?: 'small' | 'medium';
  items?: { value: number; label: string }[];
  value?: number;
  onChange?: (event: SelectChangeEvent<number>, child: React.ReactNode) => void;
};

export const WrappedSelectField = ({
  label = '',
  description = '',
  size = 'small',
  items = [],
  value = null,
  onChange = () => null
}: SelectFieldProps) => {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);
  const theme = useTheme();
  const upSM = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <>
      <Grid size={{ xs: 12, sm: 4 }} style={{ wordBreak: 'break-word' }}>
        <Tooltip title={description} placement={upSM ? 'right' : 'bottom-start'}>
          <Typography variant="subtitle2">{label}</Typography>
        </Tooltip>
      </Grid>
      <Grid size={{ xs: 12, sm: 8 }} style={{ textAlign: 'right' }}>
        <FormControl style={{ width: '100%' }} size={size}>
          <Select
            open={open}
            onOpen={handleOpen}
            onClose={handleClose}
            value={value}
            onChange={onChange}
            autoWidth
            fullWidth
            variant="outlined"
            sx={{
              textAlign: 'left',
              width: '100%',
              '& > .MuiSelect-root': {
                paddingTop: theme.spacing(1.25),
                paddingBottom: theme.spacing(1.25)
              }
            }}
          >
            {items.map((item, index) => (
              <MenuItem key={index} value={item.value} sx={{ width: '100%' }}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </>
  );
};

export const SelectField = memo(
  WrappedSelectField,
  (
    prevProps: Readonly<PropsWithChildren<SelectFieldProps>>,
    nextProps: Readonly<PropsWithChildren<SelectFieldProps>>
  ) =>
    prevProps.value === nextProps.value &&
    prevProps.items === nextProps.items &&
    prevProps.label === nextProps.label &&
    prevProps.description === nextProps.description
);

export default SelectField;
