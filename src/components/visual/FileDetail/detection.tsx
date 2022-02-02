import { Box, Collapse, Divider, IconButton, makeStyles, Tooltip, Typography, useTheme } from '@material-ui/core';
import OpenInNewOutlinedIcon from '@material-ui/icons/OpenInNewOutlined';
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import SelectAllOutlinedIcon from '@material-ui/icons/SelectAllOutlined';
import clsx from 'clsx';
import useHighlighter from 'components/hooks/useHighlighter';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Result } from '../ResultCard';
import ResultSection, { Section } from '../ResultCard/result_section';

const HEUR_LEVELS = ['malicious' as 'malicious', 'suspicious' as 'suspicious', 'info' as 'info', 'safe' as 'safe'];

const useStyles = makeStyles(theme => ({
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  },
  heuristic: {
    fontWeight: 500,
    fontSize: 'larger',
    cursor: 'pointer',
    padding: '5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  malicious: {
    color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark,
    backgroundColor: '#f2000025',
    border: `1px solid ${theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark}`,
    '&:hover, &:focus': {
      backgroundColor: '#f2000035'
    }
  },
  suspicious: {
    color: theme.palette.type === 'dark' ? theme.palette.warning.light : theme.palette.warning.dark,
    backgroundColor: '#ff970025',
    border: `1px solid ${theme.palette.type === 'dark' ? theme.palette.warning.light : theme.palette.warning.dark}`,
    '&:hover, &:focus': {
      backgroundColor: '#ff970035'
    }
  },
  info: {
    backgroundColor: '#6e6e6e25',
    border: `1px solid ${theme.palette.divider}`,
    '&:hover, &:focus': {
      backgroundColor: '#6e6e6e35'
    }
  },
  safe: {
    color: theme.palette.type === 'dark' ? theme.palette.success.light : theme.palette.success.dark,
    backgroundColor: '#00f20025',
    border: `1px solid ${theme.palette.type === 'dark' ? theme.palette.success.light : theme.palette.success.dark}`,
    '&:hover, &:focus': {
      backgroundColor: '#00f20035'
    }
  },
  highlighted: {
    color: theme.palette.type === 'dark' ? theme.palette.info.light : theme.palette.primary.main,
    backgroundColor: theme.palette.type === 'dark' ? '#3d485b' : '#cae8f9',
    border: `1px solid ${theme.palette.type === 'dark' ? theme.palette.info.light : theme.palette.info.dark}`,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.type === 'dark' ? '#343a44' : '#e2f2fa'
    }
  }
}));

type WrappedHeuristicProps = {
  name: string;
  id: string;
  sections: Section[];
  level: 'malicious' | 'suspicious' | 'info' | 'safe';
};

const WrappedHeuristic: React.FC<WrappedHeuristicProps> = ({ name, id, sections, level }) => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const { isHighlighted, triggerHighlight, getKey } = useHighlighter();
  const classes = useStyles();

  const highlighted = isHighlighted(getKey('heuristic', id));

  const stopPropagating = useCallback(event => event.stopPropagation(), []);

  const handleHighlight = useCallback(() => triggerHighlight(getKey('heuristic', id)), [triggerHighlight, getKey, id]);

  return (
    <>
      <Box
        className={clsx(classes.heuristic, classes[level], highlighted ? classes.highlighted : null)}
        onClick={() => setOpen(!open)}
      >
        <div>{name}</div>
        <Box onClick={stopPropagating}>
          <Tooltip title={t('related')}>
            <IconButton
              size="small"
              href={`/search/result?query=result.sections.heuristic.heur_id:"${id}"`}
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
        </Box>
      </Box>
      <Collapse in={open || highlighted} timeout="auto">
        {sections &&
          sections.map((section, sid) => (
            <ResultSection key={sid} section_list={sections} id={sid} sub_sections={[]} indent={1} depth={1} />
          ))}
      </Collapse>
    </>
  );
};

type WrappedDetectionProps = {
  heuristics: { [category: string]: string[][] };
  results: Result[];
};

const WrappedDetection: React.FC<WrappedDetectionProps> = ({ heuristics, results }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const [sectionMap, setSectionMap] = React.useState({});
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);

  useEffect(() => {
    const newSectionMap = {};
    if (results) {
      for (const res of results) {
        for (const sec of res.result.sections
          .filter(s => s.heuristic)
          .sort((a, b) => (a.heuristic.score >= b.heuristic.score ? -1 : 1))) {
          if (!newSectionMap.hasOwnProperty(sec.heuristic.heur_id)) {
            newSectionMap[sec.heuristic.heur_id] = [];
          }
          newSectionMap[sec.heuristic.heur_id].push(sec);
        }
      }
    }
    setSectionMap(newSectionMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        {t('heuristics')}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          {sectionMap &&
            heuristics &&
            HEUR_LEVELS.map((lvl, lid) => {
              return heuristics[lvl] ? (
                <div key={lid}>
                  {heuristics[lvl].map(([hid, hname], idx) => {
                    return <WrappedHeuristic key={idx} name={hname} id={hid} sections={sectionMap[hid]} level={lvl} />;
                  })}
                </div>
              ) : null;
            })}
        </div>
      </Collapse>
    </div>
  );
};

const Detection = React.memo(WrappedDetection);
export default Detection;
