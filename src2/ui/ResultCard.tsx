import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  Box,
  Button,
  ClickAwayListener,
  Collapse,
  Fade,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography,
  useTheme
} from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import useHighlighter from 'components/hooks/useHighlighter';
import useMyAPI from 'components/hooks/useMyAPI';
import useSafeResults from 'components/hooks/useSafeResults';
import type { AlternateResult, FileResult } from 'components/models/base/result';
import Classification from 'components/visual/Classification';
import Moment from 'components/visual/Moment';
import ExtractedSection from 'components/visual/ResultCard/extracted';
import ResultSection from 'components/visual/ResultCard/result_section';
import SupplementarySection from 'components/visual/ResultCard/supplementary';
import Verdict from 'components/visual/Verdict';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const emptyResult = (result: FileResult) =>
  result.result.score === 0 &&
  result.result.sections.length === 0 &&
  result.response.extracted.length === 0 &&
  result.response.supplementary.length === 0;

type Props = {
  result: FileResult;
  sid: string | null;
  alternates?: AlternateResult[] | null;
  force?: boolean;
};

const WrappedResultCard: React.FC<Props> = ({ result, sid, alternates = null, force = false }) => {
  const { t } = useTranslation(['fileDetail']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const sp2 = theme.spacing(2);
  const { c12nDef, settings } = useALContext();
  const empty = emptyResult(result);
  const [displayedResult, setDisplayedResult] = useState<FileResult>(result);
  const [open, setOpen] = useState<boolean>(!empty && displayedResult.result.score >= settings.expand_min_score);
  const [render, setRender] = useState<boolean>(!empty && displayedResult.result.score >= settings.expand_min_score);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<string>(null);
  const { getKey, hasHighlightedKeys } = useHighlighter();
  const { showSafeResults } = useSafeResults();
  const popper = Boolean(anchorEl);

  const allTags = useMemo(() => {
    const tagList = [];
    displayedResult.result.sections.forEach(section => {
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

  return displayedResult.result.score < 0 && !showSafeResults && !force ? null : (
    <div
      style={{
        marginBottom: sp2,
        backgroundColor: theme.palette.background.default,
        border: `solid 1px ${theme.palette.mode === 'dark' ? '#393939' : '#ddd'}`,
        borderRadius: '4px'
      }}
    >
      <Popper
        open={popper}
        anchorEl={anchorEl}
        placement="bottom-end"
        transition
        sx={{ zIndex: theme.zIndex.drawer + 1 }}
      >
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
                  {alternates.map(alt => (
                    <MenuItem disabled={selected === alt.id} key={alt.id} onClick={() => setSelected(alt.id)}>
                      <span style={{ paddingRight: theme.spacing(2) }}>
                        {`${alt.response.service_version} :: [${alt.result.score}]`}
                      </span>
                      <Moment format="YYYY-MM-DD HH:mm:ss">{alt.created}</Moment>
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
      <Box
        onClick={handleClick}
        sx={{
          backgroundColor: theme.palette.mode === 'dark' ? '#393939' : '#f0f0f0',
          padding: '6px',
          borderRadius: '4px 4px 0px 0px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? '#505050' : '#e6e6e6',
            cursor: 'pointer'
          }
        }}
        style={{
          backgroundColor: hasHighlightedKeys(allTags) ? (theme.palette.mode === 'dark' ? '#343a44' : '#d8e3ea') : null
        }}
      >
        {c12nDef.enforce && <Classification c12n={displayedResult.classification} type="text" />}
        <span>
          {c12nDef.enforce && <span>&nbsp;::&nbsp;</span>}
          <b>{displayedResult.response.service_name}</b>&nbsp;
        </span>
        {!empty && <Verdict score={displayedResult.result.score} mono short size="tiny" />}
        <small style={{ color: theme.palette.text.secondary }}>
          {` :: ${displayedResult.response.service_version.replace(/_/g, '.')}`}
        </small>
        <small style={{ flexGrow: 1, color: theme.palette.text.secondary }}>
          &nbsp;{displayedResult.response.service_context ? `(${displayedResult.response.service_context})` : ''}
        </small>
        {!empty && !sid && (
          <div>
            {alternates ? (
              <Button
                variant="outlined"
                size="small"
                onClick={handlePopperClick}
                style={{ fontSize: 'smaller', color: theme.palette.text.secondary }}
              >
                <Moment variant="fromNow">{displayedResult.created}</Moment>
              </Button>
            ) : (
              <Typography
                variant="button"
                style={{ fontSize: 'smaller', paddingRight: theme.spacing(1.4), color: theme.palette.text.secondary }}
              >
                <Moment variant="fromNow">{displayedResult.created}</Moment>
              </Typography>
            )}
          </div>
        )}
        {open ? (
          <ExpandLess sx={{ color: theme.palette.text.secondary }} />
        ) : (
          <ExpandMore sx={{ color: theme.palette.text.secondary }} />
        )}
      </Box>
      <Collapse in={open} timeout="auto" onEnter={() => setRender(true)}>
        {empty ? (
          <div style={{ padding: '6px', color: theme.palette.text.secondary }}>{t('nothing_to_report')}</div>
        ) : (
          render && (
            <div style={{ padding: '6px' }}>
              {displayedResult.section_hierarchy
                ? displayedResult.section_hierarchy.map(item => (
                    <ResultSection
                      key={`section_${item.id}`}
                      section={displayedResult.result.sections[item.id]}
                      section_list={displayedResult.result.sections}
                      sub_sections={item.children}
                      indent={1}
                      force={force}
                    />
                  ))
                : displayedResult.result.sections.map((section, id) => (
                    <ResultSection
                      key={`section_${id}`}
                      section={displayedResult.result.sections[id]}
                      section_list={displayedResult.result.sections}
                      sub_sections={[]}
                      indent={section.depth + 1}
                      depth={section.depth + 1}
                      force={force}
                    />
                  ))}
              {displayedResult.response.supplementary.filter(item => !item.is_section_image).length !== 0 && (
                <SupplementarySection supplementary={displayedResult.response.supplementary} sid={sid} />
              )}
              {displayedResult.response.extracted.length !== 0 && (
                <ExtractedSection extracted={displayedResult.response.extracted} sid={sid} />
              )}
            </div>
          )
        )}
      </Collapse>
    </div>
  );
};

const ResultCard = React.memo(WrappedResultCard);
export default ResultCard;
