import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { IconButton, Pagination } from '@mui/material';
import useListStyles from 'commons_deprecated/addons/elements/lists/hooks/useListStyles';
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

  const onPageChange = (_event: React.ChangeEvent<unknown>, pageNumber: number) => {
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
