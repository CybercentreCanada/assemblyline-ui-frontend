import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { alpha, Button, Collapse, List, ListItem, Typography, useTheme } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import useALContext from 'components/hooks/useALContext';
import useSafeResults from 'components/hooks/useSafeResults';
import type {
  SandboxBody as SandboxData,
  SandboxHeuristicItem,
  SandboxNetflowItem,
  SandboxProcessItem,
  SandboxSignatureItem
} from 'components/models/base/result_body';
import ActionableCustomChip from 'components/visual/ActionableCustomChip';
import AutoHideTagList from 'components/visual/AutoHideTagList';
import Classification from 'components/visual/Classification';
import { CustomChip } from 'components/visual/CustomChip';
import { TableContainer } from 'components/visual/ResultCard/components/TableContainer';
import { KVBody } from 'components/visual/ResultCard/kv_body';
import { TabContainer } from 'components/visual/TabContainer';
import TitleKey from 'components/visual/TitleKey';
import Verdict from 'components/visual/Verdict';
import type { PossibleColor } from 'helpers/colors';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type DetailTableCellValueProps = {
  value?: unknown;
};

const DetailTableCellValue = React.memo(({ value = null }: DetailTableCellValueProps) => {
  if (Array.isArray(value))
    return (
      <>
        {value.map((v, i) => (
          <DetailTableCellValue key={i} value={v} />
        ))}
      </>
    );
  if (value && typeof value === 'object') return Object.keys(value).length > 0 ? <KVBody body={value} /> : null;
  if (value === null || value === undefined) return null;
  return <>{String(value)}</>;
});

type DetailTableRowProps = {
  label?: string;
  value?: unknown;
  isHeader?: boolean;
  children?: React.ReactNode;
};

const DetailTableRow = React.memo(({ label, value, isHeader = false, children = null }: DetailTableRowProps) => {
  const theme = useTheme();

  const showValue = useMemo(() => {
    if (children) return true;
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') return Object.keys(value).length > 0;
    return !!value;
  }, [children, value]);

  if (isHeader) {
    return (
      <tr>
        <td colSpan={2} style={{ paddingRight: '16px', wordBreak: 'normal', color: theme.palette.text.secondary }}>
          <TitleKey title={label || ''} />
        </td>
      </tr>
    );
  }

  if (showValue)
    return (
      <tr>
        <td style={{ paddingRight: '16px', wordBreak: 'normal' }}>
          <TitleKey title={label || ''} />{' '}
        </td>
        <td>{children ?? <DetailTableCellValue value={value} />}</td>
      </tr>
    );
});

/***
 * Process Graph
 */
type ProcessItem = SandboxProcessItem & {
  children?: ProcessItem[];
};

type ProcessTreeItemProps = {
  body: SandboxData;
  item: ProcessItem;
  depth?: number;
  printable?: boolean;
  filterValue: SandboxProcessItem;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: ProcessItem) => void;
};

