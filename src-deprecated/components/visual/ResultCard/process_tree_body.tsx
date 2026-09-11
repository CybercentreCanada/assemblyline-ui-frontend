import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import SettingsEthernetOutlinedIcon from '@mui/icons-material/SettingsEthernetOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import type { SvgIconProps } from '@mui/material';
import { Box, styled, Tooltip, useTheme } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import useALContext from 'components/hooks/useALContext';
import useSafeResults from 'components/hooks/useSafeResults';
import type { ProcessTreeBody as ProcessTreeData } from 'components/models/base/result_body';
import { humanReadableNumber } from 'helpers/utils';
import type { FC } from 'react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

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

type ProcessTreeItemProps = {
  process: ProcessTreeData;
  force?: boolean;
  index?: number;
  depth?: number;
};

const ProcessTreeItem = ({ process, index = 0, depth = 0, force = false }: ProcessTreeItemProps) => {
  const { t } = useTranslation(['fileDetail']);
  const theme = useTheme();
  const { showSafeResults } = useSafeResults();
  const { scoreToVerdict } = useALContext();

  return process.safelisted && process.children.length === 0 && !showSafeResults && !force ? null : (
    <TreeItem
      itemId={`${process.process_pid}-${index}-${depth}`}
      sx={{
        '&:hover > .MuiTreeItem-content, &:focus > .MuiTreeItem-content, .MuiTreeItem-content.Mui-focused, .MuiTreeItem-content.Mui-selected, .MuiTreeItem-content.Mui-selected.Mui-focused':
          {
            backgroundColor: 'transparent'
          }
      }}
      label={
        <Box
          sx={{
            '&:hover, .MuiTreeItem-content:hover &, .MuiTreeItem-content.Mui-focused &': {
              backgroundColor: theme.palette.mode === 'dark' ? '#FFFFFF10' : '#00000010'
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
            minWidth: '30rem',

            ...(process.safelisted
              ? {
                  '&:hover, .MuiTreeItem-content:hover &, .MuiTreeItem-content.Mui-focused &': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#355e35' : '#c0efc0'
                  },
                  '@media print': {
                    backgroundColor: '#d0ffd0'
                  },
                  backgroundColor: theme.palette.mode === 'dark' ? '#254e25' : '#d0ffd0'
                }
              : (() => {
                  switch (
                    scoreToVerdict(
                      Object.keys(process.signatures).reduce(
                        (sum, key) => sum + parseFloat(process.signatures[key] || 0),
                        0
                      )
                    )
                  ) {
                    case 'malicious':
                      return {
                        '&:hover, .MuiTreeItem-content:hover &, .MuiTreeItem-content.Mui-focused &': {
                          backgroundColor: theme.palette.mode === 'dark' ? '#5e3535' : '#efc0c0'
                        },
                        '@media print': {
                          backgroundColor: '#ffd0d0'
                        },
                        backgroundColor: theme.palette.mode === 'dark' ? '#4e2525' : '#ffd0d0'
                      };
                    case 'highly_suspicious':
                      return {
                        '&:hover, .MuiTreeItem-content:hover &, .MuiTreeItem-content.Mui-focused &': {
                          backgroundColor: theme.palette.mode === 'dark' ? '#755322' : '#efddc4'
                        },
                        '@media print': {
                          backgroundColor: '#ffedd4'
                        },
                        backgroundColor: theme.palette.mode === 'dark' ? '#654312' : '#ffedd4'
                      };
                    case 'suspicious':
                      return {
                        '&:hover, .MuiTreeItem-content:hover &, .MuiTreeItem-content.Mui-focused &': {
                          backgroundColor: theme.palette.mode === 'dark' ? '#755322' : '#efddc4'
                        },
                        '@media print': {
                          backgroundColor: '#ffedd4'
                        },
                        backgroundColor: theme.palette.mode === 'dark' ? '#654312' : '#ffedd4'
                      };
                  }
                })())
          }}
        >
          <Box
            sx={{
              '@media print': {
                backgroundColor: '#00000010'
              },
              padding: '5px',
              backgroundColor: theme.palette.mode === 'dark' ? '#FFFFFF10' : '#00000010',
              borderRadius: '4px 0px 0px 4px'
            }}
          >
            {process.process_pid}
          </Box>
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
            <Box
              sx={{
                '@media print': {
                  backgroundColor: '#00000010',
                  color: 'black'
                },
                alignItems: 'flex-end',
                backgroundColor: theme.palette.mode === 'dark' ? '#FFFFFF10' : '#00000010',
                color: theme.palette.text.secondary,
                display: 'flex',
                flexDirection: 'column',
                fontSize: '90%',
                minWidth: theme.spacing(6)
              }}
            >
              {process.signatures && Object.keys(process.signatures).length !== 0 && (
                <Tooltip
                  placement="left"
                  title={`${Object.keys(process.signatures).length} ${t('process_signatures')} (${Object.keys(
                    process.signatures
                  ).join(' | ')})`}
                >
                  <CounterItem>
                    <CounterImg component={FingerprintOutlinedIcon} />
                    <span> {humanReadableNumber(Object.keys(process.signatures).length)}</span>
                  </CounterItem>
                </Tooltip>
              )}
              {process.network_count && process.network_count !== 0 ? (
                <Tooltip placement="left" title={`${process.network_count} ${t('process_network')}`}>
                  <CounterItem>
                    <CounterImg component={SettingsEthernetOutlinedIcon} />
                    <span>{humanReadableNumber(process.network_count)}</span>
                  </CounterItem>
                </Tooltip>
              ) : null}
              {process.file_count && process.file_count !== 0 ? (
                <Tooltip placement="left" title={`${process.file_count} ${t('process_file')}`}>
                  <CounterItem>
                    <CounterImg component={InsertDriveFileOutlinedIcon} />
                    <span>{humanReadableNumber(process.file_count)}</span>
                  </CounterItem>
                </Tooltip>
              ) : null}
              {process.registry_count && process.registry_count !== 0 ? (
                <Tooltip placement="left" title={`${process.registry_count} ${t('process_registry')}`}>
                  <CounterItem>
                    <CounterImg component={WidgetsOutlinedIcon} />
                    <span>{humanReadableNumber(process.registry_count)}</span>
                  </CounterItem>
                </Tooltip>
              ) : null}
            </Box>
          ) : null}
        </Box>
      }
    >
      {process.children.length !== 0 && <ProcessTreeItemList processes={process.children} depth={depth + 1} />}
    </TreeItem>
  );
};

type ProcessTreeItemListProps = {
  processes: ProcessTreeData[];
  force?: boolean;
  depth?: number;
};

const ProcessTreeItemList = ({ processes, depth = 0, force = false }: ProcessTreeItemListProps) => (
  <>
    {processes.map((process, id) => (
      <ProcessTreeItem key={id} process={process} index={id} depth={depth} force={force} />
    ))}
  </>
);

type Props = {
  body: ProcessTreeData[];
  force?: boolean;
};

const WrappedProcessTreeBody = ({ body, force = false }: Props) => {
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
        <SimpleTreeView
          defaultExpandedItems={expanded}
          slots={{
            collapseIcon: ExpandMoreIcon,
            expandIcon: ChevronRightIcon
          }}
        >
          <ProcessTreeItemList processes={body} force={force} />
        </SimpleTreeView>
      </div>
    );
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.log('[WARNING] Could not parse ProcessTree body. The section will be skipped...');
  }
  return null;
};
export const ProcessTreeBody = React.memo(WrappedProcessTreeBody);
