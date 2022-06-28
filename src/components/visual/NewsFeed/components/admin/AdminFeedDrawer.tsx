import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  Grid,
  GridSize,
  IconButton,
  makeStyles,
  TextField,
  useTheme
} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import 'moment-timezone';
import 'moment/locale/fr';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_FEED, Feed, FeedChannelView, FeedItemView, useDelayedEffect, useNewsFeed } from '../..';

const useStyles = makeStyles(theme => ({
  searchresult: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  },
  drawerPaper: {
    width: '80%',
    maxWidth: '800px',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  result_section: {
    minWidth: '50%',
    flexGrow: 1
  },
  section_title: {
    marginTop: theme.spacing(4),
    pageBreakAfter: 'avoid',
    pageBreakInside: 'avoid'
  },
  section_content: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    pageBreakBefore: 'avoid',
    pageBreakInside: 'avoid'
  },
  section: {
    pageBreakInside: 'avoid'
  },
  divider: {
    '@media print': {
      backgroundColor: '#0000001f !important'
    }
  }
}));

type DataRowProps = {
  header: string;
  data: string | any;
  xs: boolean | GridSize;
  sm: boolean | GridSize;
  lg: boolean | GridSize;
};

const WrappedDataRow: React.FC<DataRowProps> = ({ header = '', data = null, xs = 2, sm = 2, lg = 2 }) => {
  const inverse = useCallback(
    (value: boolean | GridSize): boolean | GridSize =>
      (typeof value === 'number' ? 12 - value : value) as boolean | GridSize,
    []
  );

  return (
    data && (
      <>
        <Grid item xs={xs} sm={sm} lg={lg}>
          <span style={{ fontWeight: 500 }}>{header}</span>
        </Grid>
        <Grid item xs={inverse(xs)} sm={inverse(sm)} lg={inverse(lg)} style={{ wordBreak: 'break-word' }}>
          {data}
        </Grid>
      </>
    )
  );
};

const DataRow = React.memo(WrappedDataRow);

export type AdminFeedDrawerHandle = {
  add: () => void;
  edit: (url: string, index: number) => void;
};

type Props = {
  onCloseDrawer?: () => void;
};

