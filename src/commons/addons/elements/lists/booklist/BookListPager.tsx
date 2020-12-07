import { IconButton } from '@material-ui/core';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { Pagination } from '@material-ui/lab';
import useListStyles from 'commons/addons/elements/lists/hooks/useListStyles';
import React from 'react';
import Book from './Book';

interface BookListPagerProps {
  book: Book;
  onLoadNext?: () => void;
  onChange: (book: Book) => void;
}

const BookListPager: React.FC<BookListPagerProps> = ({ book, onLoadNext, onChange }) => {
  const { booklistClasses: classes } = useListStyles();
  const current = book.currentNumber();
  const pageCount = book.pageCount();
  const isOnLastPage = book.isOnLastPage();

  const onPageChange = (event, pageNumber: number) => {
    book.turnTo(pageNumber - 1);
    onChange(book.build());
  };

  return (
    <div className={classes.pager}>
      <div className={classes.pagerSpacer} />
      <div className={classes.pagerItems}>
        <Pagination count={pageCount} page={current + 1} onChange={onPageChange} hideNextButton={isOnLastPage} />
        {isOnLastPage && onLoadNext ? (
          <IconButton size="small" onClick={onLoadNext} color="inherit">
            <MoreHorizIcon />
          </IconButton>
        ) : null}
      </div>
    </div>
  );
};

export default BookListPager;
