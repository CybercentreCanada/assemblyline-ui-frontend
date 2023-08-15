import { List, ListItem, ListItemButton, ListItemText, ListSubheader, Popover } from '@mui/material';
import CustomChip from 'components/visual/CustomChip';
import 'moment/locale/fr';
import React, { useCallback } from 'react';

export type CollectionType = 'submission' | 'file' | 'result' | 'signature' | 'alert' | 'retrohunt';

const COLLECTIONS: CollectionType[] = ['submission', 'file', 'result', 'signature', 'alert', 'retrohunt'];

type Props<Type> = {
  value: Type;
  label: string;
  options: Type[];
  onChange: (value: Type) => void;
};

export const WrappedSearchSelector = <Type extends string>({
  value = null,
  label = '',
  options = [],
  onChange = null
}: Props<Type>) => {
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
    (key: Type) => (event: React.MouseEvent<any>) => {
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
      >
        <List
          dense
          sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
          subheader={<ListSubheader component="div" children="Indices" />}
        >
          {options.map((option: Type, i) => (
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