const ProcessTreeItem = React.memo(
  ({ body, item, depth = 0, printable = false, filterValue, onClick = () => null }: ProcessTreeItemProps) => {
    const theme = useTheme();
    const { showSafeResults } = useSafeResults();
    const { scoreToVerdict } = useALContext();

    const [open, setOpen] = useState<boolean>(false);

    const hasChildren = useMemo<boolean>(() => !!item.children?.length, [item.children?.length]);

    const networks = useMemo<SandboxNetflowItem[]>(
      () => body?.netflows?.filter(x => x?.pid === item?.pid) ?? [],
      [body?.netflows, item?.pid]
    );

    const signatures = useMemo<SandboxSignatureItem[]>(
      () => body?.signatures?.filter(x => x?.pid === item?.pid) ?? [],
      [body?.signatures, item?.pid]
    );

    const networkCount = useMemo<number>(() => 0, []);

    const fileCount = useMemo<number>(() => 0, []);

    const registryCount = useMemo<number>(() => 0, []);

    const hasValues = useMemo<boolean>(
      () => networks.length > 0 || signatures.length > 0 || networkCount > 0 || fileCount > 0 || registryCount > 0,
      [fileCount, networkCount, networks.length, registryCount, signatures.length]
    );

    const backgroundStyle = useMemo(() => {
      const dark = theme.palette.mode === 'dark';

      if (filterValue?.pid === item?.pid) {
        return {
          backgroundColor: dark ? theme.palette.primary.dark : theme.palette.primary.light,
          hover: dark ? alpha(theme.palette.primary.light, 0.25) : alpha(theme.palette.primary.main, 0.15),
          print: theme.palette.primary.light
        };
      }

      if (item.integrity_level === 'system') {
        return {
          backgroundColor: dark ? '#254e25' : '#d0ffd0',
          hover: dark ? '#355e35' : '#c0efc0',
          print: '#d0ffd0'
        };
      }

      const score = Object.keys(signatures ?? {}).reduce((sum, key) => sum + parseFloat(signatures?.[key] || '0'), 0);
      const verdict = scoreToVerdict(score);

      switch (verdict) {
        case 'malicious':
          return {
            backgroundColor: dark ? '#4e2525' : '#ffd0d0',
            hover: dark ? '#5e3535' : '#efc0c0',
            print: '#ffd0d0'
          };
        case 'highly_suspicious':
        case 'suspicious':
          return {
            backgroundColor: dark ? '#654312' : '#ffedd4',
            hover: dark ? '#755322' : '#efddc4',
            print: '#ffedd4'
          };
        default:
          return {
            backgroundColor: dark ? '#FFFFFF10' : '#00000010',
            hover: dark ? '#FFFFFF20' : '#00000020',
            print: '#FFFFFF10'
          };
      }
    }, [
      theme.palette.mode,
      theme.palette.primary.dark,
      theme.palette.primary.light,
      theme.palette.primary.main,
      filterValue?.pid,
      item?.pid,
      item.integrity_level,
      signatures,
      scoreToVerdict
    ]);

    const handleToggle = useCallback(() => setOpen(o => !o), []);

    return (
      <>
        <ListItem
          sx={{
            pl: depth * 3,
            pr: 0,
            py: 0.5,
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center'
          }}
        >
          {hasChildren ? (
            <Button
              color="inherit"
              size="small"
              onClick={handleToggle}
              sx={{
                height: '100%',
                padding: '0px',
                minWidth: theme.spacing(3)
              }}
            >
              <ChevronRightIcon
                fontSize="small"
                sx={{
                  transition: `transform ${theme.transitions.duration.shortest}ms ${theme.transitions.easing.sharp}`,
                  transform: open ? 'rotate(90deg)' : 'rotate(0deg)'
                }}
              />
            </Button>
          ) : (
            <div style={{ width: theme.spacing(4) }} />
          )}

          <Button
            color="inherit"
            onClick={e => onClick(e, item)}
            sx={{
              // alignSelf: 'stretch',
              alignItems: 'center',
              justifyContent: 'start',
              width: '100%',
              padding: '0px',
              textTransform: 'none'
              // border: `1px solid ${theme.palette.divider}`,
              // backgroundColor: theme.palette.background.paper,
              // '&:hover': {
              //   backgroundColor: alpha(theme.palette.text.primary, 0.15)
              // }
            }}
          >
            <Typography
              variant="body1"
              sx={{
                // backgroundColor: alpha(theme.palette.text.primary, 0.15),
                borderRadius: theme.spacing(0.4),
                minWidth: theme.spacing(6)
              }}
            >
              {item.pid}
            </Typography>

            <Typography fontStyle="bold" variant="body1" sx={{ margin: `0 ${theme.spacing(1)}` }}>
              {item.image?.split(/[/\\]/).pop() ?? ''}
            </Typography>

            <Typography color="textSecondary" fontFamily="monospace" variant="body2">
              {item.command_line}
            </Typography>
          </Button>
        </ListItem>

        {hasChildren && (
          <Collapse
            in={open}
            timeout={theme.transitions.duration.shortest}
            easing={theme.transitions.easing.sharp}
            unmountOnExit
          >
            <List disablePadding>
              {item.children.map(child => (
                <ProcessTreeItem
                  key={child.pid}
                  body={body}
                  item={child}
                  depth={depth + 1}
                  printable={printable}
                  filterValue={filterValue}
                  onClick={onClick}
                />
              ))}
            </List>
          </Collapse>
        )}
      </>
    );
  }
);

type ProcessGraphProps = {
  body: SandboxData;
  processes: SandboxProcessItem[];
  printable?: boolean;
  force?: boolean;
  filterValue: SandboxProcessItem;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: ProcessItem) => void;
};

