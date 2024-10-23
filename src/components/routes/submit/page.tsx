import Flow from '@flowjs/flow.js';
import { useMediaQuery, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PageCenter from 'commons/components/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Metadata } from 'components/models/base/submission';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import createFastContext from '../submit2/contexts/createStoreContext';

const useStyles = makeStyles(theme => ({
  no_pad: {
    padding: 0
  },
  meta_key: {
    overFLOWX: 'hidden',
    whiteSpace: 'nowrap',
    textOverFLOW: 'ellipsis'
  },
  item: {
    marginLeft: 0,
    width: '100%',
    '&:hover': {
      background: theme.palette.action.hover
    }
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  tweaked_tabs: {
    [theme.breakpoints.only('xs')]: {
      '& [role=tab]': {
        minWidth: '90px'
      }
    }
  }
}));

// eslint-disable-next-line  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const FLOW = new Flow({
  target: '/api/v4/ui/FLOWjs/',
  permanentErrors: [412, 500, 501],
  maxChunkRetries: 1,
  chunkRetryInterval: 500,
  simultaneousUploads: 4
});

const TABS = ['file', 'url', 'option'] as const;
type Tabs = (typeof TABS)[number];

type SubmitState = {
  hash: string;
  tabContext: string;
  c12n: string;
  metadata?: Metadata;
};

type SubmitProps = {
  none: boolean;
};

type Store = {
  test: {
    another: string;
    second: {
      value: string;
    };
  };
  first: string;
  last: string;
  nested: Record<string, { alpha: string }>;
  array: {
    alpha: string;
  }[];
};

export const { Provider, useStore } = createFastContext<Store>({
  first: '',
  last: '',
  test: {
    another: '',
    second: {
      value: 'asd'
    }
  },
  nested: undefined,
  array: []
});

const WrappedSubmitPage = () => {
  const { t, i18n } = useTranslation(['submit']);
  const { apiCall } = useMyAPI();
  const theme = useTheme();
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();

  const downSM = useMediaQuery(theme.breakpoints.down('md'));
  const md = useMediaQuery(theme.breakpoints.only('md'));

  const submitState = useMemo<SubmitState>(() => location.state as SubmitState, [location.state]);
  const submitParams = useMemo<URLSearchParams>(() => new URLSearchParams(location.search), [location.search]);

  const [value, setValue] = useStore(['test', 'second', 'value']);
  // const [fieldValue5, setStore5] = useStore('dsadsadas');
  // const [fieldValue7, setStore7] = useStore('test');
  // const [fieldValue2, setStore2] = useStore('test.second.asd');
  // const [fieldValue6, setStore6] = useStore('test.second.dsadsa');
  // const [fieldValue3, setStore3] = useStore('nested.asd.asdasd');
  // const [fieldValue4, setStore4] = useStore('nested.dsadas.alpha');

  // const [fieldValue, setStore] = useStore('nested.asd.alpha');

  return (
    <PageCenter maxWidth={md ? '800px' : downSM ? '100%' : '1024px'} margin={4} width="100%">
      <input type="text" value={value} onChange={e => setValue(e.target.value)} />
      <div>{value}</div>
    </PageCenter>
  );
};

const Page = () => (
  <Provider>
    <WrappedSubmitPage />
  </Provider>
);

export const SubmitPage = React.memo(Page);
export default SubmitPage;
