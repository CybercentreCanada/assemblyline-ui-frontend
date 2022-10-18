import { makeStyles, Theme, Tooltip } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FingerprintOutlinedIcon from '@material-ui/icons/FingerprintOutlined';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import SettingsEthernetOutlinedIcon from '@material-ui/icons/SettingsEthernetOutlined';
import WidgetsOutlinedIcon from '@material-ui/icons/WidgetsOutlined';
import { TreeItem, TreeView } from '@material-ui/lab';
import clsx from 'clsx';
import useALContext from 'components/hooks/useALContext';
import useSafeResults from 'components/hooks/useSafeResults';
import { humanReadableNumber } from 'helpers/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useTreeItemStyles = makeStyles((theme: Theme) => ({
  root: {
    '&:hover > .MuiTreeItem-content': {
      backgroundColor: 'transparent'
    },
    '&:focus > .MuiTreeItem-content, &$root.Mui-selected > .MuiTreeItem-content': {
      backgroundColor: 'transparent'
    },
    '&:focus > .MuiTreeItem-content .MuiTreeItem-label, &:hover > .MuiTreeItem-content .MuiTreeItem-label, &$root.Mui-selected > .MuiTreeItem-content .MuiTreeItem-label':
      {
        backgroundColor: 'transparent'
      }
  },
  treeItem: {
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '#FFFFFF10' : '#00000010'
    },
    '@media print': {
      border: '1px solid #DDD'
    },
    [theme.breakpoints.up('md')]: {
      width: '40rem'
    },
    [theme.breakpoints.up('lg')]: {
      width: '50rem'
    },
    border: `1px solid ${theme.palette.divider}`,
    margin: '0.2em 0em',
    borderRadius: '4px',
    display: 'flex',
    maxWidth: '50rem',
    minWidth: '30rem'
  },
  pid: {
    '@media print': {
      backgroundColor: '#00000010'
    },
    padding: '5px',
    backgroundColor: theme.palette.type === 'dark' ? '#FFFFFF10' : '#00000010',
    borderRadius: '4px 0px 0px 4px'
  },
  counter: {
    '@media print': {
      backgroundColor: '#00000010',
      color: 'black'
    },
    alignItems: 'flex-end',
    backgroundColor: theme.palette.type === 'dark' ? '#FFFFFF10' : '#00000010',
    color: theme.palette.text.secondary,
    display: 'flex',
    flexDirection: 'column',
    fontSize: '90%',
    minWidth: theme.spacing(6)
  },
  counter_img: {
    height: theme.spacing(2.25)
  },
  counter_item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(0.25),
    width: '100%',
    alignItems: 'center'
  },
  safe: {
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '#355e35' : '#c0efc0'
    },
    '@media print': {
      backgroundColor: '#d0ffd0'
    },
    backgroundColor: theme.palette.type === 'dark' ? '#254e25' : '#d0ffd0'
  },
  suspicious: {
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '#755322' : '#efddc4'
    },
    '@media print': {
      backgroundColor: '#ffedd4'
    },
    backgroundColor: theme.palette.type === 'dark' ? '#654312' : '#ffedd4'
  },
  malicious: {
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '#5e3535' : '#efc0c0'
    },
    '@media print': {
      backgroundColor: '#ffd0d0'
    },
    backgroundColor: theme.palette.type === 'dark' ? '#4e2525' : '#ffd0d0'
  }
}));

