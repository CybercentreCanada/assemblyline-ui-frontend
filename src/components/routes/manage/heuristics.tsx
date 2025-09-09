import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useAppUser } from 'commons/components/app/hooks';
import PageContainer from 'commons/components/pages/PageContainer';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import { createSearchParams } from 'components/core/SearchParams/createSearchParams';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Heuristic } from 'components/models/base/heuristic';
import type { SearchResult } from 'components/models/ui/search';
import type { CustomUser, IndexDefinition } from 'components/models/ui/user';
import ForbiddenPage from 'components/routes/403';
import HeuristicDetail from 'components/routes/manage/heuristic_detail';
import SearchHeader from 'components/visual/SearchBar/SearchHeader';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import HeuristicsTable from 'components/visual/SearchResult/heuristics';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

export const { SearchParamsProvider, useSearchParams } = createSearchParams(p => ({
  query: p.string(''),
  offset: p.number(0).min(0).origin('state').ephemeral(),
  rows: p.number(25).locked().origin('state').ephemeral(),
  sort: p.string('heur_id asc').ephemeral(),
  filters: p.filters([]),
  track_total_hits: p.number(10000).nullable().ephemeral()
}));

const HeuristicsSearch = () => {
  const { t } = useTranslation(['manageHeuristics']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { globalDrawerOpened, setGlobalDrawer, closeGlobalDrawer } = useDrawer();
  const { search, setSearchParams } = useSearchParams();

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
  }, [handleReload, search]);

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
  <SearchParamsProvider>
    <HeuristicsSearch />
  </SearchParamsProvider>
);

export const HeuristicsPage = React.memo(WrappedHeuristicsPage);
export default HeuristicsPage;
