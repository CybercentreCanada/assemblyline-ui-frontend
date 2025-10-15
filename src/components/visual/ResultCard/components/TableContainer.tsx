import type { SxProps, Theme } from '@mui/material';
import {
  TableContainer as MuiTableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  styled
} from '@mui/material';
import type { ColumnDef, RowData, SortingState } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData = RowData, TValue = unknown> {
    headerSx?: SxProps<Theme>;
    cellSx?: SxProps<Theme>;
  }
}

const StyledTableContainer = memo(
  styled(MuiTableContainer, {
    shouldForwardProp: prop => prop !== 'printable'
  })<{ printable?: boolean }>(({ printable }) => ({
    fontSize: '90%',
    maxHeight: printable ? undefined : 500,
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
  styled(TableCell, { shouldForwardProp: prop => prop !== 'sortable' })<{ sortable?: boolean }>(
    ({ theme, sortable }) => ({
      '&.MuiTableCell-root': {
        '@media print': { color: 'black' },
        fontSize: 'inherit',
        lineHeight: 'inherit'
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
    })
  )
);

const StyledTableRow = memo(
  styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      '@media print': { backgroundColor: '#EEE !important' },
      backgroundColor: theme.palette.mode === 'dark' ? '#ffffff08' : '#00000008'
    }
  }))
);

export type TableContainerProps<T extends object> = {
  columns: ColumnDef<T, { sx: unknown }>[];
  data: T[];
  initialSorting: SortingState;
  printable?: boolean;
  rowSpanning?: string[];
};

export const TableContainer = memo(
  <T extends object>({
    columns,
    data,
    initialSorting,
    rowSpanning = [],
    printable = false
  }: TableContainerProps<T>) => {
    const [sorting, setSorting] = useState<SortingState>(initialSorting);
    const [scrolled, setScrolled] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const onScroll = () => setScrolled(container.scrollTop > 0);
      container.addEventListener('scroll', onScroll);
      return () => container.removeEventListener('scroll', onScroll);
    }, []);

    const table = useReactTable({
      data,
      columns,
      state: {
        pagination: { pageIndex: 0, pageSize: 1000 },
        sorting
      },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel()
    });

    const handleSort = useCallback((columnId: string) => {
      setSorting(prev => {
        const existing = prev.find(s => s.id === columnId);
        return [{ id: columnId, desc: existing ? !existing.desc : false }];
      });
    }, []);

    const rowSpanMap = useMemo<Record<string, number>>(() => {
      if (rowSpanning.length === 0) return {};

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
    }, [rowSpanning, table.getPrePaginationRowModel().rows]);

    return (
      <StyledTableContainer ref={containerRef} printable={printable}>
        <StyledTable stickyHeader size="small" printable={printable}>
          <StyledTableHead className={scrolled ? 'scrolled' : ''}>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  if (header.isPlaceholder) return <StyledTableCell key={header.id} />;
                  const canSort = header.column.getCanSort();
                  const isActive = sorting.some(s => s.id === header.column.id);
                  const direction = header.column.getIsSorted() === 'desc' ? 'desc' : 'asc';

                  return (
                    <StyledTableCell
                      key={header.id}
                      colSpan={header.colSpan}
                      sortable={canSort}
                      sx={header.column.columnDef.meta?.headerSx}
                      onClick={canSort ? () => handleSort(header.column.id) : undefined}
                    >
                      {canSort ? (
                        <TableSortLabel active={isActive} direction={direction}>
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
              <StyledTableRow key={row.id}>
                {row.getVisibleCells().map(cell => {
                  const key = `${cell.column.id}-${rowIndex}`;
                  const span = rowSpanMap[key] ?? 1;
                  if (span === 0) return null;

                  return (
                    <StyledTableCell key={cell.id} rowSpan={span} sx={cell.column.columnDef.meta?.cellSx}>
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
) as <T extends object>(props: TableContainerProps<T>) => React.ReactNode;
