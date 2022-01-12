import { FormControl, Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { default as React, useState } from 'react';

export type SelectFieldProps = {
  label?: string;
  description?: string;
  items?: Array<{
    value: number;
    label: string;
  }>;
  value?: number;
  onChange?: (
    event: React.ChangeEvent<{
      name?: string;
      value: unknown;
    }>,
    child: React.ReactNode
  ) => void;
};

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

export const SelectField = React.memo(WrappedSelectField);
export default SelectField;
