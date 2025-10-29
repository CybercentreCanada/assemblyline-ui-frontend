import { useTheme } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { SandboxProcessItem } from 'components/models/base/result_body';
import { CustomChip } from 'components/visual/CustomChip';
import { TableContainer } from 'components/visual/ResultCard/Sandbox/common/TableContainer';
import type { PossibleColor } from 'helpers/colors';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type ProcessTableProps = {
  data?: SandboxProcessItem[];
  printable?: boolean;
  startTime?: number;
  filterValue?: SandboxProcessItem;
  onFilter?: () => void;
  onQuantityChange?: (quantity: number) => void;
};

export const ProcessTable = React.memo(
  ({
    data = [],
    printable = false,
    startTime,
    filterValue,
    onFilter = () => null,
    onQuantityChange = () => null
  }: ProcessTableProps) => {
    const { t } = useTranslation('sandboxResult');
    const theme = useTheme();
    const columnHelper = createColumnHelper<SandboxProcessItem>();

    const integrityLevelColorMap = useMemo<Record<string, PossibleColor>>(
      () => ({
        system: 'primary',
        high: 'success',
        medium: 'warning',
        low: 'error'
      }),
      []
    );

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
        columnHelper.accessor('pid', {
          header: () => t('pid'),
          cell: info => info.getValue(),
          meta: {
            cellSx: {
              wordBreak: 'inherit !important',
              color: theme.palette.text.secondary
            }
          }
        }),
        columnHelper.accessor('image', {
          header: () => t('process_name'),
          cell: info => info.getValue()?.split(/[/\\]/).pop() ?? '',
          meta: {
            cellSx: {
              wordBreak: 'inherit !important'
            }
          }
        }),
        columnHelper.accessor('command_line', {
          header: () => t('command_line'),
          cell: info => info.getValue() ?? info.row.original.image,
          meta: {
            colStyle: { width: '100%' },
            cellSx: { wordBreak: 'inherit !important', color: theme.palette.text.secondary }
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
                color={integrityLevelColorMap[level] ?? undefined}
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
        columnHelper.accessor('ppid', {
          header: () => t('ppid'),
          cell: info => info.getValue() ?? '-',
          meta: {
            cellSx: {
              wordBreak: 'inherit !important',
              color: theme.palette.text.secondary
            }
          }
        })
      ],
      [columnHelper, theme.palette.text.secondary, t, startTime, integrityLevelColorMap]
    );

    return (
      <TableContainer
        columns={columns}
        data={data}
        initialSorting={[{ id: 'start_time', desc: false }]}
        printable={printable}
        filterValue={filterValue}
        onFilter={(row, value) => row.pid === value.pid}
        onQuantityChange={onQuantityChange}
      />
    );
  }
);
