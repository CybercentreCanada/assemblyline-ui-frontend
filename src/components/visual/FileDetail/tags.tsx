import { Collapse, Divider, Grid, makeStyles, Typography, useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import useHighlighter from 'components/hooks/useHighlighter';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Heuristic from '../Heuristic';
import Tag from '../Tag';

const useStyles = makeStyles(theme => ({
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  },
  meta_key: {
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
}));

type TagSectionProps = {
  signatures: any;
  tags: any;
  force?: boolean;
};

const WrappedTagSection: React.FC<TagSectionProps> = ({ signatures, tags, force = false }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const { getKey } = useHighlighter();

  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        {t('generated_tags')}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        {useMemo(
          () => (
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              {signatures && signatures.length !== 0 && (
                <Grid container>
                  <Grid className={classes.meta_key} item xs={12} sm={3} lg={2}>
                    <span style={{ fontWeight: 500 }}>heuristic.signature</span>
                  </Grid>
                  <Grid item xs={12} sm={9} lg={10}>
                    {signatures.map(([value, lvl, safe], idx) => (
                      <Heuristic
                        key={idx}
                        signature
                        text={value}
                        lvl={lvl}
                        highlight_key={getKey('heuristic.signature', value)}
                        safe={safe}
                        force={force}
                      />
                    ))}
                  </Grid>
                </Grid>
              )}
              {tags
                ? Object.keys(tags).map((tag_type, i) => (
                    <Grid container key={i}>
                      <Grid className={classes.meta_key} item xs={12} sm={3} lg={2}>
                        <span
                          style={{
                            fontWeight: 500
                          }}
                        >
                          {tag_type}
                        </span>
                      </Grid>
                      <Grid item xs={12} sm={9} lg={10}>
                        {tags[tag_type].map(([value, lvl, safelisted], idx) => (
                          <Tag
                            key={idx}
                            value={value}
                            type={tag_type}
                            safelisted={safelisted}
                            lvl={lvl}
                            highlight_key={getKey(tag_type, value)}
                            force={force}
                          />
                        ))}
                      </Grid>
                    </Grid>
                  ))
                : [...Array(3)].map((_, i) => (
                    <Grid container key={i} spacing={1}>
                      <Grid item xs={12} sm={3} lg={2}>
                        <Skeleton style={{ height: '2rem' }} />
                      </Grid>
                      <Grid item xs={12} sm={9} lg={10}>
                        <Skeleton style={{ height: '2rem' }} />
                      </Grid>
                    </Grid>
                  ))}
            </div>
          ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [signatures, tags]
        )}
      </Collapse>
    </div>
  );
};

const TagSection = React.memo(WrappedTagSection);
export default TagSection;
