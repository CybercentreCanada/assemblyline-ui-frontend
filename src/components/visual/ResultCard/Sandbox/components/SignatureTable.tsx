import { useTheme } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type {
  SandboxHeuristicItem,
  SandboxProcessItem,
  SandboxSignatureItem
} from 'components/models/base/result_body';
import Classification from 'components/visual/Classification';
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
  heuristics?: SandboxHeuristicItem[];
  printable?: boolean;
  force?: boolean;
  filterValue?: SandboxProcessItem;
};

export const SignatureTable = React.memo(
  ({ data = [], heuristics = [], printable = false, force, filterValue }: SignatureTableProps) => {
    const { t } = useTranslation('sandboxResult');
    const theme = useTheme();
    const columnHelper = createColumnHelper<FlatSignatures>();

    const flatData = useMemo<FlatSignatures[]>(() => {
      if (!data?.length) return [];

      return data.map(sig => {
        const grouped: Record<string, string[]> = {};

        const attacks = sig.attacks ?? [];
        for (const attack of attacks) {
          if (!attack.categories?.length) continue;
          for (const category of attack.categories) {
            if (!grouped[category]) grouped[category] = [];
            grouped[category].push(attack.pattern);
          }
        }

        return {
          ...sig,
          flatAttacks: Object.keys(grouped).length > 0 ? grouped : undefined
        };
      });
    }, [data]);

    const columns = useMemo<ColumnDef<FlatSignatures>[]>(
      () => [
        columnHelper.accessor('type', {
          header: () => t('type'),
          cell: info => info.getValue(),
          meta: { cellSx: { wordBreak: 'inherit !important', whiteSpace: 'no-wrap' } }
        }),
        columnHelper.accessor('heuristic', {
          header: () => t('verdict'),
          cell: info => <Verdict fullWidth score={heuristics?.find(h => h.heur_id === info.getValue()).score} />,
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
        columnHelper.accessor('classification', {
          header: () => t('classification'),
          cell: info => <Classification c12n={info.getValue()} size="tiny" type="text" />,
          meta: {}
        }),

        ...(flatData.some(v => v.malware_families?.length) && [
          columnHelper.accessor('malware_families', {
            header: () => t('malware_families'),
            cell: info => info.getValue()?.join(' | ') ?? '',
            meta: {}
          })
        ]),

        ...(flatData.some(v => v.actors?.length) && [
          columnHelper.accessor('actors', {
            header: () => t('actors'),
            cell: info => info.getValue()?.join(' | ') ?? '',
            meta: {}
          })
        ]),

        ...(flatData.some(v => Object.keys(v.flatAttacks)?.length) && [
          columnHelper.accessor('flatAttacks', {
            header: () => t('attacks'),
            cell: info => (
              <table cellSpacing={0}>
                <tbody>
                  {Object.entries(info.getValue() || {}).map(([k, v], i) => (
                    <DetailTableRow key={`${k}-${i}`} label={k} value={v} />
                  ))}
                </tbody>
              </table>
            ),
            meta: {}
          })
        ])

        // columnHelper.group({
        //   id: 'attacks',
        //   header: () => t('attacks'),
        //   columns: [
        //     columnHelper.accessor('attackKey', {
        //       header: () => t('key'),
        //       meta: { cellSx: { fontWeight: 500, wordBreak: 'inherit !important' } }
        //     }),
        //     columnHelper.accessor('attackValues', {
        //       header: () => t('values'),
        //       cell: info => {
        //         const values = (info.getValue() ?? []) as string[];
        //         if (!values.length) return null;
        //         return (
        //           <AutoHideTagList
        //             tag_type={info.row.original.attackKey || ''}
        //             items={values.map(v => ({ value: v, lvl: 'info', safelisted: false }))}
        //             force={force}
        //           />
        //         );
        //       },
        //       meta: { cellSx: {} }
        //     })
        //   ]
        // })
      ],
      [columnHelper, flatData, t, heuristics, theme.palette.text.secondary]
    );

    return (
      <TableContainer
        columns={columns}
        data={flatData}
        initialSorting={[{ id: 'start_time', desc: false }]}
        printable={printable}
        // rowSpanning={['name', 'type', 'classification', 'actors']}
        filterValue={filterValue}
        onFilter={(row, value) => row.pid === filterValue?.pid}
      />
    );
  }
);
