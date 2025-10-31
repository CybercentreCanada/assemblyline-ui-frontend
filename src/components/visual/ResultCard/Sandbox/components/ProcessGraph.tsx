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
import type { SandboxBody as SandboxData, SandboxProcessItem } from 'components/models/base/result_body';
import { CustomChip } from 'components/visual/CustomChip';
import type { ProcessItem } from 'components/visual/ResultCard/Sandbox/sandbox.utils';
import {
  buildProcessTree,
  getBackgroundColor,
  getDescendantPids,
  getProcessHeuristicScore,
  INTEGRITY_LEVEL_COLOR_MAP
} from 'components/visual/ResultCard/Sandbox/sandbox.utils';
import { humanReadableNumber } from 'helpers/utils';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ProcessStatsProps = {
  body: SandboxData;
  item: ProcessItem;
};
const ProcessStats = React.memo(({ body, item }: ProcessStatsProps) => {
  const { t } = useTranslation('sandboxResult');
  const theme = useTheme();

  const { netflowCount, signatureCount } = useMemo(() => {
    let netflowCount = 0;
    let signatureCount = 0;

    for (const n of body.netflows ?? []) if (n.pid === item.pid) netflowCount++;
    for (const s of body.signatures ?? []) if (s.pids.includes(item.pid)) signatureCount++;

    return { netflowCount, signatureCount };
  }, [body.netflows, body.signatures, item.pid]);

  const fileCount = item.file_count ?? 0;
  const registryCount = item.registry_count ?? 0;

  const chips = [
    {
      count: netflowCount,
      icon: <SettingsEthernetOutlinedIcon fontSize="small" />,
      tooltip: t('process_network')
    },
    {
      count: signatureCount,
      icon: <FingerprintOutlinedIcon fontSize="small" />,
      tooltip: t('process_signatures')
    },
    {
      count: fileCount,
      icon: <InsertDriveFileOutlinedIcon fontSize="small" />,
      tooltip: t('process_file')
    },
    {
      count: registryCount,
      icon: <WidgetsOutlinedIcon fontSize="small" />,
      tooltip: t('process_registry')
    }
  ].filter(({ count }) => count > 0);

  return (
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
        color={INTEGRITY_LEVEL_COLOR_MAP[item.integrity_level] ?? undefined}
        variant="outlined"
        sx={{ textTransform: 'capitalize', fontWeight: 'normal' }}
      />

      {chips.map(({ count, icon, tooltip }, idx) => (
        <Tooltip key={idx} title={`${count} ${tooltip}`}>
          <CustomChip
            label={humanReadableNumber(count)}
            icon={icon}
            size="tiny"
            variant="outlined"
            type="rounded"
            sx={{ columnGap: 0.5 }}
          />
        </Tooltip>
      ))}
    </div>
  );
});

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

    const hasChildren = useMemo<boolean>(() => !!item.children?.length, [item.children?.length]);

    const handleToggle = useCallback(() => setOpen(o => !o), []);

    const processScore = useMemo<number | undefined>(() => {
      if (item.safelisted) return undefined;
      return getProcessHeuristicScore(item, body.signatures, body.heuristics) ?? undefined;
    }, [item, body.signatures, body.heuristics]);

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
    }, [item, processScore, body.processes, body.signatures, body.heuristics]);

    return (
      <>
        <ListItem
          dense
          disableGutters
          disablePadding
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
                padding: 'inherit',
                ...(filterValue &&
                  item.pid === filterValue?.pid && { backgroundColor: alpha(theme.palette.primary.dark, 0.25) })
              }}
              onClick={e => onClick(e, item)}
            >
              <div
                style={{
                  minWidth: theme.spacing(0.5),
                  backgroundColor: getBackgroundColor(theme, scoreToVerdict, highestScore, 1)
                }}
              />

              <div
                style={{
                  backgroundColor: getBackgroundColor(theme, scoreToVerdict, processScore, 0.25),
                  minWidth: theme.spacing(5)
                }}
              >
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
              </div>

              <ProcessStats body={body} item={item} />
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
    const processTree = useMemo<ProcessItem[]>(() => (processes ? buildProcessTree(processes) : []), [processes]);

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
