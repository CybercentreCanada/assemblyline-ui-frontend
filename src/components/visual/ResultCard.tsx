import {
  Box,
  Button,
  ClickAwayListener,
  Collapse,
  Fade,
  makeStyles,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography,
  useTheme
} from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import useALContext from 'components/hooks/useALContext';
import useHighlighter from 'components/hooks/useHighlighter';
import useMyAPI from 'components/hooks/useMyAPI';
import Classification from 'components/visual/Classification';
import Verdict from 'components/visual/Verdict';
import React, { useEffect, useMemo } from 'react';
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

export type AlternateResult = {
  classification: string;
  created: string;
  drop_file: boolean;
  id: string;
  response: {
    service_name: string;
    service_version: string;
  };
  result: {
    score: number;
  };
};

type ResultCardProps = {
  result: Result;
  sid: string | null;
  alternates?: AlternateResult[] | null;
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

const ResultCard: React.FC<ResultCardProps> = ({ result, sid, alternates = null }) => {
  const { t } = useTranslation(['fileDetail']);
  const classes = useStyles();
  const theme = useTheme();
  const apiCall = useMyAPI();
  const sp2 = theme.spacing(2);
  const { c12nDef, settings } = useALContext();
  const empty = emptyResult(result);
  const [displayedResult, setDisplayedResult] = React.useState<Result>(result);
  const [open, setOpen] = React.useState(!empty && displayedResult.result.score >= settings.expand_min_score);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selected, setSelected] = React.useState(null);
  const { getKey, hasHighlightedKeys } = useHighlighter();
  const popper = Boolean(anchorEl);

  const allTags = useMemo(() => {
    const tagList = [];
    displayedResult.result.sections.forEach(section => {
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
  }, [displayedResult]);

  if (displayedResult.section_hierarchy === undefined) {
    // eslint-disable-next-line no-console
    console.log('[WARNING] Using old rendering method because the section hierarchy is missing...');
  }

  const handleClick = () => {
    setOpen(!open);
  };

  const handlePopperClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  useEffect(() => {
    if (selected !== null) {
      setAnchorEl(null);
      apiCall({
        url: `/api/v4/result/${selected}/`,
        onSuccess: api_data => {
          setDisplayedResult(api_data.api_response);
          setOpen(true);
        }
      });
    } else if (displayedResult !== result) {
      setAnchorEl(null);
      setDisplayedResult(result);
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <div className={classes.card} style={{ marginBottom: sp2 }}>
      <Popper open={popper} anchorEl={anchorEl} placement="bottom-end" transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
                <MenuList dense>
                  <MenuItem disabled={selected === null} onClick={() => setSelected(null)}>
                    <span style={{ paddingRight: theme.spacing(2) }}>
                      {`${result.response.service_version} :: [${result.result.score}]`}
                    </span>
                    <Moment format="YYYY-MM-DD HH:mm:ss">{result.created}</Moment>
                  </MenuItem>
                  {alternates.map(alt => {
                    return (
                      <MenuItem disabled={selected === alt.id} key={alt.id} onClick={() => setSelected(alt.id)}>
                        <span style={{ paddingRight: theme.spacing(2) }}>
                          {`${alt.response.service_version} :: [${alt.result.score}]`}
                        </span>
                        <Moment format="YYYY-MM-DD HH:mm:ss">{alt.created}</Moment>
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
      <Box
        className={classes.card_title}
        onClick={handleClick}
        style={{
          backgroundColor: hasHighlightedKeys(allTags) ? (theme.palette.type === 'dark' ? '#343a44' : '#d8e3ea') : null
        }}
      >
        {c12nDef.enforce && <Classification c12n={displayedResult.classification} type="text" />}
        <span>
          {c12nDef.enforce && <span>&nbsp;::&nbsp;</span>}
          <b>{displayedResult.response.service_name}</b>&nbsp;
        </span>
        {!empty && <Verdict score={displayedResult.result.score} mono short size="tiny" />}
        <small className={classes.muted}>{` :: ${displayedResult.response.service_version.replace(/_/g, '.')}`}</small>
        <small className={classes.muted} style={{ flexGrow: 1 }}>
          &nbsp;{displayedResult.response.service_context ? `(${displayedResult.response.service_context})` : ''}
        </small>
        {!empty && !sid && (
          <div>
            {alternates ? (
              <Button
                className={classes.muted}
                variant="outlined"
                size="small"
                onClick={handlePopperClick}
                style={{ fontSize: 'smaller' }}
              >
                <Moment fromNow>{displayedResult.created}</Moment>
              </Button>
            ) : (
              <Typography
                className={classes.muted}
                variant="button"
                style={{ fontSize: 'smaller', paddingRight: theme.spacing(1.4) }}
              >
                <Moment fromNow>{displayedResult.created}</Moment>
              </Typography>
            )}
          </div>
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
                {displayedResult.section_hierarchy
                  ? displayedResult.section_hierarchy.map(item => {
                      return (
                        <ResultSection
                          key={item.id}
                          section_list={displayedResult.result.sections}
                          id={item.id}
                          sub_sections={item.children}
                          indent={1}
                        />
                      );
                    })
                  : displayedResult.result.sections.map((section, id) => {
                      return (
                        <ResultSection
                          key={id}
                          section_list={displayedResult.result.sections}
                          id={id}
                          sub_sections={[]}
                          indent={section.depth}
                          depth={section.depth}
                        />
                      );
                    })}
                {displayedResult.response.supplementary.length !== 0 && (
                  <SupplementarySection extracted={displayedResult.response.supplementary} />
                )}
                {displayedResult.response.extracted.length !== 0 && (
                  <ExtractedSection extracted={displayedResult.response.extracted} sid={sid} />
                )}
              </div>
            ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [
            empty,
            displayedResult.response.extracted,
            displayedResult.response.supplementary,
            displayedResult.result.sections,
            displayedResult.section_hierarchy,
            sid
          ]
        )}
      </Collapse>
    </div>
  );
};

export default ResultCard;
