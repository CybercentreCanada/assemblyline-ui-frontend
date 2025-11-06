import { Tooltip, useTheme } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { SandboxBody, SandboxNetflowItem } from 'components/models/base/result_body';
import { DNS_RECORD_TYPES } from 'components/models/ontology/results/network';
import CustomChip from 'components/visual/CustomChip';
import { KVBody } from 'components/visual/ResultCard/kv_body';
import { ProcessChip } from 'components/visual/ResultCard/Sandbox/common/ProcessChip';
import { TableContainer } from 'components/visual/ResultCard/Sandbox/common/TableContainer';
import { DetailTableRow } from 'components/visual/ResultCard/Sandbox/common/Tables';
import { compareIPs, type SandboxFilter } from 'components/visual/ResultCard/Sandbox/sandbox.utils';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type NetflowTableProps = {
  body?: SandboxBody | null;
  printable?: boolean;
  startTime?: number;
  filterValue?: SandboxFilter;
  preventRender?: boolean;
  getRowCount?: (count: number) => void;
};

export const NetflowTable = React.memo(
  ({
    body = null,
    printable = false,
    startTime,
    filterValue,
    preventRender,
    getRowCount = () => null
  }: NetflowTableProps) => {
    const { t } = useTranslation('sandboxResult');
    const theme = useTheme();
    const columnHelper = createColumnHelper<SandboxNetflowItem>();

    const columns = useMemo<ColumnDef<SandboxNetflowItem>[]>(
      () => [
        columnHelper.accessor('time_observed', {
          header: () => t('timeshift'),
          cell: ({ getValue }) => {
            if (!getValue() || !startTime) return '-';
            const deltaSec = (new Date(getValue()).getTime() - startTime) / 1000;
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
        columnHelper.accessor(
          row => {
            const process = body?.processes?.find(p => p.pid === row.pid);
            return process ? [process.image?.split(/[/\\]/).pop() ?? '', process.pid] : null;
          },
          {
            id: 'process',
            header: () => t('process'),
            sortDescFirst: false,
            cell: ({ getValue }) => {
              const pid = getValue()?.[1];
              const process = body?.processes?.find(p => p.pid === pid);
              return process ? <ProcessChip short process={process} /> : '-';
            },
            meta: { cellSx: { wordBreak: 'inherit !important' } }
          }
        ),
        columnHelper.accessor('transport_layer_protocol', {
          header: () => t('protocol'),
          cell: ({ getValue }) => getValue()?.toUpperCase() ?? '-',
          sortingFn: (a, b) => {
            const nameA = a.original?.transport_layer_protocol?.toLowerCase() || '';
            const nameB = b.original?.transport_layer_protocol?.toLowerCase() || '';

            if (nameA == '' && nameB == '') return 0;
            if (nameA == '') return 1;
            if (nameB == '') return -1;

            return nameA.localeCompare(nameB);
          },
          meta: { cellSx: { textTransform: 'uppercase' } }
        }),
        columnHelper.accessor('source_ip', {
          header: () => t('source'),
          sortingFn: (a, b) =>
            compareIPs(
              `${a.original.source_ip ?? '999.999.999.999'}:${a.original.source_port ?? '999999'}`,
              `${b.original.source_ip ?? '999.999.999.999'}:${b.original.source_port ?? '999999'}`
            ),
          cell: ({ getValue, row }) => {
            if (!getValue()) return '-';
            return (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ whiteSpace: 'nowrap' }}>{getValue()}</div>
                {row.original.source_port && (
                  <div style={{ color: theme.palette.text.secondary }}>{`:${row.original.source_port}`}</div>
                )}
              </div>
            );
          }
        }),
        columnHelper.accessor('destination_ip', {
          header: () => t('destination'),
          sortingFn: (a, b) =>
            compareIPs(
              `${a.original.destination_ip ?? '999.999.999.999'}:${a.original.destination_port ?? '999999'}`,
              `${b.original.destination_ip ?? '999.999.999.999'}:${b.original.destination_port ?? '999999'}`
            ),
          cell: ({ getValue, row }) => {
            if (!getValue()) return '-';
            return (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ whiteSpace: 'nowrap' }}>{getValue()}</div>
                {row.original.destination_port && (
                  <div style={{ color: theme.palette.text.secondary }}>{`:${row.original.destination_port}`}</div>
                )}
              </div>
            );
          }
        }),
        columnHelper.accessor('connection_type', {
          header: () => t('type'),
          cell: ({ getValue }) => getValue()?.toUpperCase() ?? '-',
          meta: { cellSx: { textTransform: 'uppercase' } }
        }),

        columnHelper.accessor('connection_details', {
          header: () => t('details'),
          enableSorting: false,
          cell: ({ row }) => {
            const original = row.original;

            switch (original.connection_type) {
              case 'http':
                return (
                  <table cellSpacing={0}>
                    <tbody>
                      <DetailTableRow isHeader label={t('request')} />
                      <DetailTableRow label={t('uri')} value={original.http_details?.request_uri} />
                      <DetailTableRow label={t('method')} value={original.http_details?.request_method} />
                      <DetailTableRow label={t('headers')} value={original.http_details?.request_headers} />
                      <DetailTableRow label={t('body')} value={original.http_details?.request_body} />
                      <DetailTableRow isHeader label={t('response')} />
                      <DetailTableRow label={t('status_code')} value={original.http_details?.response_status_code} />
                      <DetailTableRow label={t('mimetype')} value={original.http_details?.response_content_mimetype} />
                      <DetailTableRow label={t('fileinfo')} value={original.http_details?.response_content_fileinfo} />
                      <DetailTableRow label={t('headers')} value={original.http_details?.response_headers} />
                      <DetailTableRow label={t('body')} value={original.http_details?.response_body} />
                    </tbody>
                  </table>
                );

              case 'smtp':
                return (
                  <table cellSpacing={0}>
                    <tbody>
                      <DetailTableRow label={t('mail_from')} value={original.smtp_details?.mail_from} />
                      <DetailTableRow label={t('mail_to')} value={original.smtp_details?.mail_to} />
                      <DetailTableRow label={t('attachments')} value={original.smtp_details?.attachments} />
                    </tbody>
                  </table>
                );

              case 'dns':
                return (
                  <table cellSpacing={0}>
                    <tbody>
                      <DetailTableRow label={t('domain')} value={original.dns_details?.domain} />
                      <DetailTableRow
                        label={t('lookup_type')}
                        value={original.dns_details?.lookup_type}
                        {...(original.dns_details?.lookup_type &&
                          DNS_RECORD_TYPES[original.dns_details.lookup_type] && {
                            children: (
                              <Tooltip title={DNS_RECORD_TYPES[original.dns_details.lookup_type]}>
                                <CustomChip
                                  label={original.dns_details.lookup_type}
                                  size="tiny"
                                  variant="outlined"
                                  type="rounded"
                                />
                              </Tooltip>
                            )
                          })}
                      />
                      <DetailTableRow label={t('resolved_domains')} value={original.dns_details?.resolved_domains} />
                      <DetailTableRow label={t('resolved_ips')} value={original.dns_details?.resolved_ips} />
                    </tbody>
                  </table>
                );
              default:
                const details = original.dns_details || original.smtp_details || original.http_details || {};
                return <KVBody body={details} />;
            }
          },
          meta: { colStyle: { width: '100%' } }
        })
      ],
      [columnHelper, theme.palette.text.secondary, t, startTime, body?.processes]
    );

    return (
      <TableContainer
        columns={columns}
        data={body?.netflows ?? []}
        initialSorting={[{ id: 'time_observed', desc: false }]}
        printable={printable}
        filterValue={filterValue}
        preventRender={preventRender}
        getRowCount={getRowCount}
        isRowFiltered={(row, value) => row.pid === value.pid}
      />
    );
  }
);