const ProcessGraph = React.memo(
  ({ body, processes = [], printable = false, filterValue, onClick = () => null }: ProcessGraphProps) => {
    const theme = useTheme();

    const buildProcessTree = useCallback((processes: ProcessItem[]): ProcessItem[] => {
      const map = new Map<number, ProcessItem>();
      for (const proc of processes) map.set(proc.pid, { ...proc, children: [] });

      const roots: ProcessItem[] = [];
      for (const proc of map.values()) {
        if (proc.ppid === 0 || !map.has(proc.ppid)) roots.push(proc);
        else map.get(proc.ppid).children.push(proc);
      }
      return roots;
    }, []);

    const processTree = useMemo(() => (processes ? buildProcessTree(processes) : []), [buildProcessTree, processes]);

    return (
      <div style={{ overflowX: 'auto', maxHeight: printable ? 'auto' : 750 }}>
        <List disablePadding dense>
          {processTree?.map(item => (
            <ProcessTreeItem key={item.pid} body={body} item={item} filterValue={filterValue} onClick={onClick} />
          ))}
        </List>
      </div>
    );
  }
);

/***
 * Process Table
 */
type ProcessTableProps = {
  data?: SandboxProcessItem[];
  printable?: boolean;
  startTime?: number;
  filterValue?: SandboxProcessItem;
  onFilter?: () => void;
};

