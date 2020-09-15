import { makeStyles } from '@material-ui/core';
import List from 'components/elements/lists/list';
import React, { useRef } from 'react';
import { isEscape } from '../utils/keyboard';

const useStyles = makeStyles(theme => ({
  suggestionCt: {
    position: 'relative'
  },
  suggestionInner: {
    position: 'absolute',
    overflow: 'auto',
    zIndex: 1,
    top: 0,
    minWidth: 400,
    maxHeight: 250,
    backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200]
  },
  suggestionItem: {
    color: theme.palette.primary.light
  }
}));

interface SearchSuggestionsProps {
  open: boolean;
  items: string[];
  onSelection?: (selected: string) => void;
  onClose?: () => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ open, items, onSelection, onClose }) => {
  const classes = useStyles();
  const element = useRef<HTMLDivElement>();

  const _items = items.map((t, i) => ({ id: i, text: t }));

  const renderItem = item => {
    return <span className={classes.suggestionItem}>{item.text}</span>;
  };

  // useLayoutEffect(() => {
  //   if (open) {
  //     console.log('focusing...');
  //     element.current.focus();
  //   }
  // }, [open]);

  const onKeyDown = (keyCode: number) => {
    if (isEscape(keyCode) && onClose) {
      onClose();
    }
  };

  return open ? (
    <div ref={element} className={classes.suggestionCt} tabIndex={-1}>
      <div className={classes.suggestionInner}>
        <List
          items={_items}
          onItemSelected={onSelection ? item => onSelection(item.text) : () => null}
          onRenderItem={renderItem}
          onKeyDown={onKeyDown}
          noDivider
          focus
        />
      </div>
    </div>
  ) : null;
};

export default SearchSuggestions;
