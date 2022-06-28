import { Grid, makeStyles } from '@material-ui/core';
import 'moment-timezone';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { DataRow, Feed, formatByte } from '../..';

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
  feed: Feed;
};

const WrappedFeedChannelView: React.FC<Props> = ({ feed = null }) => {
  // const classes = useStyles();
  const { t } = useTranslation(['adminFeeds']);
  const { channel, metadata } = feed;

  return (
    channel && (
      <Grid container spacing={1}>
        <DataRow header={t('channel.title')} hide={channel.title === null} xs={4} sm={3} lg={2}>
          {/* <Link href={feed.metadata.url} target="_blank">
            {channel.title}
          </Link> */}
          {channel.title}
        </DataRow>
        <DataRow header={t('channel.description')} hide={channel.description === null} xs={4} sm={3} lg={2}>
          {channel.description}
        </DataRow>
        <DataRow header={t('channel.link')} hide={channel.link === null} xs={4} sm={3} lg={2}>
          {channel.link}
        </DataRow>
        <DataRow header={t('channel.language')} hide={channel.language === null} xs={4} sm={3} lg={2}>
          {channel.language}
        </DataRow>
        <DataRow header={t('channel.lastBuildDate')} hide={channel.title === null} xs={4} sm={3} lg={2}>
          {channel.lastBuildDate && <Moment date={channel.lastBuildDate} fromNow />}
        </DataRow>
        <DataRow header={t('channel.copyright')} hide={channel.copyright === null} xs={4} sm={3} lg={2}>
          {channel.copyright}
        </DataRow>
        <DataRow header={t('channel.docs')} hide={channel.docs === null} xs={4} sm={3} lg={2}>
          {channel.docs}
        </DataRow>
        <DataRow header={t('metadata.size')} hide={metadata.size === null} xs={4} sm={3} lg={2}>
          {formatByte(metadata.size, 2)}
        </DataRow>
      </Grid>
    )
  );
};

export const FeedChannelView = React.memo(WrappedFeedChannelView);
export default FeedChannelView;
