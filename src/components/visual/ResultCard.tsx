import { makeStyles, useTheme } from '@material-ui/core';
import Classification from 'components/visual/Classification';
import Verdict from 'components/visual/Verdict';
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
    padding: '6px'
  },
  muted: {
    color: theme.palette.text.secondary,
    fontSize: '90%'
  }
}));

type ResultSectionProps = {
  section_list: Section[];
  id: number;
  sub_sections: SectionItem[];
  indent: number;
};

const ResultSection: React.FC<ResultSectionProps> = ({ section_list, id, sub_sections, indent }) => {
  const theme = useTheme();
  const section = section_list[id];

  return (
    <div>
      {section.title_text}
      {sub_sections.map(item => {
        return (
          <div style={{ marginLeft: theme.spacing(indent) }}>
            <ResultSection
              key={item.id}
              section_list={section_list}
              id={item.id}
              sub_sections={item.children}
              indent={indent + 1}
            />
          </div>
        );
      })}
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
