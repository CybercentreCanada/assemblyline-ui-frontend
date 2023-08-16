import BackspaceIcon from '@mui/icons-material/Backspace';
import {
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Popover,
  TextField,
  Theme
} from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import makeStyles from '@mui/styles/makeStyles';
import CustomChip from 'components/visual/CustomChip';
import { Field, FIELDS } from 'components/visual/Search2/models';
import 'moment/locale/fr';
import React, { useCallback, useDeferredValue, useState } from 'react';

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

export const WrappedFieldSelector = ({ value = null, label = '', fields = {}, onChange = null }: Props) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [filter, setFilter] = useState<string>('');
  const deferredFilter = useDeferredValue(filter);

  const open = Boolean(anchorEl);

  // const fields = useMemo(
  //   () => Object.fromEntries(Object.entries(propFields).filter(([k, v]) => k.indexOf(deferredFilter) !== -1)),
  //   [deferredFilter, propFields]
  // );

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
    setFilter('');
  };

  const handleClose = () => {
    setAnchorEl(null);
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
        size="medium"
        type="round"
        variant="outlined"
        label={
          <>
            <span>{label}</span>
            <span style={{ fontWeight: 700 }}>{value}</span>
          </>
        }
        onClick={handleClick}
      />
      <Popover
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
          sx={{ width: '100%', bgcolor: 'background.paper' }}
          subheader={
            <ListSubheader component="div">
              <TextField
                size="small"
                fullWidth
                placeholder="filter..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setFilter('')}>
                        <BackspaceIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </ListSubheader>
          }
        >
          {React.useMemo(
            () => (
              <>
                {Object.entries(fields)
                  .filter(([k, v]) => k.indexOf(deferredFilter) !== -1)
                  .map(([key, field], i) => (
                    <ListItem key={`${key}-${i}`} disablePadding>
                      <ListItemButton role={undefined} dense selected={key === value} onClick={handleIndexClick(key)}>
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
                      </ListItemButton>
                    </ListItem>
                  ))}
              </>
            ),
            [classes.chipLabel, classes.chipRoot, deferredFilter, fields, handleIndexClick, value]
          )}
        </List>
      </Popover>
    </>
  );
};

export const FieldSelector = React.memo(WrappedFieldSelector);

export default FieldSelector;
