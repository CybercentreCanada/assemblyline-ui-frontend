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

type FlatSignatures = SandboxSignatureItem & {
  flatAttacks?: Record<string, string[]>;
};

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

    const renderChipList = (items?: string[], type?: 'rounded' | 'round' | 'square') =>
      items?.map((label, i) => <CustomChip key={i} label={label} size="tiny" variant="outlined" type={type} />);

    const columns = useMemo<ColumnDef<FlatSignatures>[]>(
      () => [
        columnHelper.accessor('classification', {
          header: () => t('classification'),
          cell: info => <Classification c12n={info.getValue()} size="tiny" type="text" />
        }),
        columnHelper.accessor('pid', {
          id: 'processes',
          enableSorting: false,
          header: () => t('processes'),
          cell: info => (
            <>
              {info
                .getValue()
                ?.map(pid => <ProcessChip key={pid} short process={body.processes.find(p => p.pid === pid)} />)}
            </>
          ),
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
          meta: { cellSx: { textTransform: 'capitalize' } }
        }),
        columnHelper.accessor(row => row, {
          id: 'details',
          header: () => t('details'),
          enableSorting: false,
          cell: info => {
            const { actors, attacks, malware_families: malwareFamilies } = info.getValue();

            return (
              <table cellSpacing={0}>
                <tbody>
                  {actors?.length > 0 && (
                    <>
                      <DetailTableRow label={t('actors')} isHeader />
                      <DetailTableRow>{renderChipList(info.getValue()?.actors)}</DetailTableRow>
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
          },
          meta: { cellSx: { textTransform: 'capitalize' } }
        })
      ],
      [body.processes, columnHelper, t, theme.palette.text.secondary]
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
        isRowFiltered={(row, value) => row.pid.includes(value.pid)}
      />
    );
  }
);
