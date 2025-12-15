import type { SxProps, TableRowProps, Theme } from '@mui/material';
import {
  AlertTitle,
  TableContainer as MuiTableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  alpha,
  styled
} from '@mui/material';
import type { ColumnDef, RowData, SortingState } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import InformativeAlert from 'components/visual/InformativeAlert';
import { t } from 'i18next';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData = RowData, TValue = unknown> {
    colStyle?: React.CSSProperties;
    headerSx?: SxProps<Theme>;
    cellSx?: SxProps<Theme>;
  }
}

const StyledTableContainer = memo(
  styled(MuiTableContainer, {
    shouldForwardProp: prop => prop !== 'printable'
  })<{ printable?: boolean }>(({ printable }) => ({
    fontSize: '90%',
    maxHeight: printable ? undefined : 480,
    maxWidth: printable ? '100%' : undefined,
    position: 'relative',
    '@media print': {
      overflow: 'visible',
      maxHeight: 'none'
    }
  }))
);

const StyledTable = memo(
  styled(Table, {
    shouldForwardProp: prop => prop !== 'printable'
  })<{ printable?: boolean }>(({ theme, printable }) => ({
    '&.MuiTable-root': {
      stickyHeader: true,
      size: 'small',
      [theme.breakpoints.down('sm')]: {
        width: printable ? '100%' : 'max-content'
      }
    }
  }))
);

const StyledTableHead = memo(
  styled(TableHead)(({ theme }) => ({
    position: 'sticky',
    top: 0,
    zIndex: 2,
    transition: 'box-shadow 0.2s ease',
    backgroundColor: theme.palette.background.paper,
    '&.scrolled': {
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
    },
    '@media print': {
      position: 'static',
      boxShadow: 'none'
    }
  }))
);

const StyledTableCell = memo(
  styled(TableCell, { shouldForwardProp: prop => prop !== 'sortable' && prop !== 'active' })<{
    active?: boolean;
    sortable?: boolean;
  }>(({ theme, sortable, active }) => ({
    '&.MuiTableCell-root': {
      '@media print': { color: 'black' },
      fontSize: 'inherit',
      lineHeight: 'inherit',
      ...(active && {
        backgroundColor: alpha(
          theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
          theme.palette.action.activatedOpacity
        )
      })
    },
    '&.MuiTableCell-head': {
      '@media print': { color: 'black', backgroundColor: '#DDD !important' },
      backgroundColor: theme.palette.mode === 'dark' ? '#404040' : '#EEE',
      cursor: sortable ? 'pointer' : 'default',
      userSelect: 'none'
    },
    '&.MuiTableCell-body': {
      [theme.breakpoints.up('md')]: { wordBreak: 'break-word' }
    }
  }))
);

const StyledTableRow = memo(
  styled(TableRow, { shouldForwardProp: prop => prop !== 'active' })<TableRowProps & { active?: boolean }>(
    ({ theme, hover }) => ({
      ...(hover && { cursor: 'pointer' }),
      '&:nth-of-type(odd)': {
        '@media print': { backgroundColor: '#EEE !important' },
        backgroundColor: theme.palette.mode === 'dark' ? '#ffffff08' : '#00000008'
      }
    })
  )
);

export type TableContainerProps<T extends object, F extends object, A> = {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  initialSorting: SortingState;
  printable?: boolean;
  rowSpanning?: string[];
  filterValue?: F;
  activeValue?: A;
  preventRender?: boolean;
  getRowCount?: (value: number) => void;
  isRowFiltered?: (row: T, filterValue: F) => boolean;
  isRowActive?: (row: T, activeValue: A) => boolean;
  onRowClick?: (row: T, rowIndex: number) => void;
};