const ProcessTreeItem = ({ process, force = false }) => {
  const { t } = useTranslation(['fileDetail']);
  const classes = useTreeItemStyles();
  const { showSafeResults } = useSafeResults();
  const { scoreToVerdict } = useALContext();
  const classMap = {
    suspicious: classes.suspicious,
    highly_suspicious: classes.suspicious,
    malicious: classes.malicious
  };

  return process.safelisted && process.children.length === 0 && !showSafeResults && !force ? null : (
    <TreeItem
      nodeId={process.process_pid.toString()}
      classes={{
        root: classes.root
      }}
      label={
        <div
          className={clsx(
            classes.treeItem,
            process.safelisted
              ? classes.safe
              : classMap[
                  scoreToVerdict(
                    Object.keys(process.signatures).reduce(
                      (sum, key) => sum + parseFloat(process.signatures[key] || 0),
                      0
                    )
                  )
                ]
          )}
        >
          <div className={classes.pid}>{process.process_pid}</div>
          <div style={{ padding: '5px', flexGrow: 1, wordBreak: 'break-word' }}>
            <div style={{ paddingBottom: '5px' }}>
              <b>{process.process_name}</b>
            </div>
            <div>
              <samp>
                <small>{process.command_line}</small>
              </samp>
            </div>
          </div>
          {(process.signatures && Object.keys(process.signatures).length !== 0) ||
          (process.network_count && process.network_count !== 0) ||
          (process.file_count && process.file_count !== 0) ||
          (process.registry_count && process.registry_count !== 0) ? (
            <div className={classes.counter}>
              {process.signatures && Object.keys(process.signatures).length !== 0 && (
                <Tooltip
                  title={`${Object.keys(process.signatures).length} ${t('process_signatures')} (${Object.keys(
                    process.signatures
                  ).join(' | ')})`}
                >
                  <div className={classes.counter_item}>
                    <FingerprintOutlinedIcon className={classes.counter_img} />
                    <span> {humanReadableNumber(Object.keys(process.signatures).length)}</span>
                  </div>
                </Tooltip>
              )}
              {process.network_count && process.network_count !== 0 ? (
                <Tooltip title={`${process.network_count} ${t('process_network')}`}>
                  <div className={classes.counter_item}>
                    <SettingsEthernetOutlinedIcon className={classes.counter_img} />
                    <span>{humanReadableNumber(process.network_count)}</span>
                  </div>
                </Tooltip>
              ) : null}
              {process.file_count && process.file_count !== 0 ? (
                <Tooltip title={`${process.file_count} ${t('process_file')}`}>
                  <div className={classes.counter_item}>
                    <InsertDriveFileOutlinedIcon className={classes.counter_img} />
                    <span>{humanReadableNumber(process.file_count)}</span>
                  </div>
                </Tooltip>
              ) : null}
              {process.registry_count && process.registry_count !== 0 ? (
                <Tooltip title={`${process.registry_count} ${t('process_registry')}`}>
                  <div className={classes.counter_item}>
                    <WidgetsOutlinedIcon className={classes.counter_img} />
                    <span>{humanReadableNumber(process.registry_count)}</span>
                  </div>
                </Tooltip>
              ) : null}
            </div>
          ) : null}
        </div>
      }
    >
      {process.children.length !== 0 && <ProcessTreeItemList processes={process.children} />}
    </TreeItem>
  );
};

const ProcessTreeItemList = ({ processes, force = false }) =>
  processes.map((process, id) => <ProcessTreeItem key={id} process={process} force={force} />);

const WrappedProcessTreeBody = ({ body, force = false }) => {
  try {
    const expanded = [];

    // Auto-expand first two levels
    body.forEach(process => {
      if (process.process_pid !== undefined && process.process_pid !== null) {
        expanded.push(process.process_pid.toString());
      }
      if (process.children !== undefined && process.children !== null && process.children.length !== 0) {
        process.children.forEach(subprocess => {
          if (subprocess.process_pid !== undefined && subprocess.process_pid !== null) {
            expanded.push(subprocess.process_pid.toString());
          }
        });
      }
    });

    return (
      <div style={{ overflowX: 'auto' }}>
        <TreeView
          defaultExpanded={expanded}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <ProcessTreeItemList processes={body} force={force} />
        </TreeView>
      </div>
    );
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.log('[WARNING] Could not parse ProcessTree body. The section will be skipped...');
  }
  return null;
};
export const ProcessTreeBody = React.memo(WrappedProcessTreeBody);
