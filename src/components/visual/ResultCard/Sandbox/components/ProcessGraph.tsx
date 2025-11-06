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
import type { SandboxBody as SandboxData, SandboxProcessItem } from 'components/models/base/result_body';
import { CustomChip } from 'components/visual/CustomChip';
import type { ProcessItem, SandboxFilter } from 'components/visual/ResultCard/Sandbox/sandbox.utils';
import {
  buildProcessTree,
  getBackgroundColor,
  getDescendantPids,
  getProcessScore
} from 'components/visual/ResultCard/Sandbox/sandbox.utils';
import { humanReadableNumber } from 'helpers/utils';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* ----------------------------------------------------------------------------
 * ProcessStats
 * -------------------------------------------------------------------------- */

type ProcessStatsProps = {
  body: SandboxData;
  item: ProcessItem;
};

const ProcessStats = React.memo(({ body, item }: ProcessStatsProps) => {
  const { t } = useTranslation('sandboxResult');
  const theme = useTheme();

  const { netflowCount, signatureCount } = useMemo(() => {
    const netflowCount = body.netflows?.filter(n => n.pid === item.pid).length ?? 0;
    const signatureCount = body.signatures?.filter(s => s.pids.includes(item.pid)).length ?? 0;
    return { netflowCount, signatureCount };
  }, [body.netflows, body.signatures, item.pid]);

  const chipData = useMemo(
    () =>
      [
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
          count: item.file_count ?? 0,
          icon: <InsertDriveFileOutlinedIcon fontSize="small" />,
          tooltip: t('process_file')
        },
        {
          count: item.registry_count ?? 0,
          icon: <WidgetsOutlinedIcon fontSize="small" />,
          tooltip: t('process_registry')
        }
      ].filter(c => c.count > 0),
    [t, netflowCount, signatureCount, item.file_count, item.registry_count]
  );

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(0.5),
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingTop: theme.spacing(1),
        paddingRight: theme.spacing(0.5)
      }}
    >
      {item.integrity_level && (
        <CustomChip
          label={item.integrity_level}
          size="tiny"
          variant="outlined"
          sx={{ textTransform: 'capitalize', fontWeight: 400, mr: 0.5 }}
        />
      )}

      {chipData.map(({ count, icon, tooltip }, i) => (
        <Tooltip key={i} title={`${count} ${tooltip}`}>
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

/* ----------------------------------------------------------------------------
 * ProcessTreeItem
 * -------------------------------------------------------------------------- */

type ProcessTreeItemProps = {
  body: SandboxData;
  item: ProcessItem;
  depth?: number;
  printable?: boolean;
  activeValue: SandboxFilter;
  filterValue: SandboxFilter;
  onActiveChange?: React.Dispatch<React.SetStateAction<SandboxFilter>>;
  onFilterChange?: React.Dispatch<React.SetStateAction<SandboxFilter>>;
};

const ProcessTreeItem = React.memo(
  ({
    body,
    item,
    depth = 0,
    printable = false,
    activeValue,
    filterValue,
    onActiveChange = () => null,
    onFilterChange = () => null
  }: ProcessTreeItemProps) => {
    const theme = useTheme();
    const { configuration, scoreToVerdict } = useALContext();

    const hasChildren = item.children?.length > 0;
    const isActive = activeValue?.pid === item.pid;
    const indent = theme.spacing((depth + 1) * 3);

    const processScore = useMemo(
      () => (!item.safelisted ? (getProcessScore(item, body.signatures) ?? undefined) : undefined),
      [item, body.signatures]
    );

    const descendantMaxScore = useMemo(() => {
      if (!item.pid) return processScore;
      const descendantPids = getDescendantPids(item, body.processes);
      const scores = body.processes
        .filter(p => descendantPids.includes(p.pid) && !p.safelisted)
        .map(p => getProcessScore(p, body.signatures))
        .filter((s): s is number => typeof s === 'number');
      return scores.length ? Math.max(...scores) : processScore;
    }, [item, processScore, body.processes, body.signatures]);

    const [open, setOpen] = useState<boolean>(
      descendantMaxScore !== undefined && descendantMaxScore >= configuration.submission.verdicts.suspicious
    );

    const handleToggle = useCallback(() => setOpen(o => !o), []);

    const handleClick = useCallback(
      (row: SandboxProcessItem) => onActiveChange(prev => (prev?.pid === row.pid ? undefined : structuredClone(row))),
      [onActiveChange]
    );

    return (
      <>
        <ListItem
          dense
          disableGutters
          disablePadding
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center',
            py: 0.5,
            pr: 0
          }}
        >
          {hasChildren ? (
            <Button
              color="inherit"
              size="small"
              onClick={handleToggle}
              sx={{
                height: '100%',
                padding: 0,
                minWidth: indent,
                justifyContent: 'flex-end'
              }}
            >
              <ChevronRightIcon
                fontSize="small"
                sx={{
                  transition: theme.transitions.create('transform', {
                    duration: theme.transitions.duration.shortest
                  }),
                  transform: open ? 'rotate(90deg)' : 'rotate(0deg)'
                }}
              />
            </Button>
          ) : (
            <div style={{ width: indent }} />
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
                ...(isActive && {
                  backgroundColor: alpha(
                    theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
                    theme.palette.action.activatedOpacity
                  )
                })
              }}
              onClick={() => handleClick(item)}
            >
              <Typography
                variant="body2"
                sx={{
                  backgroundColor: getBackgroundColor(theme, scoreToVerdict, processScore, 0.25),
                  minWidth: theme.spacing(5),
                  py: 1,
                  textAlign: 'center',
                  fontFamily: 'monospace'
                }}
              >
                {item.pid}
              </Typography>

              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  marginLeft: theme.spacing(1),
                  padding: `${theme.spacing(1)} 0`
                }}
              >
                <Typography component="div" fontWeight={500} variant="body2">
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
          <Collapse in={open} timeout={theme.transitions.duration.shortest}>
            <List disablePadding>
              {item.children.map(child => (
                <ProcessTreeItem
                  key={child.pid}
                  body={body}
                  item={child}
                  depth={depth + 1}
                  printable={printable}
                  activeValue={activeValue}
                  filterValue={filterValue}
                  onActiveChange={onActiveChange}
                  onFilterChange={onFilterChange}
                />
              ))}
            </List>
          </Collapse>
        )}
      </>
    );
  }
);

/* ----------------------------------------------------------------------------
 * ProcessGraph
 * -------------------------------------------------------------------------- */

type ProcessGraphProps = {
  body: SandboxData;
  printable?: boolean;
  force?: boolean;
  activeValue?: SandboxFilter;
  filterValue?: SandboxFilter;
  onActiveChange?: React.Dispatch<React.SetStateAction<SandboxFilter>>;
  onFilterChange?: React.Dispatch<React.SetStateAction<SandboxFilter>>;
};

export const ProcessGraph = React.memo(
  ({
    body,
    printable = false,
    activeValue,
    filterValue,
    onActiveChange = () => null,
    onFilterChange = () => null
  }: ProcessGraphProps) => {
    const processTree = useMemo(() => buildProcessTree(body?.processes ?? []), [body.processes]);

    return (
      <div style={{ overflowX: 'auto', maxHeight: printable ? 'auto' : 750 }}>
        <List disablePadding dense>
          {processTree.map(item => (
            <ProcessTreeItem
              key={item.pid}
              body={body}
              item={item}
              activeValue={activeValue}
              filterValue={filterValue}
              onActiveChange={onActiveChange}
              onFilterChange={onFilterChange}
            />
          ))}
        </List>
      </div>
    );
  }
);
