import { Box, Grid, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import AlertSession from 'components/routes/alerts2/components/SessionParameter';
import SearchBar from 'components/visual/SearchBar/search-bar';
import SearchQuery from 'components/visual/SearchBar/search-query';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ForbiddenPage from './403';
import AlertFavoriteFilters from './alerts2/components/FavoriteFilters';

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

const WrappedAlertsPage = () => {
  const { t } = useTranslation('alerts');
  const classes = useStyles();
  const theme = useTheme();
  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { showSuccessMessage } = useMySnackbar();
  const { globalDrawerOpened, setGlobalDrawer } = useDrawer();

  const [alerts, setAlerts] = useState<any[]>();
  const [searchQuery, setSearchQuery] = useState<SearchQuery>(null);
  const [loading, setLoading] = useState<boolean>(false);

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

  if (!currentUser.roles.includes('alert_view')) return <ForbiddenPage />;
  else
    return (
      <PageFullWidth margin={4}>
        <Grid container alignItems="center" paddingBottom={2}>
          <Grid item xs>
            <Typography variant="h4">{t('alerts')}</Typography>
          </Grid>

          <Grid item xs style={{ textAlign: 'right', flex: 0 }}>
            <AlertSession />
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
                  <AlertFavoriteFilters />
                  <AlertSortFilters />
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

        {/* <SimpleList
          id={ALERT_SIMPLELIST_ID}
          disableProgress
          scrollInfinite={countedTotal < total}
          scrollReset={scrollReset}
          scrollLoadNextThreshold={75}
          scrollTargetId="app-scrollct"
          loading={loading}
          items={alerts}
          emptyValue={
            <div style={{ width: '100%' }}>
              <InformativeAlert>
                <AlertTitle>{t('no_alerts_title')}</AlertTitle>
                {t('no_alerts_desc')}
              </InformativeAlert>
            </div>
          }
          onItemSelected={onItemSelected}
          onRenderActions={onRenderListActions}
          onLoadNext={_onLoadMore}
          onCursorChange={onListCursorChanges}
        >
          {onRenderListRow}
        </SimpleList> */}
      </PageFullWidth>
    );
};

export const AlertsPage = React.memo(WrappedAlertsPage);
export default AlertsPage;
