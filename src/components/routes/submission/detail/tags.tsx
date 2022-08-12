import { Collapse, Divider, Grid, makeStyles, Typography, useTheme } from '@material-ui/core';
import useHighlighter from 'components/hooks/useHighlighter';
import useSafeResults from 'components/hooks/useSafeResults';
import Tag from 'components/visual/Tag';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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
  tag_group: string;
  tags: any;
  force?: boolean;
};

const WrappedTagSection: React.FC<TagSectionProps> = ({ tag_group, tags, force = false }) => {
  const { t } = useTranslation(['submissionDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const { getKey } = useHighlighter();
  const { showSafeResults } = useSafeResults();
  const [tagUnsafeMap, setTagUnsafeMap] = React.useState({});

  useEffect(() => {
    if (tags) {
      const newTagUnsafeMap = {};
      for (const tType of Object.keys(tags)) {
        newTagUnsafeMap[tType] = tags[tType].some(i => i[1] !== 'safe' && !i[2]);
      }
      setTagUnsafeMap(newTagUnsafeMap);
    }
  }, [tags]);

  const someTagNotSafe = Object.values(tagUnsafeMap).some(Boolean);
  const forceShowTag = Object.keys(tagUnsafeMap).length !== 0 && (showSafeResults || force);

  return someTagNotSafe || forceShowTag ? (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography variant="h6" onClick={() => setOpen(!open)} className={classes.title}>
        {t(tag_group)}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          {Object.keys(tags).map((tag_type, i) =>
            tagUnsafeMap[tag_type] || showSafeResults || force ? (
              <Grid container key={i}>
                <Grid className={classes.meta_key} item xs={12} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{tag_type}</span>
                </Grid>
                <Grid item xs={12} sm={9} lg={10}>
                  {tags[tag_type].map(([value, lvl, safelisted], idx) => (
                    <Tag
                      key={idx}
                      value={value}
                      safelisted={safelisted}
                      type={tag_type}
                      lvl={lvl}
                      highlight_key={getKey(tag_type, value)}
                      force={force}
                    />
                  ))}
                </Grid>
              </Grid>
            ) : null
          )}
        </div>
      </Collapse>
    </div>
  ) : null;
};

const TagSection = React.memo(WrappedTagSection);

export default TagSection;
