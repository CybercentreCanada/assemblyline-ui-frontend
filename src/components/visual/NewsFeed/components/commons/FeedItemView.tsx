import { Divider, Grid, Link, makeStyles, useTheme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import 'moment-timezone';
import 'moment/locale/fr';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { FeedItem } from '../..';

const useStyles = makeStyles(theme => ({
  img: {
    objectFit: 'cover',
    width: '100px',
    height: '100px',
    borderRadius: '5px'
  },
  description: {
    '&  a': {
      color: theme.palette.type === 'dark' ? theme.palette.info.dark : theme.palette.info.light,
      textDecoration: 'none'
    }
  },
  divider: {
    '@media print': {
      backgroundColor: '#0000001f !important'
    }
  }
}));

type Props = {
  item: FeedItem;
};

const WrappedFeedItemView: React.FC<Props> = ({ item = null }) => {
  const classes = useStyles();
  const { t } = useTranslation(['adminFeeds']);
  const theme = useTheme();
  const sp1 = theme.spacing(1);

  const description = useRef<HTMLDivElement>(document.createElement('div'));

  useEffect(() => {
    description.current.innerHTML = item.description;
  }, [item]);

  return (
    item && (
      <>
        <Grid container style={{ paddingTop: sp1 }}>
          <Grid item xs={4} sm={3} lg={2}>
            <img className={classes.img} src={item.enclosure.url} alt="" />
          </Grid>
          <Grid item xs={8} sm={9} lg={10}>
            <Typography variant="caption" color="secondary">
              <Moment date={item.pubDate} fromNow />
            </Typography>
            <Link href={item.link} target="_blank">
              <Typography variant="subtitle1" color="primary">
                {item.title}
              </Typography>
            </Link>
            <Typography variant="body2" color="textPrimary">
              <span className={classes.description} dangerouslySetInnerHTML={{ __html: item.description }} />
            </Typography>
          </Grid>
        </Grid>
        <Divider className={classes.divider} variant="fullWidth" />
      </>
    )
  );
};

export const FeedItemView = React.memo(WrappedFeedItemView);
export default FeedItemView;
