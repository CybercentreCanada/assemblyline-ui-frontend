import { makeStyles, TextField } from '@material-ui/core';
import React, { useRef, useState } from 'react';
import { isArrowDown, isArrowUp, isEnter, isEscape } from '../utils/keyboard';
import Throttler from '../utils/throttler';

const useStyles = makeStyles(theme => ({
  searchTextFieldCt: {
    position: 'relative'
  },
  searchTextFieldInner: {
    position: 'absolute',
    overflow: 'auto',
    zIndex: 1,
    top: 0,
    minWidth: 400,
    maxHeight: 250,
    backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200]
  },
  searchTextFieldItem: {
    padding: theme.spacing(1),
    color: theme.palette.primary.light,
    '&[data-listitem-select="true"]': {}
  }
}));

const KEY_THROTTLER = new Throttler(10);

interface SearchTextFieldProps {
  // open: boolean;
  value: string;
  options: string[];
  disabled?: boolean;
  onChange: (value: string, filteredItems: string[]) => void;
  onSelection?: (selected: string) => void;
  onClose?: () => void;
}

const SearchTextField: React.FC<SearchTextFieldProps> = ({
  value,
  options,
  disabled = false,
  onChange,
  onSelection,
  onClose
}) => {
  const classes = useStyles();
  const [cursor, setCursor] = useState<number>(-1);
  const [open, setOpen] = useState<boolean>(false);
  const element = useRef<HTMLDivElement>();

  const _onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value: _value } = event.currentTarget;
    onChange(_value, filterOptions(_value));
  };

  const _onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { keyCode } = event;
    console.log(`k[${keyCode}]`);
    if (isEnter(keyCode)) {
      console.log('enter');
      onSelection(options[cursor]);
    } else if (isEscape(keyCode)) {
      console.log('escape');
      setOpen(false);
    } else if (isArrowUp(keyCode)) {
      console.log('arrowup');
      setCursor(cursor - 1);
    } else if (isArrowDown(keyCode)) {
      if (open) {
        setCursor(cursor + 1);
      } else {
        setOpen(true);
      }
      console.log('arrowdown');
    }
  };

  const filterOptions = (filter: string) => {
    // Split filter value by whitespace.
    // Grab nearest group to the left of cursor.
    // Filter entire list with that value.
    return options;
  };

  return (
    <>
      <TextField
        placeholder="Filter..."
        value={value}
        color="secondary"
        InputProps={{ disableUnderline: true }}
        disabled={disabled}
        onChange={_onChange}
        onKeyDown={_onKeyDown}
        autoFocus
        fullWidth
      />
      {open ? (
        <div ref={element} className={classes.searchTextFieldCt} tabIndex={-1}>
          <div className={classes.searchTextFieldInner}>
            {options.map((item, index) => (
              <SearchTextOption key={`SearchTextField-item-${index}`} text={item} />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
};

const SearchTextOption = ({ text, selected = false }) => {
  const classes = useStyles();
  return (
    <div className={classes.searchTextFieldItem} data-SearchTextFielditem-selected={selected}>
      {text}
    </div>
  );
};

export default SearchTextField;
