import { useTheme } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import useALContext from 'components/hooks/useALContext';
import useHighlighter from 'components/hooks/useHighlighter';
import type { SandboxBody, SandboxSignatureItem } from 'components/models/base/result_body';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import { TableContainer } from 'components/visual/ResultCard/Sandbox/common/TableContainer';
import { DetailTableRow } from 'components/visual/ResultCard/Sandbox/common/Tables';
import type { SandboxFilter } from 'components/visual/ResultCard/Sandbox/sandbox.utils';
import Verdict from 'components/visual/Verdict';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type FlatSignatures = SandboxSignatureItem & { flatAttacks?: Record<string, string[]> };

type SignatureTableProps = {
  body?: SandboxBody;
  printable?: boolean;
  force?: boolean;
  filterValue?: SandboxFilter;
  activeValue?: SandboxFilter;
  preventRender?: boolean;
  getRowCount?: (count: number) => void;
  onActiveChange?: React.Dispatch<React.SetStateAction<SandboxFilter>>;
  onFilterChange?: React.Dispatch<React.SetStateAction<SandboxFilter>>;
};

export const SignatureTable = React.memo(
  ({
    body = null,
    printable = false,
    filterValue,
    activeValue,
    preventRender,
    getRowCount = () => null,
    onActiveChange = () => null
  }: SignatureTableProps) => {
    const { t } = useTranslation('sandboxResult');
    const theme = useTheme();
    const { scoreToVerdict } = useALContext();
    const { getKey } = useHighlighter();

    const columnHelper = createColumnHelper<FlatSignatures>();

    const columns = useMemo<ColumnDef<FlatSignatures>[]>(
      () => [
        columnHelper.accessor('classification', {
          header: () => t('classification'),
          cell: info => <Classification c12n={info.getValue()} size="tiny" type="text" />,
          meta: {}
        }),
        columnHelper.accessor('type', {
          header: () => t('type'),
          cell: info => info.getValue(),
          meta: { cellSx: { wordBreak: 'inherit !important', whiteSpace: 'no-wrap' } }
        }),
        columnHelper.accessor('score', {
          sortDescFirst: true,
          header: () => t('verdict'),
          cell: info => <Verdict fullWidth score={info.getValue()} />,
          meta: { cellSx: {} }
        }),
        columnHelper.accessor('name', {
          header: () => t('name'),
          cell: info => (
            <div>
              <div>{info.getValue()?.replaceAll('_', ' ')}</div>
              <div style={{ color: theme.palette.text.secondary }}>{info.row.original.message}</div>
            </div>
          ),
          meta: { cellSx: { textTransform: 'capitalize' } }
        }),
        columnHelper.accessor(row => row, {
          id: 'details',
          enableSorting: false,
          header: () => t('details'),
          cell: info => (
            <table cellSpacing={0}>
              <tbody>
                {!info.getValue()?.actors?.length ? null : (
                  <>
                    <DetailTableRow label={t('actors')} isHeader />
                    <DetailTableRow
                      children={info
                        .getValue()
                        ?.actors.map((actor, i) => (
                          <CustomChip key={`${i}`} label={actor} size="tiny" variant="outlined" />
                        ))}
                    />
                  </>
                )}

                {!info.getValue()?.attacks?.length ? null : (
                  <>
                    <DetailTableRow label={t('attacks')} isHeader />
                    <DetailTableRow
                      children={info
                        .getValue()
                        ?.attacks.map((attack, i) => (
                          <CustomChip
                            key={`${i}`}
                            label={attack.pattern}
                            size="tiny"
                            variant="outlined"
                            type="rounded"
                          />
                        ))}
                    />
                  </>
                )}

                {!info.getValue()?.malware_families?.length ? null : (
                  <>
                    <DetailTableRow label={t('malware_families')} isHeader />
                    <DetailTableRow
                      children={info
                        .getValue()
                        ?.malware_families.map((actor, i) => (
                          <CustomChip key={`${i}`} label={actor} size="tiny" variant="outlined" />
                        ))}
                    />
                  </>
                )}
              </tbody>
            </table>
          ),
          meta: { cellSx: { textTransform: 'capitalize' } }
        })
      ],
      [columnHelper, t, theme.palette.text.secondary]
    );

    const isRowActive = useCallback((row: SandboxSignatureItem, activeValue?: SandboxFilter) => {
      if (!activeValue) return false;

      // Check for process match
      if (activeValue?.process && row?.pids?.includes(activeValue.process.pid)) return true;

      // Check for signature match (if row has a signature property or related field)
      if (activeValue?.signature && row?.signature_id === activeValue.signature.signature_id) return true;

      // Check for netflow match (assuming you want to match against command_line or similar)
      if (activeValue?.netflow && row.pids.includes(activeValue?.netflow?.pid)) return true;

      return false;
    }, []);

    const handleRowClick = useCallback(
      (row: SandboxSignatureItem) => {
        onActiveChange(prev =>
          prev?.signature?.signature_id === row.signature_id ? undefined : { signature: structuredClone(row) }
        );
      },
      [onActiveChange]
    );

    return (
      <TableContainer
        columns={columns}
        data={body.signatures}
        initialSorting={[{ id: 'name', desc: false }]}
        printable={printable}
        // rowSpanning={['name', 'type', 'classification', 'actors']}
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
