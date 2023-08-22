import { Paper, Tab, Tabs as MuiTabs, Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation, useParams } from 'react-router-dom';
import { DEFAULTS, DEFAULT_QUERY, Index, Params } from './models';

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
  tab: {
    textTransform: 'capitalize'
  }
}));

type Props = {};

export const WrappedTabs = (props: Props) => {
  const { t } = useTranslation(['search']);
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();
  const { index } = useParams<Params>();

  const [totals, setTotals] = useState<Record<Index, number> | object>({});

  const indices = useMemo<Index[]>(
    () => Object.keys(DEFAULTS).filter(key => currentUser.roles.includes(DEFAULTS[key].permission)) as Index[],
    [currentUser.roles]
  );

  const handleIndexChange = useCallback(
    (e, newIndex) => {
      const query = new SimpleSearchQuery(location.search, DEFAULT_QUERY);
      query.delete('fl');
      navigate(`/fieldsearch/${newIndex}/${DEFAULTS[newIndex].field}/?${query.toString()}${location.hash}`);
    },
    [location.hash, location.search, navigate]
  );

  useEffect(() => {
    const query = new SimpleSearchQuery(location.search, DEFAULT_QUERY);

    apiCall({
      method: 'POST',
      url: `/api/v4/search/total/`,
      body: {
        ...Object.fromEntries(Object.entries(query.getParams()).filter(([k, v]) => ['query'].includes(k))),
        filters: query.getAll('filters', [])
      },
      onSuccess: api_data => setTotals(api_data.api_response)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    indices.length > 0 && (
      <MuiTabs
        // className={classes.tweaked_tabs}
        component={Paper}
        value={index}
        onChange={handleIndexChange}
        indicatorColor="primary"
        textColor="primary"
        scrollButtons="auto"
        variant="scrollable"
        allowScrollButtonsMobile
      >
        {indices.map((id, i) => (
          <Tab
            key={`${id}-${i}`}
            className={classes.tab}
            value={id}
            label={
              // !totals[id] ? t(`${id}`) : totals[id] > 1 ? `${totals[id]} ${t(`${id}s`)}` : `${totals[id]} ${t(`${id}`)}`
              !totals[id] ? t(`${id}`) : `${t(`${id}s`)}: ${totals[id]}`
            }
          />
        ))}
      </MuiTabs>
    )
  );
};

export const Tabs = React.memo<Props>(WrappedTabs);
