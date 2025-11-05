import { useTheme } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { SandboxBody, SandboxProcessItem } from 'components/models/base/result_body';
import { CustomChip } from 'components/visual/CustomChip';
import { TableContainer } from 'components/visual/ResultCard/Sandbox/common/TableContainer';
import type { SandboxFilter } from 'components/visual/ResultCard/Sandbox/sandbox.utils';
import type { PossibleColor } from 'helpers/colors';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type ProcessTableProps = {
  body?: SandboxBody;
  printable?: boolean;
  startTime?: number;
  activeValue?: SandboxFilter;
  filterValue?: SandboxFilter;
  preventRender?: boolean;
  getRowCount?: (count: number) => void;
  onActiveChange?: React.Dispatch<React.SetStateAction<SandboxFilter>>;
  onFilterChange?: React.Dispatch<React.SetStateAction<SandboxFilter>>;
};

export const ProcessTable = React.memo(
  ({
    body = null,
    printable = false,
    startTime,
    filterValue,
    activeValue,
    preventRender,
    getRowCount = () => null,
    onActiveChange = () => null
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

    const isRowActive = useCallback((row: SandboxProcessItem, activeValue?: SandboxFilter) => {
      if (!activeValue) return false;

      // Check for process match
      if (activeValue?.process && row.pid === activeValue.process.pid) return true;

      // Check for signature match (if row has a signature property or related field)
      if (activeValue?.signature && activeValue.signature.pids.includes(row.pid)) return true;

      // Check for netflow match (assuming you want to match against command_line or similar)
      if (activeValue?.netflow && row.pid === activeValue?.netflow?.pid) return true;

      return false;
    }, []);

    const handleRowClick = useCallback(
      (row: SandboxProcessItem) => {
        onActiveChange(prev => (prev?.process?.pid === row.pid ? undefined : { process: structuredClone(row) }));
      },
      [onActiveChange]
    );

    return (
      <TableContainer
        columns={columns}
        data={body.processes}
        initialSorting={[{ id: 'start_time', desc: false }]}
        printable={printable}
        filterValue={filterValue}
        activeValue={activeValue}
        preventRender={preventRender}
        isRowActive={isRowActive}
        getRowCount={getRowCount}
        onRowClick={handleRowClick}
      />
    );
  }
);
