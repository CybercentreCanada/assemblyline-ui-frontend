import { useTheme } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { SandboxNetflowItem } from 'components/models/base/result_body';
import ActionableCustomChip from 'components/visual/ActionableCustomChip';
import { TableContainer } from 'components/visual/ResultCard/Sandbox/common/TableContainer';
import { DetailTableRow } from 'components/visual/ResultCard/Sandbox/common/Tables';
import { KVBody } from 'components/visual/ResultCard/kv_body';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type NetflowTableProps = {
  data?: SandboxNetflowItem[];
  printable?: boolean;
  startTime?: number;
};

export const NetflowTable = React.memo(({ data = [], printable = false, startTime }: NetflowTableProps) => {
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
      columnHelper.accessor('transport_layer_protocol', {
        header: () => t('protocol'),
        cell: info => info.getValue(),
        meta: { cellSx: { textTransform: 'uppercase' } }
      }),

      columnHelper.accessor('source_ip', {
        header: () => t('source'),
        cell: info =>
          info.getValue() && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ActionableCustomChip
                category="tag"
                data_type="network.static.ip"
                label={info.getValue()}
                size="tiny"
                variant="outlined"
              />
              {info.row.original?.source_port && (
                <div style={{ color: theme.palette.text.secondary }}>{` : ${info.row.original?.source_port}`}</div>
              )}
            </div>
          ),
        meta: { cellSx: {} }
      }),
      columnHelper.accessor('destination_ip', {
        header: () => t('destination'),
        cell: info =>
          info.getValue() && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ActionableCustomChip
                category="tag"
                data_type="network.static.ip"
                label={info.getValue()}
                size="tiny"
                variant="outlined"
              />
              {info.row.original?.source_port && (
                <div style={{ color: theme.palette.text.secondary }}>{` : ${info.row.original?.destination_port}`}</div>
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
                    <DetailTableRow label={t('lookup_type')} value={original.dns_details?.lookup_type} />
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
    [columnHelper, t, theme, startTime]
  );

  return (
    <TableContainer
      columns={columns}
      data={data}
      initialSorting={[{ id: 'time_observed', desc: false }]}
      printable={printable}
    />
  );
});
