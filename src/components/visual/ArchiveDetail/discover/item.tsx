import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Collapse, IconButton, Tooltip, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { FileInfo } from 'components/visual/ArchiveDetail';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import { safeFieldValue } from 'helpers/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DiscoverFile from './file';

const OPEN_CLASS = 'open';
const PAGE_SIZE = 10;
const DEFAULT_PARAMS = {
  query: null,
  offset: 0,
  rows: PAGE_SIZE,
  sort: 'seen.last+desc',
  fl: 'seen.last,seen.count,sha256,type,size,classification,from_archive'
};

const DEFAULT_QUERY: string = Object.keys(DEFAULT_PARAMS)
  .map(k => `${k}=${DEFAULT_PARAMS[k]}`)
  .join('&');

const useStyles = makeStyles(theme => {
  const options = {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shortest
  };

  return {
    sp2: {
      paddingBottom: theme.spacing(2),
      paddingTop: theme.spacing(2)
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      '&:hover, &:focus': {
        color: theme.palette.text.secondary
      }
    },
    labels: {
      display: 'flex',
      alignItems: 'center'
    },
    item: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: theme.spacing(0.5)
    },
    icon: {
      transform: 'rotate(0deg)',
      transition: theme.transitions.create(['all'], options),
      [`&.${OPEN_CLASS}`]: {
        transform: 'rotate(90deg)'
      }
    },
    name: {},
    type: {
      fontSize: '80%',
      color: theme.palette.text.secondary
    },
    container: {
      display: 'flex',
      flexDirection: 'column'
    },
    button: {
      padding: 0
    }
  };
});

type SearchResults = {
  items: FileInfo[];
  offset: number;
  rows: number;
  total: number;
};

type SectionProps = {
  title: string;
  secondary: string;
  search: string;
  depth?: number;
  previous?: string[];
};

const WrappedDiscoverItem: React.FC<SectionProps> = ({ search, title, secondary, depth = 0, previous = [] }) => {
  const { t } = useTranslation(['fileDetail']);
  const classes = useStyles();
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { showErrorMessage } = useMySnackbar();
  const { user: currentUser } = useALContext();

  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const [fileResults, setFileResults] = useState<SearchResults>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);

  const handleReload = useCallback(
    (curQuery: SimpleSearchQuery) => {
      if (!curQuery || !currentUser.roles.includes('file_detail')) return;
      apiCall({
        url: `/api/v4/search/file/`,
        method: 'POST',
        body: {
          ...curQuery.getParams(),
          filters: curQuery.getAll('filters', [])
        },
        onSuccess: api_data => setFileResults(api_data.api_response),
        onFailure: api_data => showErrorMessage(api_data.api_error_message),
        onEnter: () => setLoading(true),
        onExit: () => setLoading(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.roles]
  );

  useEffect(() => {
    if (!search) return;
    let q = new SimpleSearchQuery(``, DEFAULT_QUERY);
    if (search) q.add('query', search);
    if (previous) q.add('filters', `NOT(sha256:${previous.join(' OR ')})`);
    setQuery(q);
  }, [previous, search]);

  useEffect(() => {
    handleReload(query);
  }, [handleReload, query]);

  return (
    fileResults && (
      <>
        <div className={classes.item} style={{ paddingLeft: `calc(${depth} * ${theme.spacing(2)})` }}>
          <Tooltip title={t('tree_more')} placement="left">
            <IconButton className={classes.button} size="small" onClick={() => setOpen(o => !o)}>
              <ArrowRightIcon className={clsx(classes.icon, open && OPEN_CLASS)} />
            </IconButton>
          </Tooltip>
          <span className={classes.name}>{`${title}`}</span>
          <span className={classes.type}>{`[${secondary}]`}</span>
          <span className={classes.type}>{`[${fileResults.total}]`}</span>
        </div>

        <Collapse in={open} timeout="auto">
          {fileResults?.items?.map((file, i) => (
            <DiscoverFile
              key={i}
              sha256={file.sha256}
              depth={depth + 1}
              previous={[...previous, ...fileResults.items.map(f => f.sha256)]}
            />
          ))}
        </Collapse>
      </>
    )
  );
};

export const DiscoverItem = React.memo(WrappedDiscoverItem);
export default DiscoverItem;
