import { TablePagination } from '@mui/material';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export interface TableListPagerConfig {
  pageIndex: number;
  pageCount: number;
  pageSize?: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange?: (pageIndex: number) => void;
}

interface TableListPagerProps extends TableListPagerConfig {
  count: number;
}

function TableListPager({
  count,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  ...paginationProps
}: TableListPagerProps) {
  const { t } = useTranslation();

  const _onPageChange = useCallback(
    (event, pageNumber: number) => {
      onPageChange(pageNumber);
    },
    [onPageChange]
  );

  const _onPageSizeChange = useCallback(
    event => {
      if (onPageSizeChange) {
        onPageSizeChange(event.target.value);
      }
    },
    [onPageSizeChange]
  );

  return (
    <TablePagination
      component="div"
      labelRowsPerPage={t('list.pager.rows.per.page')}
      count={count}
      page={pageIndex}
      rowsPerPage={pageSize}
      onPageChange={_onPageChange}
      onRowsPerPageChange={_onPageSizeChange}
    />
  );
}

export default React.memo(TableListPager);
