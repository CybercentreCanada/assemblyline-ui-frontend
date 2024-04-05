import { Box, Divider, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import SearchBar from 'components/visual/SearchBar/search-bar';
import SearchQuery from 'components/visual/SearchBar/search-query';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import ForbiddenPage from './403';
import AlertDefaultSearchParameters from './alerts2/components/DefaultSearchParameters';
import { AlertFavorites } from './alerts2/components/Favorites';
import AlertFilters from './alerts2/components/Filters';
import ALertList from './alerts2/components/List';
import { AlertSorts } from './alerts2/components/Sorts';
import AlertWorkflows from './alerts2/components/Workflows';
import AlertDetail2 from './alerts2/detail';

const useStyles = makeStyles(theme => ({
  pageTitle: {
    paddingBottom: theme.spacing(3)
  },
  drawerInner: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    width: '600px',
    [theme.breakpoints.only('xs')]: {
      width: '100vw'
    }
  },
  searchresult: {
    marginTop: theme.spacing(1),
    fontStyle: 'italic',
    minHeight: theme.spacing(3)
  },
  modeToggler: {
    border: 'none',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginRight: '0px !important'
  },
  preview: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    columnGap: theme.spacing(1),
    margin: 0,
    padding: theme.spacing(0.75, 1),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  dialogPaper: {
    maxWidth: '850px'
  },
  dialogContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(2),
    '@media (max-width:850px)': {
      gridTemplateColumns: '1fr'
    }
  },
  dialogDescription: {
    gridColumn: 'span 2',
    '@media (max-width:850px)': {
      gridColumn: 'span 1'
    }
  }
}));

export const DEFAULT_PARAMS = {
  offset: 0,
  rows: 50,
  tc: '4d',
  group_by: 'file.sha256',
  sort: 'reporting_ts desc'
} as const;

export const DEFAULT_QUERY: string = Object.keys(DEFAULT_PARAMS)
  .map(k => `${k}=${DEFAULT_PARAMS[k]}`)
  .join('&');

const WrappedAlertsPage = () => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { showSuccessMessage } = useMySnackbar();
  const { globalDrawerOpened, setGlobalDrawer } = useDrawer();

  const [searchQuery, setSearchQuery] = useState<SearchQuery>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const upMD = useMediaQuery(theme.breakpoints.up('md'));

  const suggestions = useMemo<string[]>(
    () =>
      'alert' in indexes
        ? [...Object.keys(indexes.alert).map(name => name), ...DEFAULT_SUGGESTION]
        : DEFAULT_SUGGESTION,
    [indexes]
  );

  const handleClear = useCallback(() => {}, []);

  const handleValueChange = useCallback(() => {}, []);

  const handleSearch = useCallback(() => {}, []);

  useEffect(() => {
    if (!globalDrawerOpened && location.hash) {
      navigate(`${location.pathname}${location.search ? location.search : ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (location.hash) {
      setGlobalDrawer(<AlertDetail2 id={location.hash.substr(1)} inDrawer />, { hasMaximize: true });
    }
  }, [location.hash, setGlobalDrawer]);

  if (!currentUser.roles.includes('alert_view')) return <ForbiddenPage />;
  else
    return (
      <PageFullWidth margin={4}>
        <Grid container alignItems="center" paddingBottom={2}>
          <Grid item xs>
            <Typography variant="h4">{t('alerts')}</Typography>
          </Grid>

          <Grid item xs style={{ textAlign: 'right', flex: 0 }}>
            <AlertDefaultSearchParameters />
          </Grid>
        </Grid>
        <PageHeader isSticky>
          <div style={{ paddingTop: theme.spacing(1) }}>
            <SearchBar
              initValue={searchQuery ? searchQuery.getQuery() : ''}
              searching={loading}
              suggestions={suggestions}
              placeholder={t('search.placeholder')}
              onValueChange={handleValueChange}
              onClear={handleClear}
              onSearch={handleSearch}
              extras={
                <>
                  <Divider
                    orientation="vertical"
                    flexItem
                    style={{ marginLeft: theme.spacing(upMD ? 1 : 0.5), marginRight: theme.spacing(upMD ? 1 : 0.5) }}
                  />
                  <AlertFavorites />
                  <AlertSorts />
                  <AlertFilters />
                  <AlertWorkflows />
                  <div style={{ width: theme.spacing(0.5) }} />
                </>
              }
            >
              <Box className={classes.searchresult}>
                {/* {isMDUp ? (
                  <SearchResultLarge
                    searching={loading}
                    total={total}
                    query={searchQuery}
                    onApplyFilters={onApplyFilters}
                  />
                ) : (
                  <SearchResultSmall searching={loading} total={total} query={searchQuery} />
                )} */}
              </Box>
            </SearchBar>
          </div>
        </PageHeader>

        <ALertList />
      </PageFullWidth>
    );
};

export const AlertsPage = React.memo(WrappedAlertsPage);
export default AlertsPage;
