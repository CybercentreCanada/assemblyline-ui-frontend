/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { CircularProgress } from '@material-ui/core';
import ListRow, { LineItem } from 'components/elements/lists/list-item';
import React, { useCallback, useRef } from 'react';
import useListKeyboard from '../hooks/useListKeyboard';
import useListStyles from '../hooks/useListStyles';
import Book from './book';
import BooklistPager from './booklist-pager';

interface BooklistProps {
  loading: boolean;
  book: Book;
  onItemSelected: (item: LineItem) => void;
  onPageChange: (book: Book) => void;
  onRenderRow: (item: LineItem) => React.ReactNode;
  onLoadNext: () => void;
}

// const Booklist: React.FC<BooklistProps> = React.memo(
//   ({ loading, book, onItemSelected, onPageChange, onRenderRow, onLoadNext }) => {
//     const { booklistClasses: classes } = useListStyles();
//     const element = useRef<HTMLDivElement>();
//     const { cursor, setCursor, onKeyDown } = useListKeyboard({
//       count: book.currentPageLineCount(),
//       onEscape: () => onItemSelected(null),
//       onEnter: (_cursor: number) => onItemSelected(book.currentPage().lines[_cursor])
//     });

//     const _onRowClick = useCallback(
//       (item: LineItem, index: number) => {
//         setCursor(index);
//         onItemSelected(item);
//       },
//       [setCursor, onItemSelected]
//     );

//     return (
//       <div ref={element} className={classes.outer}>
//         {loading ? (
//           <div className={classes.progressCt}>
//             <CircularProgress className={classes.progressSpinner} />
//           </div>
//         ) : null}
//         <BooklistPager book={book} onChange={onPageChange} onLoadNext={onLoadNext} />
//         <div className={classes.inner} tabIndex={0} onKeyDown={onKeyDown}>
//           {!book.isCurrentPageEmpty()
//             ? book
//                 .currentPage()
//                 .lines.map((item, index) => (
//                   <ListRow
//                     key={`list.rowitem[${index}]`}
//                     loaded
//                     index={index}
//                     selected={cursor === index}
//                     item={item}
//                     onClick={_onRowClick}
//                     onRenderRow={onRenderRow}
//                   />
//                 ))
//             : null}
//         </div>
//       </div>
//     );
//   }
// );

const Booklist: React.FC<BooklistProps> = ({
  loading,
  book,
  onItemSelected,
  onPageChange,
  onRenderRow,
  onLoadNext
}) => {
  const { booklistClasses: classes } = useListStyles();
  const element = useRef<HTMLDivElement>();
  const { cursor, setCursor, onKeyDown } = useListKeyboard({
    count: book.currentPageLineCount(),
    onEscape: () => onItemSelected(null),
    onEnter: (_cursor: number) => onItemSelected(book.currentPage().lines[_cursor])
  });

  const _onRowClick = useCallback(
    (item: LineItem, index: number) => {
      setCursor(index);
      onItemSelected(item);
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
      <BooklistPager book={book} onChange={onPageChange} onLoadNext={onLoadNext} />
      <div className={classes.inner} tabIndex={0} onKeyDown={onKeyDown}>
        {!book.isCurrentPageEmpty()
          ? book
              .currentPage()
              .lines.map((item, index) => (
                <ListRow
                  key={`list.rowitem[${index}]`}
                  loaded
                  index={index}
                  selected={cursor === index}
                  item={item}
                  onClick={_onRowClick}
                  onRenderRow={onRenderRow}
                />
              ))
          : null}
      </div>
    </div>
  );
};
export default Booklist;