export const TableContainer = memo(
  <T extends object, F extends object, A>({
    columns,
    data,
    initialSorting,
    rowSpanning = [],
    printable = false,
    filterValue = null,
    activeValue = null,
    preventRender = false,
    getRowCount = () => null,
    isRowFiltered = () => false,
    isRowActive = () => false,
    onRowClick
  }: TableContainerProps<T, F, A>) => {
    const [sorting, setSorting] = useState<SortingState>(initialSorting);
    const [scrolled, setScrolled] = useState<boolean>(false);

    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      const onScroll = () => setScrolled(container.scrollTop > 0);
      container.addEventListener('scroll', onScroll, { passive: true });
      return () => container.removeEventListener('scroll', onScroll);
    }, []);

    const table = useReactTable({
      data,
      columns,
      state: {
        pagination: { pageIndex: 0, pageSize: 1000 },
        sorting,
        globalFilter: filterValue
      },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      globalFilterFn: (row, _columnId, _filterValue: F) => isRowFiltered(row.original, _filterValue)
    });

    const rowCount = table.getFilteredRowModel().rows.length;

    const handleRowClick = useCallback(
      (row: T, index: number) => {
        onRowClick?.(row, index);
      },
      [onRowClick]
    );

    const nonEmptyColumns = useMemo(() => {
      const rows = table.getFilteredRowModel().rows;

      return table.getAllLeafColumns().filter(col => {
        return rows.some(row => {
          const value = row.getValue(col.id);
          // console.log(value);
          return value !== null && value !== undefined && value !== '';
        });
      });
    }, [table, table.getFilteredRowModel().rows]);

    const rowSpanMap = useMemo<Record<string, number>>(() => {
      if (rowSpanning.length === 0 || data.length === 0) return {};
      const map: Record<string, number> = {};
      const rows = table.getPrePaginationRowModel().rows;
      const n = rows.length;
      if (n === 0) return map;

      const hashString = (str: string): number => {
        let h = 2166136261;
        for (let i = 0; i < str.length; i++) {
          h ^= str.charCodeAt(i);
          h = Math.imul(h, 16777619);
        }
        return h >>> 0;
      };

      const colValues = rowSpanning.map(colId => rows.map(r => r.getValue(colId)));
      const prevHashes = new Uint32Array(n);
      const hashBase = 0x9e3779b9;

      for (let colIndex = 0; colIndex < rowSpanning.length; colIndex++) {
        const colId = rowSpanning[colIndex];
        const values = colValues[colIndex];
        const hashes = new Uint32Array(n);

        for (let i = 0; i < n; i++) {
          const val = values[i];
          const valHash = typeof val === 'number' ? val >>> 0 : val == null ? 0 : hashString(String(val));
          hashes[i] = Math.imul(prevHashes[i] ^ valHash ^ hashBase, 31);
        }

        let spanStart = 0;
        let prev = hashes[0];
        for (let i = 1; i <= n; i++) {
          const curr = i < n ? hashes[i] : NaN;
          if (i === n || curr !== prev) {
            const span = i - spanStart;
            if (span > 1) {
              map[`${colId}-${spanStart}`] = span;
              for (let j = spanStart + 1; j < i; j++) {
                map[`${colId}-${j}`] = 0;
              }
            }
            spanStart = i;
            prev = curr;
          }
        }
        prevHashes.set(hashes);
      }

      return map;
    }, [rowSpanning, table, table.getPrePaginationRowModel().rows]);

    useEffect(() => {
      getRowCount(rowCount);
    }, [rowCount]);

    if (preventRender) return null;

    if (!table.getRowModel().rows.length) {
      return (
        <div style={{ width: '100%' }}>
          <InformativeAlert sx={{ fontSize: 'inherit' }} slotProps={{ message: { sx: { padding: '0px' } } }}>
            <AlertTitle variant="body1" sx={{ fontSize: 'inherit' }}>
              {t('no_results_title', { ns: 'sandboxResult' })}
            </AlertTitle>
            {t('no_results_desc', { ns: 'sandboxResult' })}
          </InformativeAlert>
        </div>
      );
    }

    return (
      <StyledTableContainer ref={containerRef} printable={printable}>
        <StyledTable stickyHeader size="small" printable={printable}>
          <colgroup>
            {nonEmptyColumns.map(column => (
              <col key={column.id} style={column.columnDef.meta?.colStyle} />
            ))}
          </colgroup>

          <StyledTableHead className={scrolled ? 'scrolled' : ''}>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers
                  .filter(header => nonEmptyColumns.some(c => c.id === header.column.id))
                  .map(header => {
                    if (header.isPlaceholder) return <StyledTableCell key={header.id} />;
                    const canSort = header.column.getCanSort();

                    return (
                      <StyledTableCell
                        key={header.id}
                        colSpan={header.colSpan}
                        sortable={canSort}
                        sx={header.column.columnDef.meta?.headerSx}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      >
                        {canSort ? (
                          <TableSortLabel
                            active={!!header.column.getIsSorted()}
                            direction={
                              header.column.getIsSorted()
                                ? (header.column.getIsSorted() as 'asc' | 'desc')
                                : header.column.columnDef.sortDescFirst
                                  ? 'desc'
                                  : 'asc'
                            }
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </TableSortLabel>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </StyledTableCell>
                    );
                  })}
              </TableRow>
            ))}
          </StyledTableHead>

          <TableBody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <StyledTableRow
                key={row.id}
                hover={!!onRowClick}
                active={isRowActive(row.original, activeValue)}
                onClick={() => handleRowClick(row.original, rowIndex)}
              >
                {row
                  .getVisibleCells()
                  .filter(cell => nonEmptyColumns.some(c => c.id === cell.column.id))
                  .map(cell => {
                    const key = `${cell.column.id}-${rowIndex}`;
                    const span = rowSpanMap[key] ?? 1;
                    if (span === 0) return null;

                    return (
                      <StyledTableCell
                        key={cell.id}
                        rowSpan={span}
                        active={isRowActive(row.original, activeValue)}
                        sx={cell.column.columnDef.meta?.cellSx}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </StyledTableCell>
                    );
                  })}
              </StyledTableRow>
            ))}
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
    );
  }
) as <T extends object, F extends object, A>(props: TableContainerProps<T, F, A>) => React.JSX.Element | null;
