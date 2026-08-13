import SimCardOutlinedIcon from '@mui/icons-material/SimCardOutlined';
import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useAppNavigate } from 'core/router';
import { createAppRoute, useAppSearchSnapshot } from 'core/routes';
import { AppPageContainer, AppPageFullWidth } from 'core/template';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import type { SearchResult } from 'models/api/search';
import type { IndexDefinition } from 'models/api/user';
import type { Heuristic } from 'models/base/heuristic';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HeuristicsTable } from 'routes/search/components/heuristics';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SearchHeader from 'ui/SearchBar/SearchHeader';

export const ManageHeuristicsPage = memo(() => {
  const { t } = useTranslation(['manageHeuristics']);
  const theme = useTheme();
  const navigate = useAppNavigate<'/manage/heuristics'>();
  const { apiCall } = useMyAPI();
  const { indexes, user: currentUser } = useALContext();
  const search = useAppSearchSnapshot<'/manage/heuristics'>();

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

  useEffect(() => {
    handleReload(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleReload, search.toString()]);

  return (
    <AppPageFullWidth>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h4">{t('title')}</Typography>
      </div>

      <AppPageContainer isSticky>
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
            onChange={v =>
              navigate
                .here()
                .update(s => ({ ...s, search: { ...s.search, ...ManageHeuristicsRoute.search.delta(v).toObject() } }))
            }
            paramDefaults={search.defaults().toObject()}
            searchInputProps={{ placeholder: t('filter'), options: suggestions }}
          />
        </div>
      </AppPageContainer>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <HeuristicsTable heuristicResults={heuristicResults} />
      </div>
    </AppPageFullWidth>
  );
});

export const ManageHeuristicsRoute = createAppRoute({
  component: ManageHeuristicsPage,

  path: '/manage/heuristics',
  search: s => ({
    query: s.string(''),
    offset: s.number(0).min(0).source('transient').ephemeral(),
    rows: s.number(25).locked().source('transient').ephemeral(),
    sort: s.string('heur_id asc').ephemeral(),
    filters: s.filters([]),
    track_total_hits: s.number(10000).nullable().ephemeral()
  }),

  ancestor: '/manage',
  shortname: () => ({ i18nKey: 'drawer.manage.heuristics', ns: 'app' }),
  fullname: () => ({ i18nKey: 'drawer.manage.heuristics', ns: 'app' }),
  shorticon: () => <SimCardOutlinedIcon />,
  fullicon: () => <SimCardOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('heuristic_view')
});
