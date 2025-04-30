import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import useHighlighter from 'components/hooks/useHighlighter';
import type { Heuristics } from 'components/models/ui/file';
import Heuristic from 'components/visual/Heuristic';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type HeuristicSectionProps = {
  heuristics: Heuristics;
};

const WrappedHeuristicSection: React.FC<HeuristicSectionProps> = ({ heuristics }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const sp2 = theme.spacing(2);
  const { getKey } = useHighlighter();

  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          '&:hover, &:focus': {
            color: theme.palette.text.secondary
          }
        }}
      >
        <span>{t('heuristics')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        {useMemo(
          () => (
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              {heuristics
                ? Object.keys(heuristics).map((lvl, i) => (
                    <Grid container key={i}>
                      <Grid size={{ xs: 12, sm: 3, lg: 2 }} paddingTop={0.375}>
                        <span style={{ fontWeight: 500, wordBreak: 'break-word' }}>{t(`verdict.${lvl}`)}</span>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 9, lg: 10 }}>
                        {heuristics[lvl].map(([cid, hname], idx) => (
                          <Heuristic
                            key={`${cid}_${idx}`}
                            text={hname}
                            lvl={lvl}
                            highlight_key={getKey('heuristic', cid)}
                          />
                        ))}
                      </Grid>
                    </Grid>
                  ))
                : [...Array(3)].map((_, i) => (
                    <Grid container key={i} spacing={1}>
                      <Grid size={{ xs: 12, sm: 3, lg: 2 }}>
                        <Skeleton style={{ height: '2rem' }} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 9, lg: 10 }}>
                        <Skeleton style={{ height: '2rem' }} />
                      </Grid>
                    </Grid>
                  ))}
            </div>
          ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [heuristics]
        )}
      </Collapse>
    </div>
  );
};

const HeuristicSection = React.memo(WrappedHeuristicSection);
export default HeuristicSection;
