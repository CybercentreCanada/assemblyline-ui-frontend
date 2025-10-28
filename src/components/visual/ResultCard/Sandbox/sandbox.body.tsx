import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import SettingsEthernetOutlinedIcon from '@mui/icons-material/SettingsEthernetOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import {
  alpha,
  Button,
  Card,
  CardContent,
  Collapse,
  List,
  ListItem,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
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
import { TableContainer } from 'components/visual/ResultCard/Sandbox/components/TableContainer';
import { KVBody } from 'components/visual/ResultCard/kv_body';
import { TabContainer } from 'components/visual/TabContainer';
import TitleKey from 'components/visual/TitleKey';
import Verdict from 'components/visual/Verdict';
import type { PossibleColor } from 'helpers/colors';
import { humanReadableNumber } from 'helpers/utils';
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
          <TitleKey title={label || ''} />
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
    const { t } = useTranslation('sandboxResult');
    const theme = useTheme();
    const { showSafeResults } = useSafeResults();
    const { scoreToVerdict } = useALContext();

    const [open, setOpen] = useState<boolean>(false);
    const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

    const hasChildren = useMemo<boolean>(() => !!item.children?.length, [item.children?.length]);

    const integrityLevelColorMap = useMemo<Record<string, PossibleColor>>(
      () => ({
        system: 'primary',
        high: 'success',
        medium: 'warning',
        low: 'error'
      }),
      []
    );

    const handleToggle = useCallback(() => setOpen(o => !o), []);

    const rows = useMemo(
      () => [
        {
          label: 'Signature count',
          icon: <FingerprintOutlinedIcon style={{ fontSize: 'large' }} />,
          count: body.signatures?.filter(v => v.pid === item.pid)?.length || 0,
          tooltip: `${body.signatures?.filter(v => v.pid === item.pid)?.length || 0} ${t('process_signatures')}`
        },
        {
          label: 'Network flow count',
          icon: <SettingsEthernetOutlinedIcon style={{ fontSize: 'large' }} />,
          count: body.netflows?.filter(v => v.pid === item.pid)?.length || 0,
          tooltip: `${body.netflows?.filter(v => v.pid === item.pid)?.length || 0} ${t('process_network')}`
        },
        {
          label: 'File count',
          icon: <InsertDriveFileOutlinedIcon style={{ fontSize: 'large' }} />,
          count: item.file_count || 0,
          tooltip: `${item.file_count} ${t('process_file')}`
        },
        {
          label: 'Registry count',
          icon: <WidgetsOutlinedIcon style={{ fontSize: 'large' }} />,
          count: item.registry_count || 0,
          tooltip: `${item.registry_count} ${t('process_registry')}`
        }
      ],
      [body.netflows, body.signatures, item.file_count, item.pid, item.registry_count, t]
    );

    const getProcessHeuristicScore = useCallback(
      (
        process: ProcessItem,
        signatures: SandboxSignatureItem[],
        heuristics: SandboxHeuristicItem[] = []
      ): number | null => {
        if (!process.pid) return null;
        if (process.safelisted) return 0;

        const matching = signatures.filter(sig => sig.pid === process.pid && sig.heuristic);
        if (matching.length === 0) return null;

        let maxScore = -Infinity;

        for (const sig of matching) {
          const heur = heuristics.find(h => h.heur_id === sig.heuristic);
          if (heur && heur.score > maxScore) maxScore = heur.score;
        }

        return maxScore === -Infinity ? null : maxScore;
      },
      []
    );

    const getDescendantPids = useCallback((rootProcess: ProcessItem, processes: SandboxProcessItem[]): number[] => {
      if (!rootProcess.pid) return [];

      const stack = [rootProcess.pid];
      const descendants: number[] = [];

      while (stack.length) {
        const parentPid = stack.pop();
        const children = processes.filter(p => p.ppid === parentPid);
        for (const child of children) {
          descendants.push(child.pid);
          stack.push(child.pid);
        }
      }

      return descendants;
    }, []);

    const processScore = useMemo<number | undefined>(() => {
      if (item.safelisted) return undefined;
      return getProcessHeuristicScore(item, body.signatures, body.heuristics) ?? undefined;
    }, [item, body.signatures, body.heuristics, getProcessHeuristicScore]);

    const highestScore = useMemo<number | undefined>(() => {
      if (!item.pid) return processScore;

      const descendantPids = getDescendantPids(item, body.processes);
      const relevantProcesses = body.processes.filter(p => p.pid === item.pid || descendantPids.includes(p.pid));

      let maxScore = -Infinity;

      for (const proc of relevantProcesses) {
        if (proc.safelisted) continue;
        const score = getProcessHeuristicScore(proc, body.signatures, body.heuristics);
        if (typeof score === 'number' && score > maxScore) {
          maxScore = score;
        }
      }

      return maxScore === -Infinity ? undefined : maxScore;
    }, [
      item,
      processScore,
      getDescendantPids,
      body.processes,
      body.signatures,
      body.heuristics,
      getProcessHeuristicScore
    ]);

    const getBackgroundColor = useCallback(
      (score: number | undefined, opacity: number) => {
        if (score === undefined) {
          return alpha(theme.palette.success[theme.palette.mode === 'dark' ? 'dark' : 'light'], opacity);
        }

        const verdict = scoreToVerdict(score);
        const colorMap: Record<string, string | null> = {
          malicious: theme.palette.error[theme.palette.mode === 'dark' ? 'dark' : 'light'],
          highly_suspicious: theme.palette.warning[theme.palette.mode === 'dark' ? 'dark' : 'light'],
          suspicious: theme.palette.warning[theme.palette.mode === 'dark' ? 'dark' : 'light'],
          info: theme.palette.grey[800],
          safe: theme.palette.success[theme.palette.mode === 'dark' ? 'dark' : 'light']
        };

        const baseColor = colorMap[verdict] ?? null;
        return baseColor ? alpha(baseColor, opacity) : null;
      },
      [
        scoreToVerdict,
        theme.palette.error,
        theme.palette.grey,
        theme.palette.mode,
        theme.palette.success,
        theme.palette.warning
      ]
    );

    return (
      <>
        <ListItem
          sx={{
            // pl: depth * 3,
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
                minWidth: theme.spacing((depth + 1) * 3),
                justifyContent: 'flex-end'
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
            <div style={{ width: theme.spacing((depth + 1) * 3) }} />
          )}

          <Card>
            <CardContent
              component={Button}
              color="inherit"
              style={{
                textTransform: 'none',
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                padding: 'inherit'
              }}
              onClick={() => setDetailsOpen(o => !o)}
            >
              <div style={{ minWidth: theme.spacing(0.5), backgroundColor: getBackgroundColor(highestScore, 1) }} />

              <div style={{ backgroundColor: getBackgroundColor(processScore, 0.25), minWidth: theme.spacing(5) }}>
                {item.pid}
              </div>

              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginLeft: theme.spacing(1)
                }}
              >
                <Typography component="div" variant="body2">
                  {item.image?.split(/[/\\]/).pop() ?? ''}
                </Typography>
                <Typography
                  component="div"
                  color="textSecondary"
                  fontFamily="monospace"
                  variant="body2"
                  textAlign="start"
                >
                  {item.command_line}
                </Typography>

                <Collapse
                  in={detailsOpen}
                  timeout={theme.transitions.duration.shortest}
                  easing={theme.transitions.easing.sharp}
                >
                  Details
                </Collapse>
              </div>

              <div
                style={{
                  alignSelf: 'flex-start',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  columnGap: theme.spacing(0.5),
                  paddingTop: theme.spacing(0.5),
                  paddingRight: theme.spacing(0.5)
                }}
              >
                <CustomChip
                  label={item.integrity_level}
                  size="tiny"
                  color={integrityLevelColorMap[item.integrity_level] ?? undefined}
                  variant="outlined"
                  sx={{ textTransform: 'capitalize', fontWeight: 'normal' }}
                />
                {rows
                  .filter(row => row.count > 0)
                  .map((row, idx) => (
                    <Tooltip key={idx} title={row.tooltip}>
                      <CustomChip
                        label={humanReadableNumber(row.count)}
                        icon={row.icon}
                        size="tiny"
                        variant="outlined"
                        type="rounded"
                        sx={{ columnGap: theme.spacing(0.5) }}
                      />
                    </Tooltip>
                  ))}
              </div>
            </CardContent>
          </Card>
        </ListItem>

        {hasChildren && (
          <Collapse in={open} timeout={theme.transitions.duration.shortest} easing={theme.transitions.easing.sharp}>
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
    const { t } = useTranslation('sandboxResult');
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
                sx={{ textTransform: 'capitalize', fontWeight: 'normal' }}
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
  const { t } = useTranslation('sandboxResult');
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
type FlatSignatures = SandboxSignatureItem & { flatAttacks?: Record<string, string[]> };

type SignatureTableProps = {
  data?: SandboxSignatureItem[];
  heuristics?: SandboxHeuristicItem[];
  printable?: boolean;
  force?: boolean;
  filterValue?: SandboxProcessItem;
};

const SignatureTable = React.memo(
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

export type SandboxBodyProps = {
  body: SandboxData;
  force?: boolean;
  printable?: boolean;
};

export const SandboxBody = React.memo(({ body, force = false, printable = false }: SandboxBodyProps) => {
  const theme = useTheme();
  const { t } = useTranslation('sandboxResult');

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
              inner: (
                <SignatureTable
                  data={body.signatures}
                  heuristics={body.heuristics}
                  printable={printable}
                  filterValue={filterValue}
                />
              )
            }
          })
        }}
      />
    </>
  );
});
