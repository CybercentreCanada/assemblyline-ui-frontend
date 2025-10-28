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
import useALContext from 'components/hooks/useALContext';
import useSafeResults from 'components/hooks/useSafeResults';
import type {
  SandboxBody as SandboxData,
  SandboxHeuristicItem,
  SandboxProcessItem,
  SandboxSignatureItem
} from 'components/models/base/result_body';
import { CustomChip } from 'components/visual/CustomChip';
import type { PossibleColor } from 'helpers/colors';
import { humanReadableNumber } from 'helpers/utils';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type ProcessItem = SandboxProcessItem & {
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

export const ProcessGraph = React.memo(
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
