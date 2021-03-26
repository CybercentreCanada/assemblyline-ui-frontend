import {
  Box,
  Collapse,
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
import useALContext from 'components/hooks/useALContext';
import useHighlighter from 'components/hooks/useHighlighter';
import Attack from 'components/visual/Attack';
import Classification from 'components/visual/Classification';
import Heuristic from 'components/visual/Heuristic';
import SectionHighlight from 'components/visual/SectionHighlight';
import Tag from 'components/visual/Tag';
import TitleKey from 'components/visual/TitleKey';
import Verdict from 'components/visual/Verdict';
import { scaleLinear } from 'd3-scale';
import { scoreToVerdict } from 'helpers/utils';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ReactJson from 'react-json-view';

const useStyles = makeStyles(theme => ({
  section_title: {
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      cursor: 'pointer'
    }
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
    '&:focus > .MuiTreeItem-content .MuiTreeItem-label, &:hover > .MuiTreeItem-content .MuiTreeItem-label, &$root.Mui-selected > .MuiTreeItem-content .MuiTreeItem-label': {
      backgroundColor: 'transparent'
    }
  },
  suspicious: {
    backgroundColor: theme.palette.type === 'dark' ? '#654312' : '#ffedd4'
  },
  malicious: {
    backgroundColor: theme.palette.type === 'dark' ? '#4e2525' : '#ffd0d0'
  }
}));

const TextBody = ({ body }) => {
  return <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{body}</div>;
};

const MemDumpBody = ({ body }) => {
  const theme = useTheme();
  return (
    <pre
      style={{
        backgroundColor: theme.palette.type === 'dark' ? '#ffffff05' : '#00000005',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '4px',
        padding: '4px',
        whiteSpace: 'pre-wrap',
        fontSize: '1rem',
        wordBreak: 'break-word',
        margin: '0.25rem 0'
      }}
    >
      {body}
    </pre>
  );
};

