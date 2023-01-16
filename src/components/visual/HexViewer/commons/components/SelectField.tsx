import { FormControl, Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { default as React, memo, PropsWithChildren, useState } from 'react';

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
      textAlign: 'left',
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

export type SelectFieldProps = {
  label?: string;
  description?: string;
  items?: Array<{ value: number; label: string }>;
  value?: number;
  onChange?: (event: SelectChangeEvent<number>, child: React.ReactNode) => void;
};

export const WrappedSelectField = ({
  label = '',
  description = '',
  items = [],
  value = null,
  onChange = () => null
}: SelectFieldProps) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);
  const theme = useTheme();
  const upSM = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <>
      <Grid item sm={4} xs={12} style={{ wordBreak: 'break-word' }}>
        <Tooltip title={description} placement={upSM ? 'right' : 'bottom-start'}>
          <Typography variant="subtitle2">{label}</Typography>
        </Tooltip>
      </Grid>
      <Grid item sm={8} xs={12} style={{ textAlign: 'right' }}>
        <FormControl style={{ width: '100%' }}>
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
            {items.map((item, index) => (
              <MenuItem key={index} className={classes.item} value={item.value}>
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
