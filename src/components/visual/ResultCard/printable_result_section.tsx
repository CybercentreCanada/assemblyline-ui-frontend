import {
  Box,
  createStyles,
  Link,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Tooltip,
  useTheme,
  withStyles
} from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FingerprintOutlinedIcon from '@material-ui/icons/FingerprintOutlined';
import { TreeItem, TreeView } from '@material-ui/lab';
import clsx from 'clsx';
import TitleKey from 'components/visual/TitleKey';
import Verdict from 'components/visual/Verdict';
import { scaleLinear } from 'd3-scale';
import { scoreToVerdict } from 'helpers/utils';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageBody } from './image_section';
import { Section } from './result_section';

const useStyles = makeStyles(theme => ({
  section_title: {
    display: 'flex',
    alignItems: 'center'
  },
  memdump: {
    '@media print': {
      backgroundColor: '#00000005',
      border: '1px solid #DDD'
    },
    backgroundColor: theme.palette.type === 'dark' ? '#ffffff05' : '#00000005',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px',
    padding: '4px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    margin: '0.25rem 0'
  },
  json: {
    '@media print': {
      backgroundColor: '#00000005',
      border: '1px solid #DDD'
    },
    backgroundColor: theme.palette.type === 'dark' ? '#ffffff05' : '#00000005',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px',
    padding: '4px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    margin: '0.25rem 0'
  }
}));

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

const TextBody = ({ body }) => <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{body}</div>;

const MemDumpBody = ({ body }) => {
  const classes = useStyles();
  return <pre className={classes.memdump}>{body}</pre>;
};

const KVBody = ({ body }) => {
  let data = null;
  try {
    data = JSON.parse(body);
  } catch (ex) {
    data = body;
  }
  return (
    <table cellSpacing={0}>
      <tbody>
        {Object.keys(data).map((key, id) => {
          let value = data[key];
          if (value instanceof Array) {
            value = value.join(' | ');
          } else if (value === true) {
            value = 'true';
          } else if (value === false) {
            value = 'false';
          } else if (typeof value === 'object') {
            value = JSON.stringify(value);
          }
          return (
            <tr key={id}>
              <td style={{ paddingRight: '16px', wordBreak: 'normal' }}>
                <TitleKey title={key} />
              </td>
              <td style={{ wordBreak: 'break-word' }}>{value}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const GraphBody = ({ body }) => {
  const theme = useTheme();
  const data = JSON.parse(body);
  if (data.type === 'colormap') {
    const colorRange = ['#87c6fb', '#111920'];
    const itemWidthPct = 100 / data.data.values.length;
    const colorScale = scaleLinear().domain(data.data.domain).range(colorRange);
    return (
      <svg width="100%" height="70">
        <rect y={10} x={0} width={15} height={15} fill={colorRange[0]} />
        <text y={22} x={20} fill={theme.palette.text.primary}>{`: ${data.data.domain[0]}`}</text>
        <rect y={10} x={80} width={15} height={15} fill={colorRange[1]} />
        <text y={22} x={100} fill={theme.palette.text.primary}>{`: ${data.data.domain[1]}`}</text>
        {data.data.values.map((value, i) => (
          <rect
            key={i}
            y={30}
            x={`${i * itemWidthPct}%`}
            width={`${itemWidthPct}%`}
            height={40}
            stroke={colorScale(value)}
            fill={colorScale(value)}
          />
        ))}
      </svg>
    );
  }
  return <div style={{ margin: '2rem' }}>Unsupported graph...</div>;
};

const URLBody = ({ body }) => {
  const arr = [];
  const data = JSON.parse(body);
  if (!(data instanceof Array)) {
    arr.push(data);
  } else {
    Array.prototype.push.apply(arr, data);
  }

  return (
    <ul
      style={{
        listStyleType: 'none',
        paddingInlineStart: 0,
        marginBlockStart: '0.25rem',
        marginBlockEnd: '0.25rem'
      }}
    >
      {arr.map((item, id) => (
        <li key={id}>
          <Link href={item.url}>{item.name ? item.name : item.url}</Link>
        </li>
      ))}
    </ul>
  );
};

const JSONBody = ({ body }) => {
  const classes = useStyles();
  const data = JSON.parse(body);
  const pprint = JSON.stringify(data, undefined, 2);
  return (
    <pre id="json" className={classes.json}>
      <code>{pprint}</code>
    </pre>
  );
};

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

const ProcessTreeBody = ({ body }) => {
  try {
    const data = JSON.parse(body);
    const expanded = [];

    // Auto-expand first two levels
    data.forEach(process => {
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
          <ProcessTreeItemList processes={data} />
        </TreeView>
      </div>
    );
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.log('[WARNING] Could not parse ProcessTree body. The section will be skipped...');
  }
  return null;
};

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '@media print': {
        color: 'black'
      },
      fontSize: 'inherit',
      lineHeight: 'inherit'
    },
    head: {
      '@media print': {
        color: 'black',
        backgroundColor: '#DDD !important'
      },
      backgroundColor: theme.palette.type === 'dark' ? '#404040' : '#EEE'
    },
    body: {
      [theme.breakpoints.up('md')]: {
        wordBreak: 'break-word'
      }
    }
  })
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '&:nth-of-type(odd)': {
        '@media print': {
          backgroundColor: '#EEE !important'
        },
        backgroundColor: theme.palette.type === 'dark' ? '#ffffff08' : '#00000008'
      }
    }
  })
)(TableRow);

