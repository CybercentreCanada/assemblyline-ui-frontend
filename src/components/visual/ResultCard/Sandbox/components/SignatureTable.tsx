import { useTheme } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import useALContext from 'components/hooks/useALContext';
import useHighlighter from 'components/hooks/useHighlighter';
import type { SandboxProcessItem, SandboxSignatureItem } from 'components/models/base/result_body';
import Attack from 'components/visual/Attack';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import { TableContainer } from 'components/visual/ResultCard/Sandbox/common/TableContainer';
import { DetailTableRow } from 'components/visual/ResultCard/Sandbox/common/Tables';
import Verdict from 'components/visual/Verdict';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/***
 * Signature Table
 */
type FlatSignatures = SandboxSignatureItem & { flatAttacks?: Record<string, string[]> };

type SignatureTableProps = {
  data?: SandboxSignatureItem[];
  printable?: boolean;
  force?: boolean;
  filterValue?: SandboxProcessItem;
  preventRender?: boolean;
  onFilter?: () => void;
  onQuantityChange?: (quantity: number) => void;
};

export const SignatureTable = React.memo(
  ({
    data = [],
    printable = false,
    force,
    filterValue,
    preventRender,
    onFilter = () => null,
    onQuantityChange = () => null
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
          cell: info => <Verdict fullWidth short score={info.getValue()} />,
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
                          <Attack
                            key={`${i}`}
                            text={attack.pattern}
                            lvl={scoreToVerdict(info.getValue().score)}
                            highlight_key={getKey('attack_pattern', attack.attack_id)}
                            force={force}
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
      [columnHelper, t, theme.palette.text.secondary, scoreToVerdict, getKey, force]
    );

    return (
      <TableContainer
        columns={columns}
        data={data}
        initialSorting={[{ id: 'name', desc: false }]}
        printable={printable}
        // rowSpanning={['name', 'type', 'classification', 'actors']}
        filterValue={filterValue}
        preventRender={preventRender}
        onFilter={row => row.pids.includes(filterValue?.pid)}
        onQuantityChange={onQuantityChange}
      />
    );
  }
);