const ProcessTable = React.memo(
  ({ data = [], printable = false, startTime, filterValue, onFilter = () => null }: ProcessTableProps) => {
    const { t } = useTranslation('resultCard');
    const theme = useTheme();
    const columnHelper = createColumnHelper<SandboxProcessItem>();

    const integrityLevelColorMap = useMemo<Record<string, PossibleColor>>(
      () => ({
        system: 'primary',
        high: 'success',
        medium: 'warning',
        low: 'error'
      }),
      []
    );

    const columns = useMemo<ColumnDef<SandboxProcessItem>[]>(
      () => [
        columnHelper.accessor('start_time', {
          header: () => t('timeshift'),
          cell: info => {
            const cur = info.getValue();
            if (!startTime || !cur) return '-';
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
        columnHelper.accessor('pid', {
          header: () => t('pid'),
          cell: info => info.getValue(),
          meta: {
            cellSx: {
              wordBreak: 'inherit !important',
              color: theme.palette.text.secondary
            }
          }
        }),
        columnHelper.accessor('image', {
          header: () => t('process_name'),
          cell: info => info.getValue()?.split(/[/\\]/).pop() ?? '',
          meta: {
            cellSx: {
              wordBreak: 'inherit !important'
            }
          }
        }),
        columnHelper.accessor('command_line', {
          header: () => t('command_line'),
          cell: info => info.getValue() ?? info.row.original.image,
          meta: {
            colStyle: { width: '100%' },
            cellSx: { wordBreak: 'inherit !important', color: theme.palette.text.secondary }
          }
        }),
        columnHelper.accessor('integrity_level', {
          header: () => t('integrity_level'),
          cell: info => {
            const level = info.getValue();
            if (!level) return '-';

            return (
              <CustomChip
                label={level}
                fullWidth
                size="tiny"
                color={integrityLevelColorMap[level] ?? undefined}
                variant="outlined"
                sx={{ textTransform: 'capitalize' }}
              />
            );
          },
          meta: {
            cellSx: {
              wordBreak: 'inherit !important',
              color: theme.palette.text.secondary
            }
          }
        }),
        columnHelper.accessor('original_file_name', {
          header: () => t('original_file_name'),
          cell: info => info.getValue(),
          meta: {
            cellSx: {
              wordBreak: 'inherit !important',
              color: theme.palette.text.secondary
            }
          }
        }),
        columnHelper.accessor('ppid', {
          header: () => t('ppid'),
          cell: info => info.getValue() ?? '-',
          meta: {
            cellSx: {
              wordBreak: 'inherit !important',
              color: theme.palette.text.secondary
            }
          }
        })
      ],
      [columnHelper, t, theme, startTime]
    );

    return (
      <TableContainer
        columns={columns}
        data={data}
        initialSorting={[{ id: 'start_time', desc: false }]}
        printable={printable}
        filterValue={filterValue}
        onFilter={(row, value) => row.pid === value.pid}
      />
    );
  }
);

/***
 * Netflow Table
 */
type NetflowTableProps = {
  data?: SandboxNetflowItem[];
  printable?: boolean;
  startTime?: number;
};

const NetflowTable = React.memo(({ data = [], printable = false, startTime }: NetflowTableProps) => {
  const { t } = useTranslation('resultCard');
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

/***
 * Heuristic Table
 */
type FlatHeuristics = SandboxHeuristicItem & { tagKey?: string; tagValues?: string[] };

type HeuristicsTableProps = {
  data?: SandboxHeuristicItem[];
  printable?: boolean;
  force?: boolean;
};

const HeuristicsTable = React.memo(({ data = [], printable = false, force }: HeuristicsTableProps) => {
  const { t } = useTranslation('resultCard');
  const columnHelper = createColumnHelper<FlatHeuristics>();

  const flatData = useMemo<FlatHeuristics[]>(
    () =>
      data.flatMap(h => {
        const tags = h.tags ?? {};
        const tagKeys = Object.keys(tags);

        if (tagKeys.length === 0) {
          return [{ ...h, tagKey: '', tagValues: [] }];
        } else {
          return tagKeys.map(key => ({
            ...h,
            tagKey: key,
            tagValues: tags[key].map(v => v as string)
          }));
        }
      }),
    [data]
  );

  const columns = useMemo<ColumnDef<FlatHeuristics>[]>(
    () => [
      columnHelper.accessor('heur_id', {
        header: () => t('sandbox_body.heuristics.heur_id'),
        cell: info => info.getValue(),
        meta: { cellSx: { wordBreak: 'inherit !important' } }
      }),
      columnHelper.accessor('score', {
        header: () => t('sandbox_body.heuristics.score'),
        cell: info => <Verdict score={info.getValue()} fullWidth />,
        meta: {}
      }),
      columnHelper.accessor('name', {
        header: () => t('sandbox_body.heuristics.name'),
        cell: info => info.getValue(),
        meta: {}
      }),
      columnHelper.group({
        id: 'tags',
        header: () => t('tags'),
        columns: [
          columnHelper.accessor('tagKey', {
            header: () => t('key'),
            meta: { cellSx: { fontWeight: 500, wordBreak: 'inherit !important' } }
          }),
          columnHelper.accessor('tagValues', {
            header: () => t('values'),
            cell: info => {
              const values = (info.getValue() ?? []) as string[];
              if (!values.length) return null;

              return (
                <AutoHideTagList
                  tag_type={info.row.original.tagKey || ''}
                  items={values.map(v => ({ value: v, lvl: 'info', safelisted: false }))}
                  force={force}
                />
              );
            }
          })
        ]
      })
    ],
    [columnHelper, t, force]
  );

  return (
    <TableContainer
      columns={columns}
      data={flatData}
      initialSorting={[{ id: 'heur_id', desc: false }]}
      printable={printable}
      rowSpanning={['heur_id', 'name', 'score']}
    />
  );
});

/***
 * Signature Table
 */
type FlatSignatures = SandboxSignatureItem & { attackKey?: string; attackValues?: string[] };

type SignatureTableProps = {
  data?: SandboxSignatureItem[];
  printable?: boolean;
  force?: boolean;
  filterValue?: SandboxProcessItem;
};

const SignatureTable = React.memo(({ data = [], printable = false, force, filterValue }: SignatureTableProps) => {
  const { t } = useTranslation('resultCard');
  const columnHelper = createColumnHelper<FlatSignatures>();

  const flatData = useMemo<FlatSignatures[]>(() => {
    if (data.length === 0) return [];

    const out: FlatSignatures[] = [];

    for (const sig of data) {
      const attacks = sig.attacks;
      if (!attacks || attacks.length === 0) {
        out.push({ ...sig, attackKey: '', attackValues: [] });
        continue;
      }

      const grouped: Record<string, string[]> = {};

      for (const attack of attacks) {
        if (!attack.categories || attack.categories.length === 0) continue;
        for (const cat of attack.categories) {
          grouped[cat] ? grouped[cat].push(attack.pattern) : (grouped[cat] = [attack.pattern]);
        }
      }

      const keys = Object.keys(grouped);
      if (keys.length === 0) {
        out.push({ ...sig, attackKey: '', attackValues: [] });
      } else {
        for (const key of keys) {
          out.push({ ...sig, attackKey: key, attackValues: grouped[key] });
        }
      }
    }

    return out;
  }, [data]);

  const columns = useMemo<ColumnDef<FlatSignatures>[]>(
    () => [
      columnHelper.accessor('type', {
        header: () => t('sandbox_body.signature.type'),
        cell: info => info.getValue(),
        meta: {}
      }),
      columnHelper.accessor('name', {
        header: () => t('sandbox_body.signature.name'),
        cell: info => info.getValue()?.replaceAll('_', ' '),
        meta: { cellSx: { textTransform: 'capitalize' } }
      }),
      columnHelper.accessor('classification', {
        header: () => t('sandbox_body.signature.classification'),
        cell: info => <Classification c12n={info.getValue()} size="tiny" type="text" />,
        meta: {}
      }),
      columnHelper.accessor('actors', {
        header: () => t('sandbox_body.signature.actors'),
        cell: info => info.getValue()?.join(', ') ?? '',
        meta: {}
      }),
      columnHelper.group({
        id: 'attacks',
        header: () => t('attacks'),
        columns: [
          columnHelper.accessor('attackKey', {
            header: () => t('key'),
            meta: { cellSx: { fontWeight: 500, wordBreak: 'inherit !important' } }
          }),
          columnHelper.accessor('attackValues', {
            header: () => t('values'),
            cell: info => {
              const values = (info.getValue() ?? []) as string[];
              if (!values.length) return null;
              return (
                <AutoHideTagList
                  tag_type={info.row.original.attackKey || ''}
                  items={values.map(v => ({ value: v, lvl: 'info', safelisted: false }))}
                  force={force}
                />
              );
            },
            meta: { cellSx: {} }
          })
        ]
      })
    ],
    [columnHelper, t, force]
  );

  return (
    <TableContainer
      columns={columns}
      data={flatData}
      initialSorting={[{ id: 'start_time', desc: false }]}
      printable={printable}
      rowSpanning={['name', 'type', 'classification', 'actors']}
      filterValue={filterValue}
      onFilter={(row, value) => row.pid === filterValue?.pid}
    />
  );
});

export type SandboxBodyProps = {
  body: SandboxData;
  force?: boolean;
  printable?: boolean;
};

export const SandboxBody = React.memo(({ body, force = false, printable = false }: SandboxBodyProps) => {
  const theme = useTheme();
  const { t } = useTranslation('resultCard');

  const [filterValue, setFilterValue] = useState<SandboxProcessItem | undefined>(undefined);

  const startTime = useMemo<number | undefined>(() => {
    const time = body?.analysis_metadata?.start_time;
    return time ? new Date(time).getTime() : undefined;
  }, [body]);

  const handleProcessGraphClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: ProcessItem) =>
      setFilterValue(prev => (prev && prev.pid === item.pid ? undefined : item)),
    []
  );

  if (!body) return null;
  return (
    <>
      <ProcessGraph
        body={body}
        processes={body.processes}
        filterValue={filterValue}
        onClick={handleProcessGraphClick}
      />

      <TabContainer
        paper
        selectionFollowsFocus
        tabs={{
          ...(body.processes.length && {
            process: {
              label: (
                <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
                  {t('sandbox_body.tab.process')}
                  <CustomChip label={body.processes.length} color="secondary" size="tiny" />
                </div>
              ),
              inner: (
                <ProcessTable
                  data={body.processes}
                  startTime={startTime}
                  printable={printable}
                  filterValue={filterValue}
                />
              )
            }
          }),
          ...(body.netflows.length && {
            netflow: {
              label: (
                <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
                  {t('sandbox_body.tab.netflow')}
                  <CustomChip label={body.netflows.length} color="secondary" size="tiny" />
                </div>
              ),
              inner: <NetflowTable data={body.netflows} startTime={startTime} printable={printable} />
            }
          }),
          // ...(body.heuristics?.length && {
          //   heuristics: {
          //     label: (
          //       <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
          //         {t('sandbox_body.tab.heuristics')}
          //         <CustomChip label={body.heuristics.length} color="secondary" size="tiny" />
          //       </div>
          //     ),
          //     inner: <HeuristicsTable data={body.heuristics} printable={printable} />
          //   }
          // }),
          ...(body.signatures.length && {
            signature: {
              label: (
                <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
                  {t('sandbox_body.tab.signature')}
                  <CustomChip label={body.signatures.length} color="secondary" size="tiny" />
                </div>
              ),
              inner: <SignatureTable data={body.signatures} printable={printable} filterValue={filterValue} />
            }
          })
        }}
      />
    </>
  );
});
