import { makeStyles, Theme, Tooltip } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FingerprintOutlinedIcon from '@material-ui/icons/FingerprintOutlined';
import { TreeItem, TreeView } from '@material-ui/lab';
import clsx from 'clsx';
import { scoreToVerdict } from 'helpers/utils';
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
  signature: {
    '@media print': {
      color: 'black'
    },
    alignSelf: 'center',
    color: theme.palette.text.secondary
  },
  suspicious: {
    '@media print': {
      backgroundColor: '#ffedd4'
    },
    backgroundColor: theme.palette.type === 'dark' ? '#654312' : '#ffedd4'
  },
  malicious: {
    '@media print': {
      backgroundColor: '#ffd0d0'
    },
    backgroundColor: theme.palette.type === 'dark' ? '#4e2525' : '#ffd0d0'
  }
}));

const ProcessTreeItem = ({ process }) => {
  const { t } = useTranslation(['fileDetail']);
  const classes = useTreeItemStyles();
  const classMap = {
    suspicious: classes.suspicious,
    highly_suspicious: classes.suspicious,
    malicious: classes.malicious
  };

  return (
    <TreeItem
      nodeId={process.process_pid.toString()}
      classes={{
        root: classes.root
      }}
      label={
        <div
          className={clsx(
            classes.treeItem,
            classMap[
              scoreToVerdict(
                Object.keys(process.signatures).reduce((sum, key) => sum + parseFloat(process.signatures[key] || 0), 0)
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
          <div className={classes.signature}>
            {Object.keys(process.signatures).length !== 0 && (
              <div>
                <Tooltip title={`${t('process_signatures')}: ${Object.keys(process.signatures).join(' | ')}`}>
                  <span>
                    {Object.keys(process.signatures).length}x
                    <FingerprintOutlinedIcon style={{ verticalAlign: 'middle' }} />
                  </span>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      }
    >
      {process.children.length !== 0 && <ProcessTreeItemList processes={process.children} />}
    </TreeItem>
  );
};

const ProcessTreeItemList = ({ processes }) =>
  processes.map((process, id) => <ProcessTreeItem key={id} process={process} />);

const WrappedProcessTreeBody = ({ body }) => {
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
          <ProcessTreeItemList processes={body} />
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