const KVBody = ({ body }) => {
  return (
    <table cellSpacing={0}>
      <tbody>
        {Object.keys(body).map((key, id) => {
          let value = body[key];
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
  if (body.type === 'colormap') {
    const colorRange = ['#87c6fb', '#111920'];
    const itemWidthPct = 100 / body.data.values.length;
    const colorScale = scaleLinear().domain(body.data.domain).range(colorRange);
    return (
      <svg width="100%" height="70">
        <rect y={10} x={0} width={15} height={15} fill={colorRange[0]} />
        <text y={22} x={20} fill={theme.palette.text.primary}>{`: ${body.data.domain[0]}`}</text>
        <rect y={10} x={80} width={15} height={15} fill={colorRange[1]} />
        <text y={22} x={100} fill={theme.palette.text.primary}>{`: ${body.data.domain[1]}`}</text>
        {body.data.values.map((value, i) => {
          return (
            <rect
              key={i}
              y={30}
              x={`${i * itemWidthPct}%`}
              width={`${itemWidthPct}%`}
              height={40}
              stroke={colorScale(value)}
              fill={colorScale(value)}
            />
          );
        })}
      </svg>
    );
  }
  return <div style={{ margin: '2rem' }}>Unsupported graph...</div>;
};

const URLBody = ({ body }) => {
  const arr = [];
  if (!(body instanceof Array)) {
    arr.push(body);
  } else {
    Array.prototype.push.apply(arr, body);
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
      {arr.map((item, id) => {
        return (
          <li key={id}>
            <Link href={item.url}>{item.name ? item.name : item.url}</Link>
          </li>
        );
      })}
    </ul>
  );
};

const JSONBody = ({ body }) => {
  const theme = useTheme();

  const jsonTheme = {
    base00: 'transparent', // Background
    base01: '#f1f1f1', // Edit key text
    base02: theme.palette.type === 'dark' ? theme.palette.text.hint : theme.palette.divider, // Borders and DataType Background
    base03: '#444', // Unused
    base04: theme.palette.grey[theme.palette.type === 'dark' ? 700 : 400], // Object size and Add key border
    base05: theme.palette.grey[theme.palette.type === 'dark' ? 700 : 700], // Undefined and Add key background
    base06: '#444', // Unused
    base07: theme.palette.text.primary, // Brace, Key and Borders
    base08: theme.palette.text.secondary, // NaN
    base09: theme.palette.type === 'dark' ? theme.palette.warning.light : theme.palette.warning.dark, // Strings and Icons
    base0A: '#333', // Null, Regex and edit color
    base0B: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark, // Float
    base0C: theme.palette.type === 'dark' ? theme.palette.secondary.light : theme.palette.secondary.dark, // Array Key
    base0D: theme.palette.type === 'dark' ? theme.palette.info.light : theme.palette.info.dark, // Date, function, expand icon
    base0E: theme.palette.type === 'dark' ? theme.palette.info.light : theme.palette.info.dark, // Boolean
    base0F: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark // Integer
  };

  return (
    <ReactJson
      name={false}
      src={body}
      theme={jsonTheme}
      enableClipboard={false}
      collapsed
      groupArraysAfterLength={10}
      displayDataTypes={false}
      displayObjectSize={false}
      style={{
        backgroundColor: theme.palette.type === 'dark' ? '#FFFFFF05' : '#00000005',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '4px',
        fontSize: '1rem',
        padding: '4px'
      }}
    />
  );
};

const ProcessTreeItem = ({ process }) => {
  const { t } = useTranslation(['fileDetail']);
  const theme = useTheme();
  const classes = useTreeItemStyles();
  const classMap = {
    suspicious: classes.suspicious,
    highly_suspicious: classes.suspicious,
    malicious: classes.malicious
  };

  return (
    <TreeItem
      nodeId={process.pid.toString()}
      classes={{
        root: classes.root
      }}
      label={
        <div
          className={
            classMap[
              scoreToVerdict(
                Object.keys(process.signatures).reduce((sum, key) => sum + parseFloat(process.signatures[key] || 0), 0)
              )
            ]
          }
          style={{
            border: `1px solid ${theme.palette.divider}`,
            margin: '0.2em 0em',
            borderRadius: '4px',
            display: 'flex',
            maxWidth: '50rem',
            minWidth: '30rem'
          }}
        >
          <div
            style={{
              padding: '5px',
              backgroundColor: theme.palette.type === 'dark' ? '#FFFFFF10' : '#00000010',
              borderRadius: '4px 0px 0px 4px'
            }}
          >
            {process.pid}
          </div>
          <div style={{ padding: '5px', flexGrow: 1, wordBreak: 'break-word' }}>
            <div style={{ paddingBottom: '5px' }}>
              <b>{process.image}</b>
            </div>
            <div>
              <samp>
                <small>{process.command_line}</small>
              </samp>
            </div>
          </div>
          <div style={{ alignSelf: 'center', color: theme.palette.text.secondary }}>
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

const ProcessTreeItemList = ({ processes }) => {
  return processes.map((process, id) => {
    return <ProcessTreeItem key={id} process={process} />;
  });
};

const ProcessTreeBody = ({ body }) => {
  try {
    const data = JSON.parse(body);
    const expanded = [];

    // Auto-expand first two levels
    data.forEach(process => {
      if (process.pid !== undefined && process.pid !== null) {
        expanded.push(process.pid.toString());
      }
      if (process.children !== undefined && process.children !== null && process.children.length !== 0) {
        process.children.forEach(subprocess => {
          if (subprocess.pid !== undefined && subprocess.pid !== null) {
            expanded.push(subprocess.pid.toString());
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
      fontSize: 'inherit',
      lineHeight: 'inherit'
    },
    head: {
      backgroundColor: theme.palette.type === 'dark' ? '#404040' : '#EEE'
    },
    body: {
      wordBreak: 'break-word'
    }
  })
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.type === 'dark' ? '#ffffff08' : '#00000008'
      }
    }
  })
)(TableRow);

const StyledTable = withStyles((theme: Theme) =>
  createStyles({
    root: {
      [theme.breakpoints.down('sm')]: {
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
      <TableContainer style={{ fontSize: '90%', maxHeight: '500px' }}>
        <StyledTable stickyHeader size="small">
          <TableHead>
            <TableRow>
              {headers.map((th, id) => {
                return (
                  <StyledTableCell key={id}>
                    <TitleKey title={th} />
                  </StyledTableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, id) => {
              return (
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
              );
            })}
          </TableBody>
        </StyledTable>
      </TableContainer>
    )
  );
};

export type SectionItem = {
  children: SectionItem[];
  id: number;
};

export type Section = {
  body: any;
  body_format: string;
  classification: string;
  depth: number;
  heuristic: {
    attack: {
      attack_id: string;
      categories: string[];
      pattern: string;
    }[];
    heur_id: string;
    name: string;
    score: number;
    signature: {
      frequency: number;
      name: string;
    }[];
  };
  tags: {
    type: string;
    short_type: string;
    value: string;
  }[];
  title_text: string;
};

type ResultSectionProps = {
  section_list: Section[];
  id: number;
  sub_sections: SectionItem[];
  indent: number;
  depth?: number;
};

const ResultSection: React.FC<ResultSectionProps> = ({ section_list, id, sub_sections, indent, depth = 1 }) => {
  const classes = useStyles();
  const theme = useTheme();
  const section = section_list[id];
  const [open, setOpen] = React.useState(true);
  const { getKey, hasHighlightedKeys } = useHighlighter();
  const { c12nDef } = useALContext();

  const allTags = useMemo(() => {
    const tagList = [];
    if (Array.isArray(section.tags)) {
      for (const tag of section.tags) {
        tagList.push(getKey(tag.type, tag.value));
      }
    }

    if (section.heuristic !== undefined && section.heuristic !== null) {
      if (section.heuristic.attack !== undefined && section.heuristic.attack.length !== 0) {
        for (const attack of section.heuristic.attack) {
          tagList.push(getKey('attack_pattern', attack.attack_id));
        }
      }
      if (section.heuristic.heur_id !== undefined && section.heuristic.heur_id !== null) {
        tagList.push(getKey('heuristic', section.heuristic.heur_id));
      }
      if (section.heuristic.signature !== undefined && section.heuristic.signature.length !== 0) {
        for (const signature of section.heuristic.signature) {
          tagList.push(getKey('heuristic.signature', signature.name));
        }
      }
    }
    return tagList;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const highlighted = hasHighlightedKeys(allTags);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'nowrap',
        marginLeft: `${depth}rem`,
        backgroundColor: highlighted ? (theme.palette.type === 'dark' ? '#343a44' : '#d8e3ea') : null
      }}
    >
      <SectionHighlight
        score={section.heuristic ? section.heuristic.score : 0}
        indent={indent}
        depth={depth}
        highlighted={highlighted}
      />

      <div style={{ width: '100%' }}>
        <Box className={classes.section_title} onClick={handleClick}>
          {c12nDef.enforce && (
            <span>
              <Classification c12n={section.classification} type="text" />
              &nbsp;&nbsp;::&nbsp;&nbsp;
            </span>
          )}
          {section.heuristic && (
            <span>
              <Verdict score={section.heuristic.score} mono short size="tiny" />
              &nbsp;::&nbsp;&nbsp;
            </span>
          )}
          <span style={{ fontWeight: 500, wordBreak: 'break-word' }}>{section.title_text}</span>
        </Box>
        <Collapse in={open} timeout="auto">
          {useMemo(
            () => (
              <>
                <div style={{ marginLeft: '1rem', marginBottom: '0.75rem' }}>
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
                      default:
                        return <div style={{ margin: '2rem' }}>INVALID SECTION TYPE</div>;
                    }
                  })()}
                  {section.heuristic && (
                    <Heuristic
                      text={section.heuristic.name}
                      score={section.heuristic.score}
                      show_type
                      highlight_key={getKey('heuristic', section.heuristic.heur_id)}
                    />
                  )}
                  {section.heuristic &&
                    section.heuristic.attack.map((attack, idx) => {
                      return (
                        <Attack
                          key={idx}
                          text={attack.pattern}
                          score={section.heuristic.score}
                          show_type
                          highlight_key={getKey('attack_pattern', attack.attack_id)}
                        />
                      );
                    })}
                  {section.heuristic &&
                    section.heuristic.signature.map((signature, idx) => {
                      return (
                        <Heuristic
                          key={idx}
                          text={signature.name}
                          score={section.heuristic.score}
                          signature
                          show_type
                          highlight_key={getKey('heuristic.signature', signature.name)}
                        />
                      );
                    })}
                  {Array.isArray(section.tags) &&
                    section.tags.map((tag, idx) => {
                      return (
                        <Tag
                          key={idx}
                          type={tag.type}
                          value={tag.value}
                          short_type={tag.short_type}
                          score={section.heuristic ? section.heuristic.score : 0}
                          highlight_key={getKey(tag.type, tag.value)}
                        />
                      );
                    })}
                </div>
                <div>
                  {sub_sections.map(item => {
                    return (
                      <ResultSection
                        key={item.id}
                        section_list={section_list}
                        id={item.id}
                        sub_sections={item.children}
                        indent={indent + 1}
                      />
                    );
                  })}
                </div>
              </>
            ),
            [
              getKey,
              indent,
              section.body,
              section.body_format,
              section.heuristic,
              section.tags,
              section_list,
              sub_sections
            ]
          )}
        </Collapse>
      </div>
    </div>
  );
};

export default ResultSection;
