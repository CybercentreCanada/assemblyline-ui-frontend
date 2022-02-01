import { Collapse, Divider, makeStyles, Typography, useTheme } from '@material-ui/core';
import useHighlighter from 'components/hooks/useHighlighter';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Result } from '../ResultCard';
import ResultSection from '../ResultCard/result_section';

const useStyles = makeStyles(theme => ({
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

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
  const { getKey } = useHighlighter();

  useEffect(() => {
    const newSectionMap = {};
    if (results) {
      for (const res of results) {
        for (const sec of res.result.sections) {
          if (sec.heuristic) {
            if (!newSectionMap.hasOwnProperty(sec.heuristic.heur_id)) {
              newSectionMap[sec.heuristic.heur_id] = [];
            }
            newSectionMap[sec.heuristic.heur_id].push(sec);
          }
        }
      }
    }
    setSectionMap(newSectionMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);
  console.log(heuristics, sectionMap);

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
            ['malicious', 'suspicious', 'info'].map((lvl, lid) => {
              return heuristics[lvl] ? (
                <div key={lid}>
                  {heuristics[lvl].map(([hid, hname], idx) => {
                    return (
                      <div key={idx}>
                        <Typography variant="h4">
                          {hname} ({hid})
                        </Typography>
                        {sectionMap[hid] &&
                          sectionMap[hid].map((section, id) => (
                            <ResultSection
                              key={id}
                              section_list={sectionMap[hid]}
                              id={id}
                              sub_sections={[]}
                              indent={section.depth + 1}
                              depth={section.depth + 1}
                            />
                          ))}
                      </div>
                    );
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
