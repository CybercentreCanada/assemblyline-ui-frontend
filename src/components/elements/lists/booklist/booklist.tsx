/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { CircularProgress } from '@material-ui/core';
import ListRow, { LineItem } from 'components/elements/lists/list-item';
import React, { useRef } from 'react';
import useListKeyboard from '../hooks/useListKeyboard';
import useListStyles from '../hooks/useListStyles';
import Book from './book';
import BooklistPager from './booklist-pager';

interface BooklistProps {
  loading: boolean;
  book: Book;
  onPageChange: (book: Book) => void;
  onRenderRow: (item: LineItem) => React.ReactNode;
  onLoadNext: () => void;
}

const Booklist: React.FC<BooklistProps> = ({ loading, book, onPageChange, onRenderRow, onLoadNext }) => {
  const { booklistClasses: classes } = useListStyles();
  const element = useRef<HTMLDivElement>();
  const { cursor, onKeyDown } = useListKeyboard({ count: book.currentPageLineCount() });

  return (
    <div ref={element} tabIndex={0} onKeyDown={onKeyDown} className={classes.outer}>
      {loading ? (
        <div className={classes.progressCt}>
          <CircularProgress className={classes.progressSpinner} />
        </div>
      ) : null}
      <BooklistPager book={book} onChange={onPageChange} onLoadNext={onLoadNext} />
      <div className={classes.inner}>
        {!book.isCurrentPageEmpty()
          ? book
              .currentPage()
              .lines.map((item, index) => (
                <ListRow
                  key={`list.rowitem[${item.id}]`}
                  loaded
                  index={index}
                  selected={cursor === index}
                  item={item}
                  onRenderRow={onRenderRow}
                />
              ))
          : null}
      </div>
    </div>
  );
};

export default Booklist;
