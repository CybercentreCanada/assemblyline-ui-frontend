import Editor, { loader } from '@monaco-editor/react';
import { Autocomplete, Button, Grid, TextField, Theme, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppTheme from 'commons/components/app/hooks/useAppTheme';
import PageFullSize from 'commons/components/pages/PageFullSize';
import PageHeader from 'commons/components/pages/PageHeader';
import useMyAPI from 'components/hooks/useMyAPI';
import CustomChip from 'components/visual/CustomChip';
import SearchBar from 'components/visual/SearchBar/search-bar';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import 'moment/locale/fr';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import AutoSizer from 'react-virtualized-auto-sizer';

loader.config({ paths: { vs: '/cdn/monaco_0.35.0/vs' } });

const useStyles = makeStyles((theme: Theme) => ({}));

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type API = {
  complete?: boolean;
  description?: string;
  function?: string;
  id?: string;
  methods?: Array<'GET' | 'POST'>;
  name?: string;
  path?: string;
  protected?: boolean;
  require_role?: Array<string>;
  ui_only?: boolean;
};

type Props = {};

type MethodInputProps = {
  method: RequestMethod;
};

const PAGE_SIZE = 25;

const METHOD_COLORS: Record<
  RequestMethod,
  'primary' | 'success' | 'default' | 'secondary' | 'error' | 'info' | 'warning'
> = {
  GET: 'info',
  POST: 'success',
  PUT: 'warning',
  DELETE: 'error'
};

//'"primary" | "default" | "success" | "secondary" | "error" | "info" | "warning"'

export const SearchAPI = () => {
  const { t, i18n } = useTranslation(['search']);
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { isDark: isDarkTheme } = useAppTheme();

  const [apis, setAPIs] = useState<{ apis: API[]; blueprints: { [blueprint: string]: string } }>(null);

  const [url, setURL] = useState<string>('');
  const [method, setMethod] = useState<RequestMethod>('GET');
  const [body, setBody] = useState<string>('');

  const [query, setQuery] = useState<SimpleSearchQuery>(
    new SimpleSearchQuery(location.search, `query=*&rows=${PAGE_SIZE}&offset=0&filters=NOT%20to_be_deleted:true`)
  );
  const [selectedIndex, setSelectedIndex] = useState('submission');
  const [searching, setSearching] = useState<boolean>(false);

  const [response, setResponse] = useState<string>('');

  const queryValue = useRef<string>('');

  const suggestions = useMemo<string[]>(
    () => [...(apis ? apis.apis.map(route => route?.path.replace('/api/v4', '')) : [])],
    [apis]
  );

  const fetchAPI = useCallback(() => {
    apiCall({
      method: 'GET',
      url: `/api/v4/`,
      onSuccess: api_data => setAPIs(api_data.api_response)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSearch = useCallback(() => {
    apiCall({
      method: 'GET',
      url: `/api/v4${query.toString()}`,
      onSuccess: api_data => setResponse(api_data.api_response)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    fetchAPI();
  }, [fetchAPI]);

  console.log(query.toString());

  const MethodInput = useCallback(({ method: propMethod }: MethodInputProps) => {
    return <>{propMethod}</>;
  }, []);

  const onSubmit = useCallback(() => {
    apiCall({
      method: 'POST',
      url: `${url}`,
      body: JSON.parse(body),
      onSuccess: api_data => setResponse(JSON.stringify(api_data.api_response, null, 4))
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, url]);

  // const beforeMount = monaco => {
  //   console.log(monaco);
  //   // if (!monaco.languages.getLanguages().some(({ id }) => id === 'json')) {
  //   // monaco.languages.register({ id: 'magic' });
  //   // monaco.languages.setMonarchTokensProvider('magic', magicDef);
  //   // monaco.languages.setLanguageConfiguration('magic', magicConfig);

  //   monaco?.languages?.registerDocumentFormattingEditProvider('json', {
  //     provideDocumentFormattingEdits(model, options) {
  //       // var formatted = format(model.getValue(), {
  //       //   indent: ' '.repeat(options.tabSize)
  //       // });
  //       console.log(model);
  //       return [
  //         {
  //           range: model.getFullModelRange(),
  //           text: model.getValue()
  //         }
  //       ];
  //     }
  //   });
  // };

  return (
    <PageFullSize>
      <div style={{ paddingBottom: theme.spacing(2), textAlign: 'left', width: '100%' }}>
        <Typography variant="h4">{t(`api_search`)}</Typography>
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
          ></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', paddingTop: theme.spacing(1) }}>
          <Autocomplete
            disablePortal
            freeSolo
            options={apis ? apis.apis : []}
            sx={{ flex: 1 }}
            renderInput={params => (
              <TextField {...params} value={url} onChange={e => setURL(e.target.value)} label="Movie" />
            )}
            getOptionLabel={(option: API | string) => (typeof option === 'object' ? option?.path : option)}
            renderOption={(props, option: API, other: { selected: boolean; index: number; inputValue: string }) => {
              return (
                <li {...props} key={`${option.id}-${other.index}`} style={{ ...props.style, display: 'flex', gap: 2 }}>
                  {option.methods.map(m => (
                    <CustomChip
                      size="tiny"
                      type="rounded"
                      mono
                      label={m}
                      color={m in METHOD_COLORS ? METHOD_COLORS[m] : 'default'}
                    />
                  ))}
                  <span style={{ flex: 1 }}>{option.path}</span>
                  <span>{option.name}</span>
                </li>
              );
            }}
          />
          <Button variant="contained" color="primary" children={'Submit'} onClick={e => onSubmit()} />
        </div>
      </PageHeader>
      <Grid item flex={1}>
        <Grid container flexDirection="row" height="100%" minHeight="500px" spacing={1}>
          <Grid item md={6}>
            <AutoSizer>
              {({ width, height }) => (
                <Editor
                  language="json"
                  width={width}
                  height={height}
                  theme={isDarkTheme ? 'vs-dark' : 'vs'}
                  loading={t('loading')}
                  value={body}
                  onChange={setBody}
                  options={{ links: false, formatOnType: true, formatOnPaste: true }}
                />
              )}
            </AutoSizer>
          </Grid>
          <Grid item md={6}>
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
      </Grid>
    </PageFullSize>
  );
};

SearchAPI.defaultProps = {};

export default SearchAPI;
