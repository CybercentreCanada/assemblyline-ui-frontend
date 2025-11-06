import { Tooltip, useTheme } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { SandboxBody, SandboxNetflowItem } from 'components/models/base/result_body';
import { DNS_RECORD_TYPES } from 'components/models/ontology/results/network';
import CustomChip from 'components/visual/CustomChip';
import { ProcessChip } from 'components/visual/ResultCard/Sandbox/common/ProcessChip';
import { TableContainer } from 'components/visual/ResultCard/Sandbox/common/TableContainer';
import { DetailTableRow } from 'components/visual/ResultCard/Sandbox/common/Tables';
import type { SandboxFilter } from 'components/visual/ResultCard/Sandbox/sandbox.utils';
import { KVBody } from 'components/visual/ResultCard/kv_body';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const compareIPs = (ipA: string, ipB: string): number => {
  const aParts = ipA.split(/[.:]/).map(Number);
  const bParts = ipB.split(/[.:]/).map(Number);

  const maxLen = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < maxLen; i++) {
    const pa = aParts[i] || 0;
    const pb = bParts[i] || 0;
    if (pa !== pb) return pa - pb;
  }

  return 0;
};

type NetflowTableProps = {
  body?: SandboxBody;
  printable?: boolean;
  startTime?: number;
  filterValue?: SandboxFilter;
  activeValue?: SandboxFilter;
  preventRender?: boolean;
  getRowCount?: (count: number) => void;
  onActiveChange?: React.Dispatch<React.SetStateAction<SandboxFilter>>;
  onFilterChange?: React.Dispatch<React.SetStateAction<SandboxFilter>>;
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
        columnHelper.accessor(row => row.time_observed, {
          id: 'time_observed',
          header: () => t('timeshift'),
          cell: info => {
            const cur = info.getValue();
            if (!cur || !startTime) return '-';
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
        columnHelper.accessor(
          row => {
            const process = body.processes.find(p => p.pid === row.pid);
            return !process ? null : [process?.image?.split(/[/\\]/).pop() ?? '', process.pid];
          },
          {
            id: 'process',
            header: () => t('process'),
            cell: info => <ProcessChip short process={body.processes?.find(p => p.pid === info.getValue()?.[1])} />,
            meta: {
              cellSx: { wordBreak: 'inherit !important' }
            }
          }
        ),
        columnHelper.accessor('transport_layer_protocol', {
          header: () => t('protocol'),
          cell: info => info.getValue(),
          meta: { cellSx: { textTransform: 'uppercase' } }
        }),

        columnHelper.accessor('source_ip', {
          header: () => t('source'),
          sortingFn: (a, b) =>
            compareIPs(
              `${a.original.source_ip || '999.999.999.999'}:${a.original.source_port || '999999'}`,
              `${b.original.source_ip || '999.999.999.999'}:${b.original.source_port || '999999'}`
            ),
          cell: info =>
            info.getValue() && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ whiteSpace: 'nowrap' }}>{info.getValue()}</div>
                {info.row.original?.source_port && (
                  <div style={{ color: theme.palette.text.secondary }}>{` : ${info.row.original?.source_port}`}</div>
                )}
              </div>
            ),
          meta: { cellSx: {} }
        }),
        columnHelper.accessor('destination_ip', {
          header: () => t('destination'),
          sortingFn: (a, b) =>
            compareIPs(
              `${a.original.destination_ip || '999.999.999.999'}:${a.original.destination_port || '999999'}`,
              `${b.original.destination_ip || '999.999.999.999'}:${b.original.destination_port || '999999'}`
            ),
          cell: info =>
            info.getValue() && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ whiteSpace: 'nowrap' }}>{info.getValue()}</div>
                {info.row.original?.source_port && (
                  <div
                    style={{ color: theme.palette.text.secondary }}
                  >{` : ${info.row.original?.destination_port}`}</div>
                )}
              </div>
            ),
          meta: { cellSx: {} }
        }),
        columnHelper.accessor('connection_type', {
          header: () => t('type'),
          cell: info => info.getValue(),
          meta: { cellSx: { textTransform: 'uppercase' } }
        }),
        columnHelper.accessor('connection_details', {
          header: () => t('details'),
          enableSorting: false,
          cell: info => {
            const original = info.row.original;

            const details =
              (original.connection_type === 'dns' && original.dns_details) ||
              (original.connection_type === 'smtp' && original.smtp_details) ||
              (original.connection_type === 'http' && original.http_details) ||
              original.dns_details ||
              original.smtp_details ||
              original.http_details ||
              {};

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
                        {...(original.dns_details?.lookup_type in DNS_RECORD_TYPES && {
                          children: (
                            <Tooltip title={DNS_RECORD_TYPES?.[original.dns_details?.lookup_type]}>
                              <CustomChip
                                label={original.dns_details?.lookup_type}
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
            }

            return <KVBody body={details} />;
          },
          meta: { colStyle: { width: '100%' }, cellSx: {} }
        })
      ],
      [columnHelper, theme.palette.text.secondary, t, startTime, body.processes]
    );

    return (
      <TableContainer
        columns={columns}
        data={body.netflows}
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
