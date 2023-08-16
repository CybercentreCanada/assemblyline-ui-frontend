import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import { List, ListItem, ListItemButton, ListItemText, ListSubheader, Popover, Theme } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import makeStyles from '@mui/styles/makeStyles';
import CustomChip from 'components/visual/CustomChip';
import { Field, FIELDS } from 'components/visual/Search2/models';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useState } from 'react';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

const useStyles = makeStyles((theme: Theme) => ({
  chipRoot: { paddingTop: '6px' },
  chipLabel: { paddingLeft: theme.spacing(0.25), paddingRight: theme.spacing(0.25), fontSize: '18px' }
}));

type Props = {
  value: string;
  label: string;
  fields: { [key: string]: Field };
  onChange: (value: string) => void;
};

const names = [
  'Oliver Hansen',
  'Van Henry',
  'April Tucker',
  'Ralph Hubbard',
  'Omar Alexander',
  'Carlos Abbott',
  'Miriam Wagner',
  'Bradley Wilkerson',
  'Virginia Andrews',
  'Kelly Snyder'
];

export const WrappedCheckmarkSelector = ({ value = '', label = '', fields = {}, onChange = null }: Props) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const [values, setValues] = useState<string[]>(value ? value.split(',') : []);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    onChange(values.join(','));
  };

  const handleIndexClick = useCallback(
    (key: string) => (event: React.MouseEvent<any>) => {
      setValues(v => (v.includes(key) ? v.filter(i => i !== key) : [...v, key]));
    },
    []
  );

  useEffect(() => {
    setValues(value ? value.split(',') : []);
  }, [value]);

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
        <List
          dense
          sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
          subheader={<ListSubheader component="div" children="Indices" />}
        >
          {Object.entries(fields).map(([key, field], i) => (
            <ListItem key={`${key}-${i}`} disablePadding>
              <ListItemButton role={undefined} dense onClick={handleIndexClick(key)}>
                <ListItemIcon>
                  <CustomChip
                    classes={{
                      root: classes.chipRoot,
                      label: classes.chipLabel
                    }}
                    size="small"
                    type="rounded"
                    variant="outlined"
                    color={field.type in FIELDS ? FIELDS[field.type].color : 'default'}
                    label={field.type in FIELDS ? FIELDS[field.type].icon : null}
                  />
                </ListItemIcon>
                <ListItemText primary={key} />
                <ListItemIcon style={{ justifyContent: 'flex-end' }}>
                  {values.includes(key) ? (
                    <CheckBoxOutlinedIcon color="primary" />
                  ) : (
                    <CheckBoxOutlineBlankOutlinedIcon />
                  )}
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Popover>
    </>
  );
};

export const CheckmarkSelector = React.memo(WrappedCheckmarkSelector);

export default CheckmarkSelector;
