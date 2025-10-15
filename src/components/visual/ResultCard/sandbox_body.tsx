import { TextField, useTheme } from '@mui/material';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
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
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/***
 * Process Graph
 */
type ProcessItem = Process & {
  children?: ProcessItem[];
};

type ProcessLeafProps = {
  item: ProcessItem;
  depth?: number;
};

const ProcessLeaf = ({ item, depth = 0 }: ProcessLeafProps) => {
  const theme = useTheme();

  return (
    <>
      <div style={{ marginLeft: `calc(${depth} * ${theme.spacing(5)})` }}>{item.pid}</div>
      {item.children.map(child => (
        <ProcessLeaf key={child.pid} item={child} depth={depth + 1} />
      ))}
    </>
  );
};

type ProcessGraphProps = {
  body: SandboxData;
  printable?: boolean;
};

const ProcessGraph = React.memo(({ body, printable = false }: ProcessGraphProps) => {
  const buildProcessTree = useCallback((processes: ProcessItem[]): ProcessItem[] => {
    const map = new Map<number, ProcessItem>();

    // First, index all processes by PID
    for (const proc of processes) {
      map.set(proc.pid, { ...proc, children: [] });
    }

    const roots: ProcessItem[] = [];

    // Then connect each process to its parent
    for (const proc of map.values()) {
      if (proc.ppid === 0 || !map.has(proc.ppid)) {
        roots.push(proc);
      } else {
        map.get(proc.ppid).children.push(proc);
      }
    }

    return roots;
  }, []);

  const processTree = useMemo<ProcessItem[]>(
    () =>
      !body
        ? null
        : buildProcessTree(
            body.process.sort((a, b) => a.pid - b.pid).sort((a, b) => a.start_time.localeCompare(b.start_time))
          ),
    [body, buildProcessTree]
  );

  return processTree.map(item => <ProcessLeaf key={item.pid} item={item} />);
});

/***
 * Process Table
 */
type ProcessTableProps = {
  data?: Process[];
  printable?: boolean;
  startTime?: number;
};

const ProcessTable = React.memo(({ data = [], printable = false, startTime }: ProcessTableProps) => {
  const { t } = useTranslation('resultCard');
  const theme = useTheme();
  const columnHelper = createColumnHelper<Process>();

  const columns = useMemo<ColumnDef<Process>[]>(
    () => [
      columnHelper.accessor('start_time', {
        header: () => t('timeshift'),
        cell: info => {
          const cur = info.getValue();
          if (!startTime) return '-';
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
        meta: { cellSx: {} }
      }),
      columnHelper.accessor('command_line', {
        header: () => t('command_line'),
        cell: info => info.getValue() ?? info.row.original.image,
        meta: { cellSx: { color: theme.palette.text.secondary } }
      }),
      columnHelper.accessor('ppid', {
        header: () => t('ppid'),
        cell: info => info.getValue() ?? '-',
        meta: {
          cellSx: {
            wordBreak: 'inherit !important'
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

  console.log(data);

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
};

const SignatureTable = React.memo(({ data = [], printable = false, force }: SignatureTableProps) => {
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

  const [value, setValue] = useState<string>('');

  const startTime = useMemo<number>(
    () => (!body ? null : new Date(body.sandbox?.[0].analysis_metadata.start_time).getTime()),
    [body]
  );

  // console.log(processTree.map(p => p.children));

  return !body ? null : (
    <>
      <TextField value={value} fullWidth size="small" />

      <ProcessGraph body={body} />

      <TabContainer
        paper
        selectionFollowsFocus
        tabs={{
          process: {
            label: (
              <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
                {t('sandbox_body.tab.process')}
                <CustomChip label={body.process.length} color="secondary" size="tiny" />
              </div>
            ),
            inner: <ProcessTable data={body.process} startTime={startTime} printable={printable} />
          },
          netflow: {
            label: (
              <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
                {t('sandbox_body.tab.netflow')}
                <CustomChip label={body.netflow.length} color="secondary" size="tiny" />
              </div>
            ),
            inner: <NetflowTable data={body.netflow} startTime={startTime} printable={printable} />
          },
          heuristics: {
            label: (
              <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
                {t('sandbox_body.tab.heuristics')}
                <CustomChip label={body.heuristics.length} color="secondary" size="tiny" />
              </div>
            ),
            inner: <HeuristicsTable data={body.heuristics} printable={printable} />
          },
          signature: {
            label: (
              <div style={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(1) }}>
                {t('sandbox_body.tab.signature')}
                <CustomChip label={body.signature.length} color="secondary" size="tiny" />
              </div>
            ),
            inner: <SignatureTable data={body.signature} printable={printable} />
          }
        }}
      />
    </>
  );
});
