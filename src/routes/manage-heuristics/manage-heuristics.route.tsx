import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import useMyAPI from 'core/api/useMyAPI';
import useALContext from 'core/config/useALContext';
import PageContainer from 'core/template/branding/AppPageContainer';
import { useAppUser } from 'core/template/components/app/hooks';
import PageFullWidth from 'core/template/components/pages/PageFullWidth';
import { createSearchParams, SearchParamsProvider, useSearchParams } from 'features/SearchParams/createSearchParams';
import useDrawer from 'layout/drawer/useDrawer';
import type { SearchResult } from 'models/api/search';
import type { CustomUser, IndexDefinition } from 'models/api/user';
import type { Heuristic } from 'models/base/heuristic';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import ForbiddenPage from 'routes/forbidden/forbidden';
import HeuristicDetail from 'routes/manage-heuristic-detail/manage-heuristic-detail.route';
import HeuristicsTable from 'routes/search/components/heuristics';
import SearchHeader from 'ui/SearchBar/SearchHeader';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';

const HEURISTICS_PARAMS = createSearchParams(p => ({
  query: p.string(''),
  offset: p.number(0).min(0).origin('snapshot').ephemeral(),
  rows: p.number(25).locked().origin('snapshot').ephemeral(),
  sort: p.string('heur_id asc').ephemeral(),
  filters: p.filters([]),
  track_total_hits: p.number(10000).nullable().ephemeral()
}));

type HeuristicsParams = typeof HEURISTICS_PARAMS;

const HeuristicsSearch = () => {
  const { t } = useTranslation(['manageHeuristics']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { globalDrawerOpened, setGlobalDrawer, closeGlobalDrawer } = useDrawer();
  const { search, setSearchParams } = useSearchParams<HeuristicsParams>();

  const [heuristicResults, setHeuristicResults] = useState<SearchResult<Heuristic>>(null);
  const [searching, setSearching] = useState<boolean>(false);

  const suggestions = useMemo<IndexDefinition>(
    () => ({ ...indexes.heuristic, ...DEFAULT_SUGGESTION }),
    [indexes.heuristic]
  );

  const handleReload = useCallback(
    (body: typeof search) => {
      if (!currentUser.roles.includes('heuristic_view')) return;

      apiCall<SearchResult<Heuristic>>({
        url: '/api/v4/search/heuristic/',
        method: 'POST',
        body: body.set(o => ({ ...o, query: o.query || '*' })).toObject(),
        onSuccess: ({ api_response }) => setHeuristicResults(api_response),
        onEnter: () => setSearching(true),
        onExit: () => setSearching(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.roles]
  );

  const setHeuristicID = useCallback(
    (heur_id: string) => {
      navigate(`${location.pathname}${location.search || ''}#${heur_id}`);
    },
    [location.pathname, location.search, navigate]
  );

  useEffect(() => {
    if (!location.hash || globalDrawerOpened || !heuristicResults) return;
    navigate(`${location.pathname}${location.search ? location.search : ''}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (location.hash) setGlobalDrawer(<HeuristicDetail heur_id={location.hash.substr(1)} />);
    else closeGlobalDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    handleReload(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleReload, search.toString()]);

  return currentUser.roles.includes('heuristic_view') ? (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h4">{t('title')}</Typography>
      </div>

      <PageContainer isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchHeader
            params={search.toParams()}
            loading={searching}
            results={heuristicResults}
            resultLabel={
              search.get('query')
                ? t(`filtered${heuristicResults?.total === 1 ? '' : 's'}`)
                : t(`total${heuristicResults?.total === 1 ? '' : 's'}`)
            }
            onChange={v => setSearchParams(v)}
            paramDefaults={search.defaults().toObject()}
            searchInputProps={{ placeholder: t('filter'), options: suggestions }}
          />
        </div>
      </PageContainer>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <HeuristicsTable heuristicResults={heuristicResults} setHeuristicID={setHeuristicID} />
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
};

const WrappedHeuristicsPage = () => (
  <SearchParamsProvider params={HEURISTICS_PARAMS}>
    <HeuristicsSearch />
  </SearchParamsProvider>
);

export const HeuristicsPage = React.memo(WrappedHeuristicsPage);
export default HeuristicsPage;
