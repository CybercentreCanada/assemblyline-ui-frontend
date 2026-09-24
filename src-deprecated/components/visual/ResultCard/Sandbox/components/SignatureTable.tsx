import { useTheme } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import useSafeResults from 'components/hooks/useSafeResults';
import type { SandboxBody, SandboxProcessItem, SandboxSignatureItem } from 'components/models/base/result_body';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import { ProcessChip } from 'components/visual/ResultCard/Sandbox/common/ProcessChip';
import { TableContainer } from 'components/visual/ResultCard/Sandbox/common/TableContainer';
import { DetailTableCellValue, DetailTableRow } from 'components/visual/ResultCard/Sandbox/common/Tables';
import {
  getProcessMapByPid,
  getVisibleProcessesByPids,
  type SandboxFilter
} from 'components/visual/ResultCard/Sandbox/sandbox.utils';
import Verdict from 'components/visual/Verdict';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type FlatSignatures = SandboxSignatureItem & {
  flatAttacks?: Record<string, string[]>;
};

type SignatureTableProps = {
  body?: SandboxBody;
  processByPid?: ReadonlyMap<number, SandboxProcessItem>;
  showSafeResults?: boolean;
  printable?: boolean;
  force?: boolean;
  filterValue?: SandboxFilter;
  activeValue?: SandboxFilter;
  preventRender?: boolean;
  getRowCount?: (count: number) => void;
  onFilterChange?: React.Dispatch<React.SetStateAction<SandboxFilter>>;
};

export const SignatureTable = React.memo(
  ({
    body = null,
    processByPid: processByPidProp,
    showSafeResults: showSafeResultsProp,
    printable = false,
    filterValue,
    activeValue,
    preventRender,
    getRowCount = () => null,
    onFilterChange = () => null
  }: SignatureTableProps) => {
    const { t } = useTranslation('sandboxResult');
    const theme = useTheme();
    const { showSafeResults: showSafeResultsContext } = useSafeResults();
    const showSafeResults = showSafeResultsProp ?? showSafeResultsContext;
    const columnHelper = createColumnHelper<FlatSignatures>();

    const processByPid = useMemo(
      () => processByPidProp ?? getProcessMapByPid(body?.processes),
      [body?.processes, processByPidProp]
    );

    const getVisibleProcesses = useCallback(
      (pids?: number[]) => getVisibleProcessesByPids(pids, processByPid, showSafeResults),
      [processByPid, showSafeResults]
    );

    const renderChipList = (items?: string[], type?: 'rounded' | 'round' | 'square') =>
      items?.map((label, i) => <CustomChip key={i} label={label} size="tiny" variant="outlined" type={type} />);

    const columns = useMemo<ColumnDef<FlatSignatures>[]>(
      () => [
        columnHelper.accessor('classification', {
          header: () => t('classification'),
          cell: info => <Classification c12n={info.getValue()} size="tiny" type="text" />
        }),
        columnHelper.accessor(row => (row.sources?.length ? row.sources : null), {
          id: 'sources',
          header: () => t('sources'),
          cell: ({ getValue }) => <DetailTableCellValue value={getValue()} />
        }),
        columnHelper.accessor('pid', {
          id: 'processes',
          enableSorting: false,
          header: () => t('processes'),
          cell: info =>
            getVisibleProcesses(info.getValue())?.map(process => (
              <ProcessChip key={process.pid} short process={process} />
            )),
          meta: {
            colStyle: { width: '1%' },
            cellSx: { whiteSpace: 'nowrap', wordBreak: 'inherit !important' }
          }
        }),
        columnHelper.accessor('type', {
          header: () => t('type'),
          cell: info => info.getValue(),
          meta: { cellSx: { whiteSpace: 'nowrap', wordBreak: 'inherit !important' } }
        }),
        columnHelper.accessor('score', {
          header: () => t('verdict'),
          sortDescFirst: true,
          cell: info => <Verdict fullWidth score={info.getValue()} />
        }),
        columnHelper.accessor('name', {
          header: () => t('name'),
          cell: info => {
            const { description } = info.row.original;
            return (
              <div>
                <div>{info.getValue()?.replaceAll('_', ' ')}</div>
                {description && <div style={{ color: theme.palette.text.secondary }}>{description}</div>}
              </div>
            );
          },
          meta: { colStyle: { minWidth: '250px' }, cellSx: { textTransform: 'capitalize' } }
        }),
        columnHelper.accessor(row => !!(row?.actors?.length || row?.attacks?.length || row?.malware_families?.length), {
          id: 'details',
          header: () => t('details'),
          enableSorting: false,
          meta: { cellSx: { textTransform: 'capitalize' }, colStyle: { minWidth: '350px' } },
          cell: ({ row }) => {
            const { actors, attacks, malware_families: malwareFamilies } = row.original;

            return (
              <table cellSpacing={0}>
                <tbody>
                  {actors?.length > 0 && (
                    <>
                      <DetailTableRow label={t('actors')} isHeader />
                      <DetailTableRow>{renderChipList(actors)}</DetailTableRow>
                    </>
                  )}

                  {attacks?.length > 0 && (
                    <>
                      <DetailTableRow label={t('attacks')} isHeader />
                      <DetailTableRow>
                        {attacks.map(({ pattern }, i) => (
                          <CustomChip key={i} label={pattern} size="tiny" variant="outlined" type="rounded" />
                        ))}
                      </DetailTableRow>
                    </>
                  )}

                  {malwareFamilies?.length > 0 && (
                    <>
                      <DetailTableRow label={t('malware_families')} isHeader />
                      <DetailTableRow>{renderChipList(malwareFamilies)}</DetailTableRow>
                    </>
                  )}
                </tbody>
              </table>
            );
          }
        })
      ],
      [columnHelper, getVisibleProcesses, t, theme.palette.text.secondary]
    );

    const handleRowClick = useCallback(
      (row: SandboxSignatureItem) =>
        onFilterChange(prev => {
          const current = prev ?? [];
          if (!row?.pid?.length) return current;
          const isSelected = row.pid.every(v => current.includes(v));
          return isSelected ? current.filter(v => !row.pid.includes(v)) : [...new Set([...current, ...row.pid])];
        }),
      [onFilterChange]
    );

    return (
      <TableContainer
        columns={columns}
        data={body.signatures}
        initialSorting={[{ id: 'score', desc: true }]}
        printable={printable}
        filterValue={filterValue}
        activeValue={activeValue}
        preventRender={preventRender}
        getRowCount={getRowCount}
        isRowFiltered={(row, value) => (!value?.length ? true : value?.every(v => row?.pid?.includes(v) || false))}
        onRowClick={handleRowClick}
      />
    );
  }
);