const StyledTable = withStyles((theme: Theme) =>
  createStyles({
    root: {
      [theme.breakpoints.down('sm')]: {
        '@media print': {
          width: '100%'
        },
        width: 'max-content'
      }
    }
  })
)(Table);

const TblBody = ({ body }) => {
  let data = null;
  try {
    data = JSON.parse(body);
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.log('[WARNING] Could not parse Table body. The section will be skipped...');
  }

  const headers = [];

  if (data) {
    for (const line of data) {
      // eslint-disable-next-line guard-for-in
      for (const th in line) {
        const val = line[th];
        if (val !== null && val !== '') {
          if (!headers.includes(th)) {
            headers.push(th);
          }
        }
      }
    }
  }

  return (
    data && (
      <TableContainer style={{ fontSize: '90%' }}>
        <StyledTable stickyHeader size="small">
          <TableHead>
            <TableRow>
              {headers.map((th, id) => (
                <StyledTableCell key={id}>
                  <TitleKey title={th} />
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, id) => (
              <StyledTableRow key={id}>
                {headers.map((key, hid) => {
                  let value = row[key];
                  if (value instanceof Array) {
                    value = value.join(' | ');
                  } else if (value === true) {
                    value = 'true';
                  } else if (value === false) {
                    value = 'false';
                  } else if (typeof value === 'object' && value !== null && value !== undefined) {
                    value = <KVBody body={value} />;
                  }
                  return <StyledTableCell key={hid}>{value}</StyledTableCell>;
                })}
              </StyledTableRow>
            ))}
          </TableBody>
        </StyledTable>
      </TableContainer>
    )
  );
};

type PrintableResultSectionProps = {
  section: Section;
};

const PrintableResultSection: React.FC<PrintableResultSectionProps> = ({ section }) => {
  const classes = useStyles();

  return (
    <div style={{ marginRight: '0.5rem' }}>
      <Box className={classes.section_title}>
        {section.heuristic && <Verdict score={section.heuristic.score} mono short size="tiny" />}
        <span
          style={{
            fontWeight: 500,
            wordBreak: 'break-word',
            flexGrow: 1,
            paddingLeft: '8px'
          }}
        >
          {section.title_text}
        </span>
      </Box>
      {useMemo(
        () => (
          <>
            <div style={{ marginLeft: '2rem', marginBottom: '0.75rem' }}>
              <div style={{ cursor: 'context-menu' }}>
                {(() => {
                  switch (section.body_format) {
                    case 'TEXT':
                      return <TextBody body={section.body} />;
                    case 'MEMORY_DUMP':
                      return <MemDumpBody body={section.body} />;
                    case 'GRAPH_DATA':
                      return <GraphBody body={section.body} />;
                    case 'URL':
                      return <URLBody body={section.body} />;
                    case 'JSON':
                      return <JSONBody body={section.body} />;
                    case 'KEY_VALUE':
                      return <KVBody body={section.body} />;
                    case 'PROCESS_TREE':
                      return <ProcessTreeBody body={section.body} />;
                    case 'TABLE':
                      return <TblBody body={section.body} />;
                    case 'IMAGE':
                      return <ImageBody body={section.body} printable />;
                    default:
                      return <div style={{ margin: '2rem' }}>INVALID SECTION TYPE</div>;
                  }
                })()}
              </div>
            </div>
          </>
        ),
        [section.body_format, section.body]
      )}
    </div>
  );
};
export default PrintableResultSection;
