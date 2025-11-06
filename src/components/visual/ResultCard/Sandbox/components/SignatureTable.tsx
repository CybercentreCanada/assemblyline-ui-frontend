import { useTheme } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { SandboxBody, SandboxSignatureItem } from 'components/models/base/result_body';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import { ProcessChip } from 'components/visual/ResultCard/Sandbox/common/ProcessChip';
import { TableContainer } from 'components/visual/ResultCard/Sandbox/common/TableContainer';
import { DetailTableRow } from 'components/visual/ResultCard/Sandbox/common/Tables';
import type { SandboxFilter } from 'components/visual/ResultCard/Sandbox/sandbox.utils';
import Verdict from 'components/visual/Verdict';
import React, { useMemo } from 'react';
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
    getRowCount = () => null
  }: SignatureTableProps) => {
    const { t } = useTranslation('sandboxResult');
    const theme = useTheme();

    const columnHelper = createColumnHelper<FlatSignatures>();

    const columns = useMemo<ColumnDef<FlatSignatures>[]>(
      () => [
        columnHelper.accessor('classification', {
          header: () => t('classification'),
          cell: info => <Classification c12n={info.getValue()} size="tiny" type="text" />,
          meta: {}
        }),
        columnHelper.accessor('pids', {
          id: 'processes',
          enableSorting: false,
          header: () => t('processes'),
          cell: info =>
            info
              .getValue()
              ?.map((pid, i) => <ProcessChip key={i} short process={body.processes.find(p => p.pid === pid)} />),
          meta: {
            colStyle: { width: '1%' },
            cellSx: { wordBreak: 'inherit !important', whiteSpace: 'nowrap' }
          }
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
      [body.processes, columnHelper, t, theme.palette.text.secondary]
    );

    return (
      <TableContainer
        columns={columns}
        data={body.signatures}
        initialSorting={[{ id: 'name', desc: false }]}
        printable={printable}
        filterValue={filterValue}
        activeValue={activeValue}
        preventRender={preventRender}
        getRowCount={getRowCount}
        isRowFiltered={(row, value) => row.pids.includes(value.pid)}
      />
    );
  }
);