const WrappedAdminFeedDrawer: React.ForwardRefRenderFunction<AdminFeedDrawerHandle, Props> = (
  { onCloseDrawer = () => null },
  ref
) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t, i18n } = useTranslation(['adminFeeds']);
  const { onFetchFeed, onAddFeed, onUpdateFeed, onRemoveFeed } = useNewsFeed();

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerType, setDrawerType] = useState<'add' | 'edit'>('add');

  const [feedURL, setFeedURL] = useState<string>('https://ici.radio-canada.ca/rss/4159');
  const [feedIndex, setFeedIndex] = useState<number>(-1);
  const [feed, setFeed] = useState<Feed>({ ...DEFAULT_FEED });
  const [error, setError] = useState<{ value: boolean; message: string }>({ value: false, message: '' });
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const handleSearchChange = useCallback(() => {
    setIsSearching(true);
    setError({ value: false, message: '' });
  }, []);

  const handleFetch = useCallback(() => {
    setIsSearching(true);
    setFeed({ ...DEFAULT_FEED });
    onFetchFeed(feedURL).then(f => {
      setFeed(f);
      setIsSearching(false);
    });
  }, [feedURL, onFetchFeed]);

  useEffect(() => {
    if (feed.metadata.status === 200) setError({ value: false, message: '' });
    else if (feed.metadata.status === 400) setError({ value: true, message: t('error.invalid') });
    else if (feed.metadata.status === 404) setError({ value: true, message: t('error.not-found') });
    else if (feed.metadata.status === 502) setError({ value: true, message: t('error.unreachable') });
    else if (feed.metadata.status === 415) setError({ value: true, message: t('error.format') });
    else if (feed.metadata.status === 413) setError({ value: true, message: t('error.size') });
  }, [t, feed]);

  useDelayedEffect(
    () => handleSearchChange(),
    () => handleFetch(),
    [feedURL],
    250
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    onCloseDrawer();
  }, [onCloseDrawer]);

  useImperativeHandle(ref, () => ({
    add: () => {
      setIsDrawerOpen(true);
      setDrawerType('add');
      setFeedURL('https://ici.radio-canada.ca/rss/4159');
      setFeedIndex(-1);
    },
    edit: (url: string, index: number = -1) => {
      setIsDrawerOpen(true);
      setDrawerType('edit');
      setFeedURL(url);
      setFeedIndex(index);
    }
  }));

  const handleAddFeed = useCallback(() => {
    onAddFeed(feed);
    handleCloseDrawer();
  }, [feed, handleCloseDrawer, onAddFeed]);

  const handleUpdateFeed = useCallback(() => {
    onUpdateFeed(feed, feedIndex);
    handleCloseDrawer();
  }, [feed, feedIndex, handleCloseDrawer, onUpdateFeed]);

  const handleRemoveFeed = useCallback(() => {
    onRemoveFeed(feedIndex);
    handleCloseDrawer();
  }, [feedIndex, handleCloseDrawer, onRemoveFeed]);

  return (
    <Drawer anchor="right" classes={{ paper: classes.drawerPaper }} open={isDrawerOpen} onClose={handleCloseDrawer}>
      <div id="drawerTop" style={{ padding: theme.spacing(1) }}>
        <IconButton onClick={handleCloseDrawer}>
          <CloseOutlinedIcon />
        </IconButton>
      </div>
      <div style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
        <Box mb={3}>
          {drawerType === 'add' && <Typography variant="h5">{t('add.title')}</Typography>}
          {drawerType === 'edit' && <Typography variant="h5">{t('edit.title')}</Typography>}
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <Typography variant="caption">{t('add.url')}</Typography>
            <TextField
              error={error.value}
              helperText={error.message}
              fullWidth
              size="small"
              margin="dense"
              variant="outlined"
              onChange={event => setFeedURL(event.target.value)}
              value={feedURL}
            />
          </Grid>
        </Grid>
        <Box my={2} textAlign="left">
          {drawerType === 'add' && (
            <Button
              disabled={feedURL === null || feedURL === '' || isSearching || error.value}
              variant="contained"
              color="primary"
              onClick={handleAddFeed}
            >
              {t('add.save')}
              {isSearching && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          )}
          {drawerType === 'edit' && (
            <>
              <Button
                style={{ marginRight: theme.spacing(2) }}
                disabled={feedURL === null || feedURL === '' || isSearching || error.value}
                variant="contained"
                color="primary"
                onClick={handleUpdateFeed}
              >
                {t('update.save')}
                {isSearching && <CircularProgress size={24} className={classes.buttonProgress} />}
              </Button>
              <Button variant="contained" color="secondary" onClick={handleRemoveFeed}>
                {t('remove.save')}
                {isSearching && <CircularProgress size={24} className={classes.buttonProgress} />}
              </Button>
            </>
          )}
        </Box>

        {!(feedURL === null || feedURL === '' || isSearching || error.value) && (
          <>
            <div className={classes.section}>
              <div className={classes.section_title}>
                <Typography variant="h6">{t('channel.information')}</Typography>
                <Divider className={classes.divider} />
              </div>
              <div className={classes.section_content}>
                <FeedChannelView feed={feed} />
              </div>
            </div>

            <div className={classes.section}>
              <div className={classes.section_title}>
                <Typography variant="h6">{t('item.information')}</Typography>
                <Divider className={classes.divider} />
              </div>
              <div className={classes.section_content}>
                {feed.items.map((item, i) => (
                  <FeedItemView key={'item-' + i} item={item} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
};

// export const AdminFeedDrawer = forwardRef(WrappedAdminFeedDrawer);
export const AdminFeedDrawer = React.memo(forwardRef(WrappedAdminFeedDrawer));
export default AdminFeedDrawer;
