import {
  createStyles,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  useTheme,
  withStyles
} from '@material-ui/core';
import Attack from 'components/visual/Attack';
import Classification from 'components/visual/Classification';
import Heuristic from 'components/visual/Heuristic';
import SectionHighlight from 'components/visual/SectionHighlight';
import Tag from 'components/visual/Tag';
import TitleKey from 'components/visual/TitleKey';
import Verdict from 'components/visual/Verdict';
import { scaleLinear } from 'd3-scale';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { useHistory } from 'react-router-dom';

type ExtractedFile = {
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
    extracted: ExtractedFile[];
    milestones: {
      service_completed: string;
      service_started: string;
    };
    service_context: string;
    service_debug_info: string;
    service_name: string;
    service_tool_version: string;
    service_version: string;
    supplementary: ExtractedFile[];
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
    attack: any;
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
};

type ResultCardProps = {
  result: Result;
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
  content: {
    padding: '6px',
    fontSize: '85%'
  },
  muted: {
    color: theme.palette.text.secondary,
    fontSize: '85%'
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
        backgroundColor: theme.palette.type === 'dark' ? '#ffffff10' : '#00000010',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '4px',
        padding: '4px',
        whiteSpace: 'pre-wrap',
        fontSize: '0.85rem',
        wordBreak: 'break-word'
      }}
    >
      {body}
    </pre>
  );
};

const KVBody = ({ body }) => {
  return (
    <table>
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
  return <div style={{ margin: '2rem' }}>URL under construction...</div>;
};

const JSONBody = ({ body }) => {
  return <div style={{ margin: '2rem' }}>JSON under construction...</div>;
};

const ProcessTreeBody = ({ body }) => {
  return <div style={{ margin: '2rem' }}>PROCESS_TREE under construction...</div>;
};

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      fontSize: 'inherit'
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
  const data = JSON.parse(body);
  const headers = [];

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

  return (
    <TableContainer style={{ fontSize: '85%', maxHeight: '500px' }}>
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
  );
};

const ResultSection: React.FC<ResultSectionProps> = ({ section_list, id, sub_sections, indent }) => {
  const section = section_list[id];

  return (
    <div style={{ display: 'flex', flexWrap: 'nowrap', marginLeft: '1rem' }}>
      <SectionHighlight score={section.heuristic ? section.heuristic.score : 0} indent={indent} />

      <div style={{ width: '100%' }}>
        <div>
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
        </div>
        <div style={{ marginLeft: '1rem', marginBottom: '0.5rem' }}>
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
          {section.heuristic && <Heuristic text={section.heuristic.name} score={section.heuristic.score} show_type />}
          {section.heuristic &&
            section.heuristic.attack.map((attack, idx) => {
              return <Attack key={idx} text={attack.pattern} score={section.heuristic.score} show_type />;
            })}
          {section.heuristic &&
            section.heuristic.signature.map((signature, idx) => {
              return <Heuristic key={idx} text={signature.name} score={section.heuristic.score} signature show_type />;
            })}
          {section.tags.map((tag, idx) => {
            return (
              <Tag
                key={idx}
                type={tag.type}
                value={tag.value}
                short_type={tag.short_type}
                score={section.heuristic ? section.heuristic.score : 0}
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
      </div>
    </div>
  );
};

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const { t } = useTranslation(['section']);
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);

  return (
    <div className={classes.card} style={{ marginBottom: sp2 }}>
      <div className={classes.card_title}>
        <Classification c12n={result.classification} type="text" inline />
        <span>&nbsp;::&nbsp;{result.response.service_name}&nbsp;</span>
        <Verdict score={result.result.score} mono short size="tiny" />
        <span className={classes.muted}>{` :: ${result.response.service_version}`}</span>
        <span className={classes.muted} style={{ flexGrow: 1 }}>
          &nbsp;{result.response.service_tool_version ? `(${result.response.service_tool_version})` : ''}
        </span>
        <Moment className={classes.muted} fromNow>
          {result.created}
        </Moment>
      </div>
      <div className={classes.content}>
        {result.section_hierarchy.map(item => {
          return (
            <ResultSection
              key={item.id}
              section_list={result.result.sections}
              id={item.id}
              sub_sections={item.children}
              indent={1}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ResultCard;
