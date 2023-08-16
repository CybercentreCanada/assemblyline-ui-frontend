import { Popover, TextField, Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import CustomChip from 'components/visual/CustomChip';
import 'moment/locale/fr';
import React, { useCallback, useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  chipRoot: { paddingTop: '6px' },
  chipLabel: { paddingLeft: theme.spacing(0.25), paddingRight: theme.spacing(0.25), fontSize: '18px' }
}));

type Props = {
  value: string;
  label: string;
  onChange: (value: string) => void;
};

export const WrappedDateSelector = ({ value: propValue = '', label = '', onChange = null }: Props) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const [value, setValue] = useState<string>(propValue);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    onChange(value);
  };

  const handleIndexClick = useCallback(
    (key: string) => (event: React.MouseEvent<any>) => {
      onChange(key);
      setAnchorEl(null);
    },
    [onChange]
  );

  return (
    <>
      <CustomChip
        aria-describedby={id}
        size="medium"
        type="round"
        variant="outlined"
        label={
          <>
            <span style={{ fontWeight: 700 }}>{label}</span>
            <span>{value}</span>
          </>
        }
        onClick={handleClick}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        transitionDuration={0}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        style={{ maxHeight: '50vh' }}
      >
        <TextField value={value} onChange={e => setValue(e.target.value)} size="small" />
      </Popover>
    </>
  );
};

export const DateSelector = React.memo(WrappedDateSelector);

export default DateSelector;
