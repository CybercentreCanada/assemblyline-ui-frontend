import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SelectAllOutlinedIcon from '@mui/icons-material/SelectAllOutlined';
import { Collapse, Divider, IconButton, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useHighlighter from 'components/hooks/useHighlighter';
import useSafeResults from 'components/hooks/useSafeResults';
import { safeFieldValueURI } from 'helpers/utils';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Result } from '../ResultCard';
import ResultSection, { Section } from '../ResultCard/result_section';

const HEUR_LEVELS = ['malicious' as 'malicious', 'suspicious' as 'suspicious', 'info' as 'info', 'safe' as 'safe'];
const DEFAULT_SEC_SCORE = -1000;
const SCORE_SHOW_THRESHOLD = 0;

const useStyles = makeStyles(theme => ({
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  },
  header: {
    fontWeight: 500,
    fontSize: 'larger',
    cursor: 'pointer',
    padding: '5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  header_malicious: {
    color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark,
    backgroundColor: '#f2000025',
    '&:hover, &:focus': {
      backgroundColor: '#f2000035'
    }
  },
  header_suspicious: {
    color: theme.palette.mode === 'dark' ? theme.palette.warning.light : theme.palette.warning.dark,
    backgroundColor: '#ff970025',
    '&:hover, &:focus': {
      backgroundColor: '#ff970035'
    }
  },
  header_info: {
    backgroundColor: '#6e6e6e25',
    '&:hover, &:focus': {
      backgroundColor: '#6e6e6e35'
    }
  },
  header_safe: {
    color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark,
    backgroundColor: '#00f20025',
    '&:hover, &:focus': {
      backgroundColor: '#00f20035'
    }
  },
  container: {
    borderRadius: theme.spacing(0.5),
    marginBottom: theme.spacing(0.25),
    overflow: 'hidden'
  },
  container_malicious: {
    border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark}`
  },
  container_suspicious: {
    border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.warning.light : theme.palette.warning.dark}`
  },
  container_info: {
    border: `1px solid ${theme.palette.divider}`
  },
  container_safe: {
    border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark}`
  },
  container_highlight: {
    border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.info.light : theme.palette.info.dark}`
  },
  highlighted: {
    color: theme.palette.mode === 'dark' ? theme.palette.info.light : theme.palette.primary.main,
    backgroundColor: theme.palette.mode === 'dark' ? '#3d485b' : '#cae8f9',
    '&:hover, &:focus': {
      backgroundColor: theme.palette.mode === 'dark' ? '#343a44' : '#e2f2fa'
    }
  }
}));

type WrappedHeuristicProps = {
  name: string;
  id: string;
  sections: Section[];
  level: 'malicious' | 'suspicious' | 'info' | 'safe';
  force?: boolean;
};

const WrappedHeuristic: React.FC<WrappedHeuristicProps> = ({ name, id, sections, level, force = false }) => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [render, setRender] = React.useState(false);
  const { isHighlighted, triggerHighlight, getKey } = useHighlighter();
  const classes = useStyles();
  const theme = useTheme();
  const { showSafeResults } = useSafeResults();

  const highlighted = isHighlighted(getKey('heuristic', id));

  const stopPropagating = useCallback(event => event.stopPropagation(), []);

  const handleHighlight = useCallback(() => triggerHighlight(getKey('heuristic', id)), [triggerHighlight, getKey, id]);

  return level === 'safe' && !showSafeResults && !force ? null : (
    <div
      className={clsx(
        classes.container,
        classes[`container_${level}`],
        highlighted ? classes.container_highlight : null
      )}
    >
      <div
        className={clsx(classes.header, classes[`header_${level}`], highlighted ? classes.highlighted : null)}
        onClick={() => setOpen(!open)}
      >
        <div>
          {name} <span style={{ fontSize: 'small' }}>({id})</span>
        </div>
        <div onClick={stopPropagating} style={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 0 }}>
          <Tooltip title={t('related')}>
            <IconButton
              size="small"
              href={`/search/result?query=result.sections.heuristic.heur_id:${safeFieldValueURI(id)}`}
              color="inherit"
            >
              <SearchOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('highlight')}>
            <IconButton size="small" onClick={handleHighlight} color="inherit">
              <SelectAllOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('goto_heuristic')}>
            <IconButton size="small" href={`/manage/heuristic/${id}`} color="inherit">
              <OpenInNewOutlinedIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <Collapse in={open} timeout="auto" style={{ marginRight: theme.spacing(0.5) }} onEnter={() => setRender(true)}>
        {sections &&
          render &&
          sections.map((section, sid) => (
            <div key={sid}>
              <ResultSection section={section} indent={1} depth={1} force={force} />
            </div>
          ))}
      </Collapse>
    </div>
  );
};

const Heuristic = React.memo(WrappedHeuristic);

type WrappedDetectionProps = {
  heuristics: { [category: string]: string[][] };
  results?: Result[];
  section_map?: { [heur_id: string]: Section[] };
  force?: boolean;
};

const WrappedDetection: React.FC<WrappedDetectionProps> = ({
  heuristics,
  results,
  section_map = null,
  force = false
}) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const [sectionMap, setSectionMap] = React.useState({});
  const [maxScore, setMaxScore] = React.useState(DEFAULT_SEC_SCORE);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const { showSafeResults } = useSafeResults();

  useEffect(() => {
    if (results) {
      let newMaxScore = DEFAULT_SEC_SCORE;
      const newSectionMap = {};
      for (const res of results) {
        for (const sec of res.result.sections
          .filter(s => s.heuristic)
          .sort((a, b) => (a.heuristic.score <= b.heuristic.score ? 1 : -1))) {
          if (!newSectionMap.hasOwnProperty(sec.heuristic.heur_id)) {
            newSectionMap[sec.heuristic.heur_id] = [];
          }
          if (sec.heuristic.score > newMaxScore) {
            newMaxScore = sec.heuristic.score;
          }
          newSectionMap[sec.heuristic.heur_id].push(sec);
        }
      }
      setSectionMap(newSectionMap);
      setMaxScore(newMaxScore);
    }
  }, [results]);

  useEffect(() => {
    if (section_map) {
      let newMaxScore = DEFAULT_SEC_SCORE;
      for (const heurId of Object.keys(section_map)) {
        for (const sec of section_map[heurId]) {
          if (sec.heuristic.score >= SCORE_SHOW_THRESHOLD) {
            newMaxScore = sec.heuristic.score;
            break;
          }
        }
        if (newMaxScore >= SCORE_SHOW_THRESHOLD) {
          break;
        }
      }
      setSectionMap(section_map);
      setMaxScore(newMaxScore);
    }
  }, [section_map]);

  return (heuristics && Object.keys(heuristics).length === 0) ||
    (heuristics && maxScore < SCORE_SHOW_THRESHOLD && !showSafeResults && !force) ? null : (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        <span>{t('heuristics')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          {sectionMap && heuristics
            ? HEUR_LEVELS.map((lvl, lid) => {
                return heuristics[lvl] ? (
                  <div key={lid}>
                    {heuristics[lvl].map(([hid, hname], idx) => {
                      return (
                        <div key={idx}>
                          <Heuristic name={hname} id={hid} sections={sectionMap[hid]} level={lvl} force={force} />
                        </div>
                      );
                    })}
                  </div>
                ) : null;
              })
            : [...Array(3)].map((_, i) => <Skeleton key={i} style={{ height: '3rem' }} />)}
        </div>
      </Collapse>
    </div>
  );
};

const Detection = React.memo(WrappedDetection);
export default Detection;
