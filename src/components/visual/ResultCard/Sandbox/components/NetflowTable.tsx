import { Tooltip, useTheme } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { SandboxBody, SandboxNetflowItem } from 'components/models/base/result_body';
import { DNS_RECORD_TYPES } from 'components/models/ontology/results/network';
import CustomChip from 'components/visual/CustomChip';
import { TableContainer } from 'components/visual/ResultCard/Sandbox/common/TableContainer';
import { DetailTableRow } from 'components/visual/ResultCard/Sandbox/common/Tables';
import type { SandboxFilter } from 'components/visual/ResultCard/Sandbox/sandbox.utils';
import { KVBody } from 'components/visual/ResultCard/kv_body';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
    activeValue,
    preventRender,
    getRowCount = () => null,
    onActiveChange = () => null
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
      [columnHelper, t, theme, startTime]
    );

    // const isRowActive = useCallback((row: SandboxNetflowItem, activeValue?: SandboxFilter) => {
    //   if (!activeValue) return false;

    //   // Check for process match
    //   if (activeValue?.process && row.pid === activeValue.process.pid) return true;

    //   // Check for signature match (if row has a signature property or related field)
    //   if (activeValue?.signature && row.image?.includes(activeValue.signature)) return true;

    //   // Check for netflow match (assuming you want to match against command_line or similar)
    //   if (activeValue?.netflow && row.command_line?.includes(activeValue.netflow)) return true;

    //   return false;
    // }, []);

    const isRowActive = useCallback((row: SandboxNetflowItem, activeValue?: SandboxFilter) => {
      if (!activeValue) return false;

      // Check for process match
      if (activeValue?.process && row?.pid === activeValue.process.pid) return true;

      // Check for signature match (if row has a signature property or related field)
      if (activeValue?.signature && activeValue.signature.pids.includes(row?.pid)) return true;

      // Check for netflow match (assuming you want to match against command_line or similar)
      if (activeValue?.netflow && JSON.stringify(row) === JSON.stringify(activeValue?.netflow)) return true;

      return false;
    }, []);

    const handleRowClick = useCallback(
      (row: SandboxNetflowItem) => {
        onActiveChange(prev =>
          JSON.stringify(row) === JSON.stringify(prev?.netflow) ? undefined : { netflow: structuredClone(row) }
        );
      },
      [onActiveChange]
    );

    return (
      <TableContainer
        columns={columns}
        data={body.netflows}
        initialSorting={[{ id: 'time_observed', desc: false }]}
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
