import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { Grid, IconButton, Tooltip, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Badlist } from 'components/models/base/badlist';
import type { SearchResult } from 'components/models/ui/search';
import { CustomUser } from 'components/models/ui/user';
import ForbiddenPage from 'components/routes/403';
import SearchHeader from 'components/visual/SearchBar/SearchHeader';
import type { SearchParams } from 'components/visual/SearchBar/SearchParams';
import { createSearchParams } from 'components/visual/SearchBar/SearchParams';
import { SearchParamsProvider, useSearchParams } from 'components/visual/SearchBar/SearchParamsContext';
import type { SearchResult as SearchParamsResult } from 'components/visual/SearchBar/SearchParser';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import BadlistTable from 'components/visual/SearchResult/badlist';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import BadlistNew from './badlist_add';
import BadlistDetail from './badlist_detail';

const BADLIST_PARAMS = createSearchParams(p => ({
  query: p.string(''),
  offset: p.number(0).min(0).hidden().ignored(),
  rows: p.number(25).enforced().hidden().ignored(),
  sort: p.string('added desc').ignored(),
  filters: p.filters([]),
  track_total_hits: p.number(10000).nullable().ignored(),
  refresh: p.boolean(false).hidden().ignored()
}));

type BadlistParams = SearchParams<typeof BADLIST_PARAMS>;

const BadlistSearch = () => {
  const { t } = useTranslation(['manageBadlist']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { globalDrawerOpened, setGlobalDrawer, closeGlobalDrawer } = useDrawer();
  const { search, setSearchParams, setSearchObject } = useSearchParams<BadlistParams>();

  const [badlistResults, setBadlistResults] = useState<SearchResult<Badlist>>(null);
  const [searching, setSearching] = useState<boolean>(false);

  const suggestions = useMemo<string[]>(
    () =>
      indexes.badlist
        ? [...Object.keys(indexes.badlist).filter(name => indexes.badlist[name].indexed), ...DEFAULT_SUGGESTION]
        : [...DEFAULT_SUGGESTION],
    [indexes.badlist]
  );

  const handleReload = useCallback(
    (body: SearchParamsResult<BadlistParams>) => {
      if (!currentUser.roles.includes('badlist_view')) return;

      apiCall<SearchResult<Badlist>>({
        url: '/api/v4/search/badlist/',
        method: 'POST',
        body: body
          .set(o => ({ ...o, query: o.query || '*' }))
          .omit(['refresh'])
          .toObject(),
        onSuccess: ({ api_response }) => setBadlistResults(api_response),
        onEnter: () => setSearching(true),
        onExit: () => setSearching(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.roles]
  );

  const setBadlistID = useCallback(
    (wf_id: string) => navigate(`${location.pathname}${location.search || ''}#${wf_id}`),
    [location.pathname, location.search, navigate]
  );

  useEffect(() => {
    if (!location.hash || globalDrawerOpened || !badlistResults) return;
    navigate(`${location.pathname}${location.search || ''}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (!location.hash) closeGlobalDrawer();
    else if (location.hash === '#new') setGlobalDrawer(<BadlistNew close={closeGlobalDrawer} />);
    else setGlobalDrawer(<BadlistDetail badlist_id={location.hash.slice(1)} close={closeGlobalDrawer} />);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    handleReload(search);
  }, [handleReload, search]);

  useEffect(() => {
    function reload() {
      setSearchObject(o => ({ ...o, offset: 0, refresh: !o.refresh }));
    }

    window.addEventListener('reloadBadlist', reload);
    return () => {
      window.removeEventListener('reloadBadlist', reload);
    };
  }, [setSearchObject]);

  return currentUser.roles.includes('badlist_view') ? (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="h4">{t('title')}</Typography>
          </Grid>

          {currentUser.roles.includes('badlist_manage') && (
            <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
              <Tooltip title={t('add_badlist')}>
                <IconButton
                  style={{
                    color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
                  }}
                  onClick={() => navigate(`${location.pathname}${location.search || ''}#new`)}
                  size="large"
                >
                  <AddCircleOutlineOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          )}
        </Grid>
      </div>

      <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchHeader
            params={search.toParams()}
            loading={searching}
            results={badlistResults}
            resultLabel={
              search.get('query')
                ? t(`filtered${badlistResults?.total === 1 ? '' : 's'}`)
                : t(`total${badlistResults?.total === 1 ? '' : 's'}`)
            }
            onChange={v => setSearchParams(v)}
            paramDefaults={search.defaults().toObject()}
            searchInputProps={{ placeholder: t('filter'), options: suggestions }}
            actionProps={[
              {
                tooltip: { title: t('user') },
                icon: { children: <PersonOutlineOutlinedIcon /> },
                button: {
                  onClick: () => setSearchObject(o => ({ ...o, filters: [...o.filters, 'sources.type:user'] }))
                }
              },
              {
                tooltip: { title: t('tag') },
                icon: { children: <LabelOutlinedIcon /> },
                button: {
                  onClick: () => setSearchObject(o => ({ ...o, filters: [...o.filters, 'type:tag'] }))
                }
              },
              {
                tooltip: { title: t('disabled') },
                icon: { children: <BlockOutlinedIcon /> },
                button: {
                  onClick: () => setSearchObject(o => ({ ...o, filters: [...o.filters, 'enabled:false'] }))
                }
              }
            ]}
          />
        </div>
      </PageHeader>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <BadlistTable badlistResults={badlistResults} setBadlistID={setBadlistID} />
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
};

const WrappedBadlistPage = () => (
  <SearchParamsProvider params={BADLIST_PARAMS}>
    <BadlistSearch />
  </SearchParamsProvider>
);

export const BadlistPage = React.memo(WrappedBadlistPage);
export default BadlistPage;
