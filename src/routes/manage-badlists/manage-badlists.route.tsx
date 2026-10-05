import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { useTheme } from '@mui/material';
import { useAppUser } from 'deprecated/legacy/commons/components/app/hooks';
import PageContainer from 'core/template/components/AppPageContainer';
import PageFullWidth from 'deprecated/legacy/commons/components/pages/PageFullWidth';
import { useALQuery } from 'core/api/hooks/useAppQuery';
import {
  createSearchParams,
  SearchParamsProvider,
  useSearchParams
} from 'deprecated/legacy/components/core/SearchParams/createSearchParams';
import useALContext from 'deprecated/legacy/components/hooks/useALContext';
import useDrawer from 'deprecated/legacy/components/hooks/useDrawer';
import type { CustomUser, IndexDefinition } from 'models/api/user';
import ForbiddenPage from 'routes/forbidden/forbidden';
import BadlistNew from 'routes/manage-badlist-add/manage-badlist-add.route';
import BadlistDetail from 'routes/manage-badlist-detail/manage-badlist-detail.route';
import { IconButton } from 'deprecated/legacy/components/visual/Buttons/IconButton';
import { PageHeader } from 'ui/layouts/PageHeader';
import SearchHeader from 'ui/SearchBar/SearchHeader';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import BadlistTable from 'routes/search/components/badlist';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

const BADLIST_PARAMS = createSearchParams(p => ({
  query: p.string(''),
  offset: p.number(0).min(0).origin('snapshot').ephemeral(),
  rows: p.number(25).locked().origin('snapshot').ephemeral(),
  sort: p.string('added desc').ephemeral(),
  filters: p.filters([]),
  track_total_hits: p.number(10000).nullable().ephemeral(),
  refresh: p.boolean(false).origin('snapshot').ephemeral()
}));

export type BadlistParams = typeof BADLIST_PARAMS;

const BadlistSearch = () => {
  const { t } = useTranslation(['manageBadlist']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { globalDrawerOpened, setGlobalDrawer, closeGlobalDrawer } = useDrawer();
  const { search, setSearchParams, setSearchObject } = useSearchParams<BadlistParams>();

  const suggestions = useMemo<IndexDefinition>(
    () => ({ ...indexes.badlist, ...DEFAULT_SUGGESTION }),
    [indexes.badlist]
  );

  const badlists = useALQuery({
    url: '/api/v4/search/badlist/',
    method: 'POST',
    disabled: !currentUser.roles.includes('badlist_view'),
    body: search
      .set(o => ({ ...o, query: o.query || '*' }))
      .omit(['refresh'])
      .toObject()
  });

  const handleToggleFilter = useCallback(
    (filter: string) => {
      setSearchObject(o => {
        const filters = o.filters.includes(filter) ? o.filters.filter(f => f !== filter) : [...o.filters, filter];
        return { ...o, offset: 0, filters };
      });
    },
    [setSearchObject]
  );

  useEffect(() => {
    if (!location.hash || globalDrawerOpened || !badlists.data) return;
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
      <PageHeader
        primary={t('title')}
        slotProps={{
          root: { style: { marginBottom: theme.spacing(4) } }
        }}
        actions={
          <IconButton
            tooltip={t('add_badlist')}
            preventRender={!currentUser.roles.includes('badlist_manage')}
            size="large"
            sx={{ color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark }}
            onClick={() => navigate(`${location.pathname}${location.search || ''}#new`)}
          >
            <AddCircleOutlineOutlinedIcon />
          </IconButton>
        }
      />

      <PageContainer isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchHeader
            params={search.toParams()}
            loading={badlists.isFetching}
            results={badlists.data}
            resultLabel={
              search.get('query')
                ? t(`filtered${badlists.data?.total === 1 ? '' : 's'}`)
                : t(`total${badlists.data?.total === 1 ? '' : 's'}`)
            }
            onChange={v => setSearchParams(v)}
            paramDefaults={search.defaults().toObject()}
            searchInputProps={{ placeholder: t('filter'), options: suggestions }}
            actionProps={[
              {
                tooltip: {
                  title: search.has('filters', 'sources.type:user') ? t('filter.user.remove') : t('filter.user.add')
                },
                icon: { children: <PersonOutlineOutlinedIcon /> },
                button: {
                  color: search.has('filters', 'sources.type:user') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('sources.type:user')
                }
              },
              {
                tooltip: { title: search.has('filters', 'type:tag') ? t('filter.tag.remove') : t('filter.tag.add') },
                icon: { children: <LabelOutlinedIcon /> },
                button: {
                  color: search.has('filters', 'type:tag') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('type:tag')
                }
              },
              {
                tooltip: {
                  title: search.has('filters', 'enabled:false') ? t('filter.disabled.remove') : t('filter.disabled.add')
                },
                icon: { children: <BlockOutlinedIcon /> },
                button: {
                  color: search.has('filters', 'enabled:false') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('enabled:false')
                }
              }
            ]}
          />
        </div>
      </PageContainer>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <BadlistTable badlistResults={badlists.data} isLoading={badlists.isLoading} />
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
