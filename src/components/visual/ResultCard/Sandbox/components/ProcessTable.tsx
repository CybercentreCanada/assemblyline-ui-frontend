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
  body?: SandboxBody;
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
          cell: info => {
            const cur = info.getValue();
            if (!startTime || !cur) return '-';
            const delta = ((new Date(cur).getTime() - startTime) / 1000).toFixed(2);
            return `${delta} s`;
          },
          meta: {
            cellSx: {
              whiteSpace: 'nowrap',
              textAlign: 'right',
              color: theme.palette.text.secondary
            }
          }
        }),
        columnHelper.accessor(row => row.image.split(/[/\\]/).pop() ?? '', {
          id: 'process_name',
          header: () => t('process_name'),
          cell: info => <ProcessChip fullWidth process={info.row.original} />,
          meta: {
            cellSx: {
              wordBreak: 'inherit !important'
            }
          }
        }),
        columnHelper.accessor('original_file_name', {
          header: () => t('original_file_name'),
          cell: info => info.getValue(),
          meta: {
            cellSx: {
              wordBreak: 'inherit !important',
              color: theme.palette.text.secondary
            }
          }
        }),
        columnHelper.accessor('integrity_level', {
          header: () => t('integrity_level'),
          cell: info => {
            const level = info.getValue();
            if (!level) return '-';

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
            const process = body.processes.find(p => p.pid === row.ppid);
            return !process ? null : [process?.image?.split(/[/\\]/).pop() ?? '', process.pid];
          },
          {
            id: 'parent_process',
            header: () => t('parent_process'),
            cell: info => (
              <ProcessChip fullWidth process={body.processes?.find(p => p.pid === info.getValue()?.[1] || null)} />
            ),

            meta: {
              cellSx: { wordBreak: 'inherit !important', whiteSpace: 'nowrap' }
            }
          }
        )
      ],
      [columnHelper, theme.palette.text.secondary, t, startTime, body.processes]
    );

    return (
      <TableContainer
        columns={columns}
        data={body.processes}
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
