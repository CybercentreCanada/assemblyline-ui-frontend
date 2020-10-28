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
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import FingerprintOutlinedIcon from '@material-ui/icons/FingerprintOutlined';
import PageviewOutlinedIcon from '@material-ui/icons/PageviewOutlined';
import useAppContext from 'components/hooks/useAppContext';
import { NavHighlighterProps } from 'components/hooks/useNavHighlighter';
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
import Moment from 'react-moment';
import { Link as RouterLink } from 'react-router-dom';

type ExtractedFiles = {
  classification: string;
  description: string;
  name: string;
  sha256: string;
};

type SectionItem = {
  children: SectionItem[];
  id: number;
};

export type Result = {
  archive_ts: string;
  classification: string;
  created: string;
  drop_file: boolean;
  expiry_ts: string | null;
  response: {
    extracted: ExtractedFiles[];
    milestones: {
      service_completed: string;
      service_started: string;
    };
    service_context: string;
    service_debug_info: string;
    service_name: string;
    service_tool_version: string;
    service_version: string;
    supplementary: ExtractedFiles[];
  };
  result: {
    score: number;
    sections: Section[];
  };
  section_hierarchy: SectionItem[];
  sha256: string;
};

type Section = {
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
  navHighlighter?: NavHighlighterProps;
};

type ResultCardProps = {
  result: Result;
  sid: string | null;
  navHighlighter?: NavHighlighterProps;
};

