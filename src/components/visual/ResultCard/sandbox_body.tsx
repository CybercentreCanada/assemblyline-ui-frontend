import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import SettingsEthernetOutlinedIcon from '@mui/icons-material/SettingsEthernetOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import type { SvgIconProps } from '@mui/material';
import { alpha, Collapse, IconButton, List, ListItem, styled, Tooltip, useTheme } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import useALContext from 'components/hooks/useALContext';
import useSafeResults from 'components/hooks/useSafeResults';
import type { SandboxBody as SandboxData } from 'components/models/base/result_body';
import type { Heuristics } from 'components/models/ontology/ontology';
import type { NetworkConnection } from 'components/models/ontology/results/network';
import type { Process } from 'components/models/ontology/results/process';
import type { Signature } from 'components/models/ontology/results/signature';
import AutoHideTagList from 'components/visual/AutoHideTagList';
import Classification from 'components/visual/Classification';
import { CustomChip } from 'components/visual/CustomChip';
import { TableContainer } from 'components/visual/ResultCard/components/TableContainer';
import { TabContainer } from 'components/visual/TabContainer';
import Verdict from 'components/visual/Verdict';
import { humanReadableNumber } from 'helpers/utils';
import type { FC } from 'react';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/***
 * Process Graph
 */
const CounterItem = memo(
  styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(0.25),
    width: '100%',
    alignItems: 'center'
  }))
);

type CounterImgProps = SvgIconProps & {
  component: FC<SvgIconProps>;
};

const CounterImg = memo(
  styled(({ component: Component, ...props }: CounterImgProps) => <Component {...props} />)(({ theme }) => ({
    height: theme.spacing(2.25)
  }))
);

type ProcessItem = Process & {
  children?: ProcessItem[];
};

type ProcessTreeItemProps = {
  body: SandboxData;
  item: ProcessItem;
  depth?: number;
  printable?: boolean;
  filterValue: Process;
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: ProcessItem) => void;
};

