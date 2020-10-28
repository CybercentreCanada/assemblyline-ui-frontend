import { Collapse, Divider, Grid, makeStyles, Typography, useTheme } from '@material-ui/core';
import Tag from 'components/visual/Tag';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

type TagSectionProps = {
  tag_group: string;
  tags: any;
  isHighlighted: (key: string) => boolean;
  triggerHighlight: (key: string) => void;
  getKey: (type: string, value: string) => string;
};

const WrappedTagSection: React.FC<TagSectionProps> = ({ tag_group, tags, isHighlighted, triggerHighlight, getKey }) => {
  const { t } = useTranslation(['submissionDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);

  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography variant="h6" onClick={() => setOpen(!open)} className={classes.title}>
        {t(tag_group)}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        {useMemo(
          () => (
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              {Object.keys(tags).map((tag_type, i) => {
                return (
                  <Grid container key={i}>
                    <Grid item xs={12} sm={3} lg={2}>
                      <span style={{ fontWeight: 500 }}>{tag_type}</span>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={10}>
                      {tags[tag_type].map(([value, lvl], idx) => {
                        const key = getKey(tag_type, value);
                        return (
                          <Tag
                            key={idx}
                            value={value}
                            type={tag_type}
                            lvl={lvl}
                            highlighted={isHighlighted(key)}
                            onClick={() => triggerHighlight(key)}
                          />
                        );
                      })}
                    </Grid>
                  </Grid>
                );
              })}
            </div>
          ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [getKey, isHighlighted, tags, triggerHighlight]
        )}
      </Collapse>
    </div>
  );
};

const TagSection = React.memo(WrappedTagSection);

export default TagSection;
