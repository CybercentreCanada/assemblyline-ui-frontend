import { Box, Collapse, makeStyles, useTheme } from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import useAppContext from 'components/hooks/useAppContext';
import useHighlighter from 'components/hooks/useHighlighter';
import Classification from 'components/visual/Classification';
import Verdict from 'components/visual/Verdict';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import ExtractedSection from './ResultCard/extracted';
import { ExtractedFiles } from './ResultCard/extracted_file';
import ResultSection, { Section, SectionItem } from './ResultCard/result_section';
import SupplementarySection from './ResultCard/supplementary';

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

type ResultCardProps = {
  result: Result;
  sid: string | null;
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
    color: theme.palette.text.secondary
  }
}));

export const emptyResult = (result: Result) => {
  return (
    result.result.score === 0 &&
    result.result.sections.length === 0 &&
    result.response.extracted.length === 0 &&
    result.response.supplementary.length === 0
  );
};

const ResultCard: React.FC<ResultCardProps> = ({ result, sid }) => {
  const { t } = useTranslation(['fileDetail']);
  const classes = useStyles();
  const theme = useTheme();
  const sp2 = theme.spacing(2);
  const { settings } = useAppContext();
  const empty = emptyResult(result);
  const [open, setOpen] = React.useState(!empty && result.result.score >= settings.expand_min_score);
  const { getKey, hasHighlightedKeys } = useHighlighter();

  const allTags = useMemo(() => {
    const tagList = [];
    result.result.sections.forEach(section => {
      for (const tag of section.tags) {
        tagList.push(getKey(tag.type, tag.value));
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
          backgroundColor: hasHighlightedKeys(allTags) ? (theme.palette.type === 'dark' ? '#343a44' : '#d8e3ea') : null
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
        {useMemo(
          () =>
            empty ? (
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
                        />
                      );
                    })}
                {result.response.supplementary.length !== 0 && (
                  <SupplementarySection extracted={result.response.supplementary} />
                )}
                {result.response.extracted.length !== 0 && (
                  <ExtractedSection extracted={result.response.extracted} sid={sid} />
                )}
              </div>
            ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [
            empty,
            result.response.extracted,
            result.response.supplementary,
            result.result.sections,
            result.section_hierarchy,
            sid
          ]
        )}
      </Collapse>
    </div>
  );
};

export default ResultCard;
