import { useTheme } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { SandboxBody, SandboxProcessItem } from 'components/models/base/result_body';
import CustomChip from 'components/visual/CustomChip';
import { ProcessChip } from 'components/visual/ResultCard/Sandbox/common/ProcessChip';
import { TableContainer } from 'components/visual/ResultCard/Sandbox/common/TableContainer';
import type { SandboxFilter } from 'components/visual/ResultCard/Sandbox/sandbox.utils';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type ProcessTableProps = {
  body?: SandboxBody | null;
  printable?: boolean;
  startTime?: number;
  filterValue?: SandboxFilter;
  preventRender?: boolean;
  getRowCount?: (count: number) => void;
  onFilterChange?: React.Dispatch<React.SetStateAction<SandboxFilter>>;
};

export const ProcessTable = React.memo(
  ({
    body = null,
    printable = false,
    startTime,
    filterValue,
    preventRender,
    getRowCount = () => null
  }: ProcessTableProps) => {
    const { t } = useTranslation('sandboxResult');
    const theme = useTheme();
    const columnHelper = createColumnHelper<SandboxProcessItem>();

    const columns = useMemo<ColumnDef<SandboxProcessItem>[]>(
      () => [
        columnHelper.accessor('start_time', {
          header: () => t('timeshift'),
          cell: ({ getValue }) => {
            const cur = getValue();
            if (!startTime || !cur) return <div style={{ textAlign: 'center' }}>{'-'}</div>;
            const deltaSec = (new Date(cur).getTime() - startTime) / 1000;
            return `${deltaSec.toFixed(2)} s`;
          },
          meta: {
            cellSx: {
              whiteSpace: 'nowrap',
              textAlign: 'right',
              color: theme.palette.text.secondary
            }
          }
        }),
        columnHelper.accessor(row => row.image?.split(/[/\\]/).pop() ?? '', {
          id: 'process_name',
          header: () => t('process_name'),
          cell: ({ row }) => <ProcessChip fullWidth process={row.original} />,
          meta: { cellSx: { wordBreak: 'inherit !important' } }
        }),
        columnHelper.accessor('original_file_name', {
          header: () => t('original_file_name'),
          cell: ({ getValue }) => getValue() || <div style={{ textAlign: 'center' }}>{'-'}</div>,
          sortingFn: (a, b) => {
            const nameA = a.original?.original_file_name?.toLowerCase();
            const nameB = b.original?.original_file_name?.toLowerCase();

            if (nameA == null && nameB == null) return 0;
            if (nameA == null) return 1;
            if (nameB == null) return -1;
            return (nameA ?? '').localeCompare(nameB ?? '');
          },
          meta: {
            cellSx: {
              wordBreak: 'inherit !important',
              color: theme.palette.text.secondary
            }
          }
        }),
        columnHelper.accessor('integrity_level', {
          header: () => t('integrity_level'),
          cell: ({ getValue }) => {
            const level = getValue();
            if (!level) return <div style={{ textAlign: 'center' }}>{'-'}</div>;
            return (
              <CustomChip
                label={level}
                fullWidth
                size="tiny"
                variant="outlined"
                sx={{ textTransform: 'capitalize', fontWeight: 'normal' }}
              />
            );
          },
          meta: {
            cellSx: {
              wordBreak: 'inherit !important',
              color: theme.palette.text.secondary
            }
          }
        }),
        columnHelper.accessor(
          row => {
            const parent = body?.processes?.find(p => p.pid === row.ppid);
            return parent ? [parent.image?.split(/[/\\]/).pop() ?? '', parent.pid] : null;
          },
          {
            id: 'parent_process',
            header: () => t('parent_process'),
            cell: ({ getValue }) => {
              const parentPid = getValue()?.[1];
              const parent = body?.processes?.find(p => p.pid === parentPid);
              return parent ? (
                <ProcessChip fullWidth process={parent} />
              ) : (
                <div style={{ textAlign: 'center' }}>{'-'}</div>
              );
            },
            sortDescFirst: false,
            meta: {
              cellSx: { wordBreak: 'inherit !important', whiteSpace: 'nowrap' }
            }
          }
        )
      ],
      [t, theme.palette.text.secondary, startTime, body?.processes, columnHelper]
    );

    return (
      <TableContainer
        columns={columns}
        data={body?.processes ?? []}
        initialSorting={[{ id: 'start_time', desc: false }]}
        printable={printable}
        filterValue={filterValue}
        preventRender={preventRender}
        getRowCount={getRowCount}
        isRowFiltered={(row, value) => row.pid === value.pid}
      />
    );
  }
);