const ProcessTreeItem = React.memo(
  ({ body, item, depth = 0, printable = false, filterValue, onClick = () => null }: ProcessTreeItemProps) => {
    const theme = useTheme();
    const { showSafeResults } = useSafeResults();
    const { scoreToVerdict } = useALContext();

    const [open, setOpen] = useState<boolean>(false);

    const hasChildren = useMemo<boolean>(() => !!item.children?.length, [item.children?.length]);

    const networks = useMemo<NetworkConnection[]>(
      () => body?.netflow?.filter(x => x?.objectid?.guid === item?.pobjectid?.guid) ?? [],
      [body.netflow, item?.pobjectid?.guid]
    );

    const signatures = useMemo<Signature[]>(
      () => body?.signature?.filter(x => x?.attributes?.some(a => a?.source?.guid === item?.objectid?.guid)) ?? [],
      [body?.signature, item?.objectid?.guid]
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

      if (filterValue?.objectid?.guid === item?.objectid?.guid) {
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
      filterValue?.objectid?.guid,
      item?.objectid?.guid,
      item.integrity_level,
      signatures,
      scoreToVerdict
    ]);

    const handleToggle = useCallback(() => setOpen(o => !o), []);

    return (
      <>
        <ListItem
          sx={{
            pl: depth * 2,
            py: 0.3,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {hasChildren ? (
            <IconButton
              size="small"
              onClick={handleToggle}
              sx={{
                transition: `transform ${theme.transitions.duration.shortest}ms ${theme.transitions.easing.sharp}`,
                transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                mt: '4px'
              }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          ) : (
            <div style={{ width: theme.spacing(4) }} />
          )}

          {/* === Custom Label Container === */}
          <div
            style={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
              margin: '0.2em 0',
              display: 'flex',
              // maxWidth: '50rem',
              minWidth: '30rem',
              width: '100%',
              backgroundColor: backgroundStyle.backgroundColor,
              transition: `background-color ${theme.transitions.duration.shortest}ms ${theme.transitions.easing.sharp}`
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = backgroundStyle.hover)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = backgroundStyle.backgroundColor)}
            onClick={e => onClick(e, item)}
          >
            {/* Left PID column */}
            <div
              style={{
                padding: 5,
                backgroundColor: theme.palette.mode === 'dark' ? '#FFFFFF10' : '#00000010',
                borderRadius: '4px 0 0 4px',
                minWidth: 50,
                textAlign: 'center'
              }}
            >
              {item.pid}
            </div>

            {/* Middle section: process name + command line */}
            <div style={{ padding: 5, flexGrow: 1, wordBreak: 'break-word' }}>
              <div style={{ paddingBottom: 4 }}>
                <b>{item.image?.split(/[/\\]/).pop() ?? ''}</b>
              </div>
              {item.command_line && (
                <samp>
                  <small>{item.image ?? item.command_line}</small>
                </samp>
              )}
            </div>

            {/* Right side counters */}
            {hasValues ? (
              <div
                style={{
                  backgroundColor: theme.palette.mode === 'dark' ? '#FFFFFF10' : '#00000010',
                  color: theme.palette.text.secondary,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  padding: '5px 8px',
                  fontSize: '90%',
                  gap: 4,
                  minWidth: theme.spacing(6)
                }}
              >
                {signatures && Object.keys(signatures).length > 0 && (
                  <Tooltip
                    placement="left"
                    title={`${Object.keys(signatures).length} signatures (${signatures.map(x => x.name).join(' | ')})`}
                  >
                    <CounterItem>
                      <CounterImg component={FingerprintOutlinedIcon} />
                      <span>{humanReadableNumber(Object.keys(signatures).length)}</span>
                    </CounterItem>
                  </Tooltip>
                )}
                {networkCount ? (
                  <Tooltip placement="left" title={`${networkCount} network events`}>
                    <CounterItem>
                      <CounterImg component={SettingsEthernetOutlinedIcon} />
                      <span>{humanReadableNumber(networkCount)}</span>
                    </CounterItem>
                  </Tooltip>
                ) : null}
                {fileCount ? (
                  <Tooltip placement="left" title={`${fileCount} file operations`}>
                    <CounterItem>
                      <CounterImg component={InsertDriveFileOutlinedIcon} />
                      <span>{humanReadableNumber(fileCount)}</span>
                    </CounterItem>
                  </Tooltip>
                ) : null}
                {registryCount ? (
                  <Tooltip placement="left" title={`${registryCount} registry changes`}>
                    <CounterItem>
                      <CounterImg component={WidgetsOutlinedIcon} />
                      <span>{humanReadableNumber(registryCount)}</span>
                    </CounterItem>
                  </Tooltip>
                ) : null}
              </div>
            ) : null}
          </div>
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
  processes: Process[];
  printable?: boolean;
  force?: boolean;
  filterValue: Process;
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: ProcessItem) => void;
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
      <div
        style={{
          overflowX: 'auto',
          maxHeight: printable ? 'auto' : 750,
          borderRadius: theme.spacing(1),
          padding: theme.spacing(1)
        }}
      >
        <List disablePadding>
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
  data?: Process[];
  printable?: boolean;
  startTime?: number;
  filterValue?: Process;
};

const ProcessTable = React.memo(({ data = [], printable = false, startTime, filterValue }: ProcessTableProps) => {
  const { t } = useTranslation('resultCard');
  const theme = useTheme();
  const columnHelper = createColumnHelper<Process>();

  const columns = useMemo<ColumnDef<Process>[]>(
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
        meta: { cellSx: { wordBreak: 'inherit !important', color: theme.palette.text.secondary } }
      }),
      columnHelper.accessor('integrity_level', {
        header: () => t('integrity_level'),
        cell: info => info.getValue() ?? '-',
        meta: {
          cellSx: {
            wordBreak: 'inherit !important',
            color: theme.palette.text.secondary
          }
        }
      }),
      columnHelper.accessor('original_file_name', {
        header: () => t('original_file_name'),
        cell: info => info.getValue() ?? '-',
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
});

/***
 * Netflow Table
 */
type NetflowTableProps = {
  data?: NetworkConnection[];
  printable?: boolean;
  startTime?: number;
};

const NetflowTable = React.memo(({ data = [], printable = false, startTime }: NetflowTableProps) => {
  const { t } = useTranslation('resultCard');
  const theme = useTheme();
  const columnHelper = createColumnHelper<NetworkConnection>();

  const columns = useMemo<ColumnDef<NetworkConnection>[]>(
    () => [
      columnHelper.accessor(row => row.objectid?.time_observed, {
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
      columnHelper.accessor('connection_type', {
        header: () => t('type'),
        cell: info => info.getValue()?.toUpperCase() ?? '',
        meta: { cellSx: { textTransform: 'uppercase' } }
      }),
      columnHelper.accessor('transport_layer_protocol', {
        header: () => t('protocol'),
        cell: info => info.getValue()?.toUpperCase() ?? '',
        meta: { cellSx: { textTransform: 'uppercase' } }
      }),
      columnHelper.accessor(row => row.dns_details?.domain, {
        id: 'domain',
        header: () => t('sandbox_body.netflow.domain'),
        cell: info => info.getValue() ?? '',
        meta: { cellSx: {} }
      }),
      columnHelper.accessor(row => row.dns_details?.lookup_type, {
        id: 'lookup_type',
        header: () => t('sandbox_body.netflow.lookup_type'),
        cell: info => info.getValue() ?? '',
        meta: { cellSx: {} }
      }),

      columnHelper.group({
        id: 'source',
        header: () => t('source'),
        columns: [
          columnHelper.accessor('source_ip', {
            header: () => t('ip'),
            meta: { cellSx: {} }
          }),
          columnHelper.accessor('source_port', {
            header: () => t('port'),
            meta: { cellSx: {} }
          })
        ]
      }),
      columnHelper.group({
        id: 'destination',
        header: () => t('destination'),
        columns: [
          columnHelper.accessor('destination_ip', {
            header: () => t('ip'),
            meta: { cellSx: {} }
          }),
          columnHelper.accessor('destination_port', {
            header: () => t('port'),
            meta: { cellSx: {} }
          })
        ]
      }),

      columnHelper.accessor(row => row.process?.pid, {
        id: 'pid',
        header: () => t('pid'),
        cell: info => info.getValue() ?? '',
        meta: { cellSx: { color: theme.palette.text.secondary } }
      }),
      columnHelper.accessor(row => row.process?.image, {
        id: 'process_name',
        header: () => t('process_name'),
        cell: info => info.getValue()?.split(/[/\\]/).pop() ?? '',
        meta: { cellSx: {} }
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
type FlatHeuristics = Heuristics & { tagKey?: string; tagValues?: string[] };

type HeuristicsTableProps = {
  data?: Heuristics[];
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
      initialSorting={[{ id: 'heur_id', desc: false }]}
      printable={printable}
      rowSpanning={['heur_id', 'name', 'score']}
    />
  );
});

/***
 * Signature Table
 */
type FlatSignatures = Signature & { attackKey?: string; attackValues?: string[] };

type SignatureTableProps = {
  data?: Signature[];
  printable?: boolean;
  force?: boolean;
  filterValue?: Process;
};

const SignatureTable = React.memo(({ data = [], printable = false, force, filterValue }: SignatureTableProps) => {
  const { t } = useTranslation('resultCard');
  const theme = useTheme();
  const columnHelper = createColumnHelper<FlatSignatures>();

  const flatData = useMemo<FlatSignatures[]>(() => {
    const n = data.length;
    if (n === 0) return [];

    const out: FlatSignatures[] = [];

    for (let i = 0; i < n; i++) {
      const sig = data[i];
      const attacks = sig.attacks;
      if (!attacks || attacks.length === 0) {
        out.push({ ...sig, attackKey: '', attackValues: [] });
        continue;
      }

      const grouped = Object.create(null) as Record<string, string[]>;

      for (let j = 0, m = attacks.length; j < m; j++) {
        const attack = attacks[j];
        const cats = attack.categories;
        if (!cats || cats.length === 0) continue;

        const pattern = attack.pattern;
        for (let k = 0, c = cats.length; k < c; k++) {
          const cat = cats[k];
          const existing = grouped[cat];
          if (existing) existing.push(pattern);
          else grouped[cat] = [pattern];
        }
      }

      const keys = Object.keys(grouped);
      const len = keys.length;

      if (len === 0) {
        out.push({ ...sig, attackKey: '', attackValues: [] });
      } else {
        for (let j = 0; j < len; j++) {
          const key = keys[j];
          const values = grouped[key];
          out.push({ ...sig, attackKey: key, attackValues: values });
        }
      }
    }

    return out;
  }, [data]);

  const columns = useMemo<ColumnDef<Signature>[]>(
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
      onFilter={(row, value) => row?.attributes?.some(a => a?.source?.guid === filterValue?.objectid?.guid)}
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

  const [filterValue, setFilterValue] = useState<Process>(null);

  const startTime = useMemo<number>(
    () => (!body ? null : new Date(body.sandbox?.[0].analysis_metadata.start_time).getTime()),
    [body]
  );

  const processes = useMemo<Process[]>(() => {
    const list = body?.process ?? [];
    if (list.length === 0) return [];

    const seen = new Set<number>();
    const result: Process[] = [];

    for (const proc of list) {
      if (proc.pid != null && seen.has(proc.pid)) continue;
      if (proc.pid != null) seen.add(proc.pid);

      result.push(proc);
      if (proc.pobjectid && proc.ppid != null && !seen.has(proc.ppid)) {
        seen.add(proc.ppid);
        result.push({
          ...proc,
          objectid: proc.pobjectid,
          pid: proc.ppid,
          ppid: null,
          pobjectid: null,
          image: proc.pimage ?? null,
          command_line: proc.pcommand_line ?? '',
          pimage: null,
          pcommand_line: null,
          start_time: proc.start_time,
          end_time: proc.end_time,
          integrity_level: null
        });
      }
    }

    return result.sort((a, b) => a.pid - b.pid).sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [body]);

  console.log(body);

  const handleProcessGraphClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>, item: ProcessItem) =>
      setFilterValue(prev => (prev && prev.objectid.guid === item.objectid.guid ? null : item)),
    []
  );

  return !body ? null : (
    <>
      <ProcessGraph body={body} processes={processes} filterValue={filterValue} onClick={handleProcessGraphClick} />

      <TabContainer
        paper
        selectionFollowsFocus
        tabs={{
          ...(processes?.length && {
            process: {
              label: (
                <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
                  {t('sandbox_body.tab.process')}
                  <CustomChip label={processes?.length} color="secondary" size="tiny" />
                </div>
              ),
              inner: (
                <ProcessTable data={processes} startTime={startTime} printable={printable} filterValue={filterValue} />
              )
            }
          }),
          ...(body?.netflow?.length && {
            netflow: {
              label: (
                <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
                  {t('sandbox_body.tab.netflow')}
                  <CustomChip label={body?.netflow?.length} color="secondary" size="tiny" />
                </div>
              ),
              inner: <NetflowTable data={body?.netflow} startTime={startTime} printable={printable} />
            }
          }),
          ...(body?.heuristics?.length && {
            heuristics: {
              label: (
                <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
                  {t('sandbox_body.tab.heuristics')}
                  <CustomChip label={body?.heuristics?.length} color="secondary" size="tiny" />
                </div>
              ),
              inner: <HeuristicsTable data={body?.heuristics} printable={printable} />
            }
          }),
          ...(body?.signature?.length && {
            signature: {
              label: (
                <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
                  {t('sandbox_body.tab.signature')}
                  <CustomChip label={body?.signature?.length} color="secondary" size="tiny" />
                </div>
              ),
              inner: <SignatureTable data={body?.signature} printable={printable} filterValue={filterValue} />
            }
          })
        }}
      />
    </>
  );
});
