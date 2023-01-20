/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { CircularProgress } from '@mui/material';
import useListKeyboard from 'commons_deprecated/addons/elements/lists/hooks/useListKeyboard';
import useListStyles from 'commons_deprecated/addons/elements/lists/hooks/useListStyles';
import React, { useCallback, useRef } from 'react';
import ListItemBase, { LineItem } from '../item/ListItemBase';
import Book from './Book';
import BookListPager from './BookListPager';

interface BookListProps {
  id: string;
  loading: boolean;
  book: Book;
  children: (item: LineItem) => React.ReactNode;
  onItemSelected?: (item: LineItem) => void;
  onPageChange: (book: Book) => void;
  onLoadNext: () => void;
}

const BookList: React.FC<BookListProps> = ({
  id,
  loading,
  book,
  children,
  onItemSelected,
  onPageChange,
  onLoadNext
}) => {
  const { booklistClasses: classes } = useListStyles();
  const element = useRef<HTMLDivElement>();
  const { cursor, setCursor, onKeyDown } = useListKeyboard({
    id,
    scroller: null,
    count: book.currentPageLineCount(),
    onEscape: () => onItemSelected(null),
    onEnter: (_cursor: number) => onItemSelected(book.currentPage().lines[_cursor])
  });

  const _onRowClick = useCallback(
    (item: LineItem, index: number) => {
      setCursor(index);
      if (onItemSelected) {
        onItemSelected(item);
      }
    },
    [setCursor, onItemSelected]
  );

  return (
    <div ref={element} className={classes.outer}>
      {loading ? (
        <div className={classes.progressCt}>
          <CircularProgress className={classes.progressSpinner} />
        </div>
      ) : null}
      <BookListPager book={book} onChange={onPageChange} onLoadNext={onLoadNext} />
      <div className={classes.inner} tabIndex={0} onKeyDown={onKeyDown}>
        {!book.isCurrentPageEmpty()
          ? book.currentPage().lines.map((item, index) => (
              // eslint-disable-next-line react/jsx-indent
              <ListItemBase
                key={`list.rowitem[${index}]`}
                index={index}
                selected={cursor === index}
                item={item}
                onClick={_onRowClick}
              >
                {children}
              </ListItemBase>
            ))
          : null}
      </div>
    </div>
  );
};
export default BookList;