const useStyles = makeStyles(theme => ({
  card: {
    backgroundColor: theme.palette.background.default,
    border: `solid 1px ${theme.palette.type === 'dark' ? '#393939' : '#ddd'}`,
    borderRadius: '4px'
  },
  card_title: {
    backgroundColor: theme.palette.type === 'dark' ? '#393939' : '#f0f0f0',
    padding: '6px',
    borderRadius: '4px 4px 0px 0px',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '#505050' : '#e6e6e6',
      cursor: 'pointer'
    }
  },
  section_title: {
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      cursor: 'pointer'
    }
  },
  title: {
    '&:hover': {
      color: theme.palette.text.secondary,
      cursor: 'pointer'
    }
  },
  content: {
    padding: '6px'
  },
  muted: {
    color: theme.palette.text.secondary
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
  return (
    <ReactJson
      src={body}
      theme={theme.palette.type === 'dark' ? 'bright' : 'bright:inverted'}
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

const ProcessTreeBody = ({ body }) => {
  const { t } = useTranslation(['fileDetail']);
  const theme = useTheme();
  const classes = useStyles();

  const classMap = {
    suspicious: classes.suspicious,
    highly_suspicious: classes.suspicious,
    malicious: classes.malicious
  };

  let data = null;
  try {
    data = JSON.parse(body);
  } catch (ex) {
    data = body;
  }

  if (!(data instanceof Object)) {
    // eslint-disable-next-line no-console
    console.log('[WARNING] Could not parse ProcessTree body. The section will be skipped...');
  }

  return data instanceof Object ? (
    <ul
      style={{
        fontSize: '0.875rem',
        listStyleType: 'none',
        paddingInlineStart: 0,
        marginBlockStart: '0.25rem',
        marginBlockEnd: '0.25rem'
      }}
    >
      {data.map((process, id) => {
        return (
          <li key={id}>
            <div
              className={
                classMap[
                  scoreToVerdict(
                    Object.keys(process.signatures).reduce(
                      (sum, key) => sum + parseFloat(process.signatures[key] || 0),
                      0
                    )
                  )
                ]
              }
              style={{
                border: `1px solid ${theme.palette.divider}`,
                margin: '0.2em 0em',
                borderRadius: '4px',
                display: 'flex',
                maxWidth: '50em'
              }}
            >
              <div
                style={{
                  padding: '5px',
                  backgroundColor: theme.palette.type === 'dark' ? '#FFFFFF10' : '#00000010',
                  borderRadius: '4px 0px 0px 4px'
                }}
              >
                {process.process_pid}
              </div>
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
            <div style={{ marginLeft: '1.5rem' }}>
              <ProcessTreeBody body={process.children} />
            </div>
          </li>
        );
      })}
    </ul>
  ) : null;
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

const ResultSection: React.FC<ResultSectionProps> = ({
  section_list,
  id,
  sub_sections,
  indent,
  depth = 1,
  navHighlighter
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const section = section_list[id];
  const [open, setOpen] = React.useState(true);

  console.log(`drawing section (${id})`);

  const allTags = useMemo(() => {
    const tagList = [];
    if (navHighlighter) {
      for (const tag of section.tags) {
        tagList.push(navHighlighter.getKey(tag.type, tag.value));
      }

      if (section.heuristic !== undefined && section.heuristic !== null) {
        if (section.heuristic.attack !== undefined && section.heuristic.attack.length !== 0) {
          for (const attack of section.heuristic.attack) {
            tagList.push(navHighlighter.getKey('attack_pattern', attack.attack_id));
          }
        }
        if (section.heuristic.heur_id !== undefined && section.heuristic.heur_id !== null) {
          tagList.push(navHighlighter.getKey('heuristic', section.heuristic.heur_id));
        }
        if (section.heuristic.signature !== undefined && section.heuristic.signature.length !== 0) {
          for (const signature of section.heuristic.signature) {
            tagList.push(navHighlighter.getKey('heuristic.signature', signature.name));
          }
        }
      }
    }
    return tagList;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const highlighted = navHighlighter.hasHighlightedKeys(allTags);

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
          <span>
            <Classification c12n={section.classification} type="text" inline />
            &nbsp;&nbsp;::&nbsp;&nbsp;
          </span>
          {section.heuristic && (
            <span>
              <Verdict score={section.heuristic.score} mono short size="tiny" />
              &nbsp;::&nbsp;&nbsp;
            </span>
          )}
          <span style={{ fontWeight: 500, wordBreak: 'break-word' }}>{section.title_text}</span>
        </Box>
        <Collapse in={open} timeout="auto">
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
                highlighted={navHighlighter.isHighlighted(
                  navHighlighter.getKey('heuristic', section.heuristic.heur_id)
                )}
                onClick={() =>
                  navHighlighter.triggerHighlight(navHighlighter.getKey('heuristic', section.heuristic.heur_id))
                }
              />
            )}
            {section.heuristic &&
              section.heuristic.attack.map((attack, idx) => {
                const key = navHighlighter.getKey('attack_pattern', attack.attack_id);
                return (
                  <Attack
                    key={idx}
                    text={attack.pattern}
                    score={section.heuristic.score}
                    show_type
                    highlighted={navHighlighter.isHighlighted(key)}
                    onClick={() => navHighlighter.triggerHighlight(key)}
                  />
                );
              })}
            {section.heuristic &&
              section.heuristic.signature.map((signature, idx) => {
                const key = navHighlighter.getKey('heuristic.signature', signature.name);
                return (
                  <Heuristic
                    key={idx}
                    text={signature.name}
                    score={section.heuristic.score}
                    signature
                    show_type
                    highlighted={navHighlighter.isHighlighted(key)}
                    onClick={() => navHighlighter.triggerHighlight(key)}
                  />
                );
              })}
            {section.tags.map((tag, idx) => {
              const key = navHighlighter.getKey(tag.type, tag.value);
              return (
                <Tag
                  key={idx}
                  type={tag.type}
                  value={tag.value}
                  short_type={tag.short_type}
                  score={section.heuristic ? section.heuristic.score : 0}
                  highlighted={navHighlighter.isHighlighted(key)}
                  onClick={() => navHighlighter.triggerHighlight(key)}
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
                  navHighlighter={navHighlighter}
                />
              );
            })}
          </div>
        </Collapse>
      </div>
    </div>
  );
};

type ExtractedFileProps = {
  file: ExtractedFiles;
  download?: boolean;
  sid?: string;
};

const ExtractedFile: React.FC<ExtractedFileProps> = ({ file, download = false, sid = null }) => {
  const { t } = useTranslation(['fileDetail']);
  const classes = useStyles();
  return (
    <div>
      {download ? (
        <Link href={`/api/v4/file/download/${file.sha256}/?name=${encodeURI(file.name)}`}>{file.name}</Link>
      ) : (
        <Link
          component={RouterLink}
          to={
            sid
              ? `/submission/detail/${sid}/${file.sha256}?name=${encodeURI(file.name)}`
              : `/file/detail/${file.sha256}?name=${encodeURI(file.name)}`
          }
        >
          {file.name}
        </Link>
      )}
      <small className={classes.muted}>{` :: ${file.description}`}</small>
      <Tooltip title={t('view_file')}>
        <Link component={RouterLink} to={`/file/viewer/${file.sha256}`}>
          <PageviewOutlinedIcon style={{ fontSize: '1.4em', marginLeft: '0.5rem', verticalAlign: 'bottom' }} />
        </Link>
      </Tooltip>
    </div>
  );
};

export const emptyResult = (result: Result) => {
  return (
    result.result.score === 0 &&
    result.result.sections.length === 0 &&
    result.response.extracted.length === 0 &&
    result.response.supplementary.length === 0
  );
};

const ResultCard: React.FC<ResultCardProps> = ({ result, sid, navHighlighter = null }) => {
  const { t } = useTranslation(['fileDetail']);
  const classes = useStyles();
  const theme = useTheme();
  const sp2 = theme.spacing(2);
  const { settings } = useAppContext();
  const empty = emptyResult(result);
  const [open, setOpen] = React.useState(!empty && result.result.score >= settings.expand_min_score);
  const [openSupp, setOpenSupp] = React.useState(true);
  const [openExt, setOpenExt] = React.useState(true);

  console.log(`drawing result (${result.response.service_name})`);

  const allTags = useMemo(() => {
    const tagList = [];
    navHighlighter &&
      result.result.sections.forEach(section => {
        for (const tag of section.tags) {
          tagList.push(navHighlighter.getKey(tag.type, tag.value));
        }

        if (section.heuristic !== undefined && section.heuristic !== null) {
          if (section.heuristic.attack !== undefined && section.heuristic.attack.length !== 0) {
            for (const attack of section.heuristic.attack) {
              tagList.push(navHighlighter.getKey('attack_pattern', attack.attack_id));
            }
          }
          if (section.heuristic.heur_id !== undefined && section.heuristic.heur_id !== null) {
            tagList.push(navHighlighter.getKey('heuristic', section.heuristic.heur_id));
          }
          if (section.heuristic.signature !== undefined && section.heuristic.signature.length !== 0) {
            for (const signature of section.heuristic.signature) {
              tagList.push(navHighlighter.getKey('heuristic.signature', signature.name));
            }
          }
        }
      });
    return tagList;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  if (result.section_hierarchy === undefined) {
    // eslint-disable-next-line no-console
    console.log('[WARNING] Using old rendering method because the section hierarchy is missing...');
  }

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <div className={classes.card} style={{ marginBottom: sp2 }}>
      <Box
        className={classes.card_title}
        onClick={handleClick}
        style={{
          backgroundColor:
            navHighlighter && navHighlighter.hasHighlightedKeys(allTags)
              ? theme.palette.type === 'dark'
                ? '#343a44'
                : '#d8e3ea'
              : null
        }}
      >
        <Classification c12n={result.classification} type="text" inline />
        <span>
          &nbsp;::&nbsp;<b>{result.response.service_name}</b>&nbsp;
        </span>
        {!empty && <Verdict score={result.result.score} mono short size="tiny" />}
        <small className={classes.muted}>{` :: ${result.response.service_version.replace(/_/g, '.')}`}</small>
        <small className={classes.muted} style={{ flexGrow: 1 }}>
          &nbsp;{result.response.service_context ? `(${result.response.service_context})` : ''}
        </small>
        {!empty && !sid && (
          <small>
            <Moment className={classes.muted} fromNow>
              {result.created}
            </Moment>
          </small>
        )}
        {open ? <ExpandLess className={classes.muted} /> : <ExpandMore className={classes.muted} />}
      </Box>
      <Collapse in={open} timeout="auto">
        {empty ? (
          <div className={classes.content} style={{ color: theme.palette.text.secondary }}>
            {t('nothing_to_report')}
          </div>
        ) : (
          <div className={classes.content}>
            {result.section_hierarchy
              ? result.section_hierarchy.map(item => {
                  return (
                    <ResultSection
                      key={item.id}
                      section_list={result.result.sections}
                      id={item.id}
                      sub_sections={item.children}
                      indent={1}
                      navHighlighter={navHighlighter}
                    />
                  );
                })
              : result.result.sections.map((section, id) => {
                  return (
                    <ResultSection
                      key={id}
                      section_list={result.result.sections}
                      id={id}
                      sub_sections={[]}
                      indent={section.depth}
                      depth={section.depth}
                      navHighlighter={navHighlighter}
                    />
                  );
                })}
            {result.response.supplementary.length !== 0 && (
              <div>
                <Box
                  className={classes.title}
                  onClick={() => {
                    setOpenSupp(!openSupp);
                  }}
                >
                  <h3>{t('supplementary')}</h3>
                </Box>
                <Collapse in={openSupp} timeout="auto">
                  {result.response.supplementary.map((file, id) => {
                    return <ExtractedFile key={id} file={file} download />;
                  })}
                </Collapse>
              </div>
            )}
            {result.response.extracted.length !== 0 && (
              <div>
                <Box
                  className={classes.title}
                  onClick={() => {
                    setOpenExt(!openExt);
                  }}
                >
                  <h3>{t('extracted')}</h3>
                </Box>
                <Collapse in={openExt} timeout="auto">
                  {result.response.extracted.map((file, id) => {
                    return <ExtractedFile key={id} file={file} sid={sid} />;
                  })}{' '}
                </Collapse>
              </div>
            )}
          </div>
        )}
      </Collapse>
    </div>
  );
};

export default ResultCard;
