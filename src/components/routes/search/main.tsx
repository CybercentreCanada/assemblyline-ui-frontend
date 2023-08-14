import Editor, { loader } from '@monaco-editor/react';
import {
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Popover,
  Theme,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppTheme from 'commons/components/app/hooks/useAppTheme';
import PageFullSize from 'commons/components/pages/PageFullSize';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import CustomChip from 'components/visual/CustomChip';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import AutoSizer from 'react-virtualized-auto-sizer';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

const useStyles = makeStyles((theme: Theme) => ({
  tweaked_tabs: {
    minHeight: 'unset',
    [theme.breakpoints.up('md')]: {
      '& [role=tab]': {
        padding: '8px 20px',
        fontSize: '13px',
        minHeight: 'unset',
        minWidth: 'unset'
      }
    },
    [theme.breakpoints.down('sm')]: {
      minHeight: 'unset',
      '& [role=tab]': {
        fontSize: '12px',
        minHeight: 'unset',
        minWidth: 'unset'
      }
    }
  },
  searchresult: {
    paddingLeft: theme.spacing(1),
    color: theme.palette.primary.main,
    fontStyle: 'italic'
  },
  title: {
    flex: 1,
    fontWeight: 500,
    color: theme.palette.text.primary
  },
  content: {
    flex: 1,
    fontWeight: 400,
    color: theme.palette.primary.main
  },
  launch: {
    color: theme.palette.primary.main,
    transition: 'color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
    '&:hover': {
      color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
    }
  }
}));

type Props = {
  index?: string | null;
};

type ParamProps = {
  id: string;
};

type SearchResults = {
  items: any[];
  offset: number;
  rows: number;
  total: number;
};

const PAGE_SIZE = 25;

const DATA = {
  submission: {},
  file: {},
  result: {},
  signature: {},
  alert: {},
  retrohunt: {}
};

const PERMISSION_MAP = {
  submission: 'submission_view',
  file: 'submission_view',
  result: 'submission_view',
  signature: 'signature_view',
  alert: 'alert_view',
  retrohunt: 'retrohunt_view'
};

type IndexType = 'submission' | 'file' | 'result' | 'signature' | 'alert' | 'retrohunt';

type KeyType = 'boolean' | 'date' | 'float' | 'integer' | 'keyword' | 'object' | 'text';

type Indexes = {
  [index: string]: {
    [key: string]: {
      default?: boolean;
      indexed?: boolean;
      list?: boolean;
      stored?: boolean;
      type?: KeyType;
    };
  };
};
const INDEXES: Array<IndexType> = ['submission', 'file', 'result', 'signature', 'alert', 'retrohunt'];

function AdvancedSearch({ index: indexParam }: Props) {
  const { t, i18n } = useTranslation(['search']);
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { isDark: isDarkTheme } = useAppTheme();
  const { indexes: alIndexes, user: currentUser, configuration } = useALContext();

  const [query, setQuery] = useState<SimpleSearchQuery>(
    new SimpleSearchQuery(location.search, `query=*&rows=${PAGE_SIZE}&offset=0&filters=NOT%20to_be_deleted:true`)
  );
  const [selectedIndex, setSelectedIndex] = useState<IndexType>('submission');
  const [searching, setSearching] = useState<boolean>(false);

  const [response, setResponse] = useState<string>('');

  const queryValue = useRef<string>('');

  const indexes = useMemo<Indexes>(
    () => Object.fromEntries(INDEXES.map(i => [i, alIndexes[i]])) as Indexes,
    [alIndexes]
  );

  const suggestions = useMemo<string[]>(
    () => [
      ...Object.keys(indexes[selectedIndex] || {}).filter(name => indexes[selectedIndex][name].indexed),
      ...DEFAULT_SUGGESTION
    ],
    [indexes, selectedIndex]
  );

  const beautifyJSON = useCallback(inputData => {
    try {
      return JSON.stringify(JSON.parse(inputData), null, 4);
    } catch {
      return inputData;
    }
  }, []);

  useEffect(() => {
    if (i18n.language === 'fr') {
      loader.config({ 'vs/nls': { availableLanguages: { '*': 'fr' } } });
    } else {
      loader.config({ 'vs/nls': { availableLanguages: { '*': '' } } });
    }
  }, [i18n.language]);

  const fetchSearch = useCallback(() => {
    if (!currentUser.roles.includes(PERMISSION_MAP[selectedIndex])) return;
    apiCall({
      method: 'POST',
      url: `/api/v4/search/${selectedIndex}/`,
      body: { ...query.getParams(), rows: PAGE_SIZE, offset: 0 },
      onSuccess: api_data => setResponse(JSON.stringify(api_data.api_response, null, 4))
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.roles, query, selectedIndex]);

  const onFilterValueChange = (inputValue: string) => {
    queryValue.current = inputValue;
  };

  const onClear = () => {
    query.delete('query');
    navigate(`${location.pathname}?${query.toString()}${location.hash}`);
  };

  const onSearch = () => {
    if (queryValue.current !== '') {
      query.set('query', queryValue.current);
      navigate(`${location.pathname}?${query.toString()}${location.hash}`);
    } else {
      onClear();
    }
  };

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const handleIndexClick = useCallback(
    (key: keyof typeof DATA) => (event: React.MouseEvent<any>) => {
      setSelectedIndex(key);
      setAnchorEl(null);
    },
    []
  );

  useEffect(() => {
    fetchSearch();
  }, [fetchSearch]);

  return (
    <PageFullSize>
      <div style={{ paddingBottom: theme.spacing(2), textAlign: 'left', width: '100%' }}>
        <Typography variant="h4">{t(`title_all`)}</Typography>
      </div>
      <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={query ? query.get('query', '') : ''}
            searching={searching}
            placeholder={t(`search_all`)}
            suggestions={suggestions}
            onValueChange={onFilterValueChange}
            onClear={onClear}
            onSearch={onSearch}
            buttons={[]}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: theme.spacing(0.5),
              justifyContent: 'flex-start'
            }}
          >
            <CustomChip
              aria-describedby={id}
              size="medium"
              type="round"
              variant="outlined"
              label={
                <>
                  <span style={{ fontWeight: 700 }}>{'index: '}</span>
                  <span>{selectedIndex}</span>
                </>
              }
              // onClick={handleClick}
            />
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
            >
              <List
                dense
                sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                subheader={<ListSubheader component="div" children="Indices" />}
              >
                {Object.keys(DATA).map((key: keyof typeof DATA) => (
                  <ListItem key={key} disablePadding>
                    <ListItemButton
                      role={undefined}
                      dense
                      selected={key === selectedIndex}
                      onClick={handleIndexClick(key)}
                    >
                      <ListItemText primary={key} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Popover>
          </div>
        </div>
      </PageHeader>
      <Grid item flex={1}>
        <Grid container flexDirection="column" height="100%" minHeight="500px">
          <AutoSizer>
            {({ width, height }) => (
              <Editor
                language="json"
                width={width}
                height={height}
                theme={isDarkTheme ? 'vs-dark' : 'vs'}
                loading={t('loading')}
                value={response}
                options={{ links: false }}
              />
            )}
          </AutoSizer>
        </Grid>
      </Grid>
    </PageFullSize>
  );
}

AdvancedSearch.defaultProps = {};

export default AdvancedSearch;
