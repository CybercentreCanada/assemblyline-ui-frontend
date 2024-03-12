import { List, ListItem, ListItemButton, ListItemText, ListSubheader, Popover } from '@mui/material';
import CustomChip from 'components/visual/CustomChip';
import 'moment/locale/fr';
import React, { useCallback } from 'react';

type Props<T> = {
  value: string;
  label: string;
  options: T[];
  onChange: (value: string) => void;
};

export const WrappedSearchSelector = <T extends string>({
  value = null,
  label = '',
  options = [],
  onChange = null
}: Props<T>) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleIndexClick = useCallback(
    (key: T) => (event: React.MouseEvent<any>) => {
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
        <List
          dense
          sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
          subheader={<ListSubheader component="div" children="Indices" />}
        >
          {options.map((option, i) => (
            <ListItem key={`${option}-${i}`} disablePadding>
              <ListItemButton role={undefined} dense selected={option === value} onClick={handleIndexClick(option)}>
                <ListItemText primary={option} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Popover>
    </>
  );
};

export const SearchSelector = React.memo(WrappedSearchSelector);

export default SearchSelector;
