import { Button, styled, Typography, useTheme } from '@mui/material';
import { createSearchParamsStore } from 'features/search-params';
import type { ReactNode } from 'react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { DemoContainer } from 'routes/development-library/components/DemoContainer';
import { DemoSection } from 'routes/development-library/components/DemoSection';
import { useForm } from 'routes/development-library/contexts/form';
import type { SearchParamsKindDemo } from 'routes/development-library/development-library.models';
import {
  KIND_DEMOS,
  LIVE_PARAMS,
  LIVE_STORAGE_KEY,
  LIVE_TAB,
  resolvePlaygroundSnapshot,
  runSearchParamsCheck,
  SEARCH_PARAMS_CHECKS,
  SORT_OPTIONS,
  stringifyResult
} from 'routes/development-library/utils/search-params.utils';
import { NumberInput } from 'ui/inputs/NumberInput';
import { SelectInput } from 'ui/inputs/SelectInput';
import { SwitchInput } from 'ui/inputs/SwitchInput';
import { TextInput } from 'ui/inputs/TextInput';
import { PageSection } from 'ui/layouts/PageSection';
import MonacoEditor from 'ui/MonacoEditor';

//*****************************************************************************************
// Library State
//*****************************************************************************************

export type SearchParamsLibraryState = {
  search_params: {
    name: string;
    values: {
      query: string;
      state: string;
      transient: string;
    };
  };
};

export const SEARCH_PARAMS_LIBRARY_STATE: SearchParamsLibraryState = {
  search_params: {
    name: 'Search Params',
    values: {
      query: 'page=3&sort=name&filters=NOT(type:exe)&config={"limit":9}',
      state: '{"panel":"details"}',
      transient: '{"selection":["row-1"]}'
    }
  }
} as const;

const LIVE_STORE = createSearchParamsStore();

const SORT_SELECT_OPTIONS = SORT_OPTIONS.map(value => ({ primary: value, value }));

const RESULT_SX = { margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } as const;

//*****************************************************************************************
// Column
//*****************************************************************************************

const Column = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(2)
}));

Column.displayName = 'Column';

//*****************************************************************************************
// Result Block
//*****************************************************************************************

type ResultBlockProps = {
  /** Output to display. */
  children: ReactNode;
  /** Expression that produced the output. */
  label: string;
};

const ResultBlock = memo(({ children, label }: ResultBlockProps) => (
  <div>
    <Typography color="textSecondary" variant="caption">
      {label}
    </Typography>
    <Typography component="pre" variant="body2" sx={RESULT_SX}>
      {children}
    </Typography>
  </div>
));

ResultBlock.displayName = 'ResultBlock';

//*****************************************************************************************
// Playground Field
//*****************************************************************************************

type PlaygroundFieldProps = {
  /** Field of the library form that holds the text. */
  field: 'query' | 'state' | 'transient';
  /** Hint displayed under the input. */
  helperText: string;
  /** Input label. */
  label: string;
};

const PlaygroundField = memo(({ field, helperText, label }: PlaygroundFieldProps) => {
  const form = useForm();

  const handleChange = useCallback(
    (_event: unknown, next: string) => form.setFieldValue(`components.search_params.values.${field}`, next),
    [field, form]
  );

  return (
    <form.Subscribe
      selector={state => state.values.components.search_params.values[field]}
      children={value => <TextInput label={label} value={value} helperText={helperText} onChange={handleChange} />}
    />
  );
});

PlaygroundField.displayName = 'PlaygroundField';

//*****************************************************************************************
// Playground Results
//*****************************************************************************************

type PlaygroundResultsProps = {
  /** Query string typed by the user. */
  query: string;
  /** JSON text for `location.state`. */
  state: string;
  /** JSON text for the transient values. */
  transient: string;
};

const PlaygroundResults = memo(({ query, state, transient }: PlaygroundResultsProps) => {
  const output = useMemo(() => {
    const snapshot = resolvePlaygroundSnapshot(query, state, transient);

    return {
      values: stringifyResult(() => snapshot.toObject()),
      search: snapshot.toLocationSearch(),
      state: stringifyResult(() => snapshot.toLocationState()),
      transient: stringifyResult(() => snapshot.toLocationTransient())
    };
  }, [query, state, transient]);

  return (
    <Column>
      <ResultBlock label="engine.fromRoute(href, state, transient).toObject()">{output.values}</ResultBlock>
      <ResultBlock label="snapshot.toLocationSearch()">{output.search || '(empty)'}</ResultBlock>
      <ResultBlock label="snapshot.toLocationState()">{output.state}</ResultBlock>
      <ResultBlock label="snapshot.toLocationTransient()">{output.transient}</ResultBlock>
    </Column>
  );
});

PlaygroundResults.displayName = 'PlaygroundResults';

//*****************************************************************************************
// Snapshot Results
//*****************************************************************************************

const SnapshotResults = memo(({ query, state, transient }: PlaygroundResultsProps) => {
  const output = useMemo(() => {
    const snapshot = resolvePlaygroundSnapshot(query, state, transient);

    return {
      page: stringifyResult(() => snapshot.get('page')),
      has: stringifyResult(() => ({
        'filters, type:file': snapshot.has('filters', 'type:file'),
        'filters, other': snapshot.has('filters', 'other')
      })),
      pick: stringifyResult(() => snapshot.pick(['page', 'sort']).toObject()),
      omit: stringifyResult(() => snapshot.omit(['config', 'filters', 'selection']).toObject()),
      defaults: stringifyResult(() => snapshot.defaults().toObject()),
      set: stringifyResult(() => snapshot.set(prev => ({ ...prev, page: prev.page + 1 })).get('page')),
      keys: stringifyResult(() => ({
        search: snapshot.sourceKeys('search'),
        state: snapshot.sourceKeys('state'),
        transient: snapshot.sourceKeys('transient'),
        ephemeral: snapshot.ephemeralKeys(),
        locked: snapshot.lockedKeys(),
        ignored: snapshot.ignoredKeys()
      }))
    };
  }, [query, state, transient]);

  return (
    <Column>
      <ResultBlock label="snapshot.get('page')">{output.page}</ResultBlock>
      <ResultBlock label="snapshot.has('filters', value)">{output.has}</ResultBlock>
      <ResultBlock label="snapshot.pick(['page', 'sort']).toObject()">{output.pick}</ResultBlock>
      <ResultBlock label="snapshot.omit(['config', 'filters', 'selection']).toObject()">{output.omit}</ResultBlock>
      <ResultBlock label="snapshot.defaults().toObject()">{output.defaults}</ResultBlock>
      <ResultBlock label="snapshot.set(prev => ({ ...prev, page: prev.page + 1 })).get('page')">
        {output.set}
      </ResultBlock>
      <ResultBlock label="snapshot.sourceKeys(source) / ephemeralKeys() / lockedKeys() / ignoredKeys()">
        {output.keys}
      </ResultBlock>
    </Column>
  );
});

SnapshotResults.displayName = 'SnapshotResults';

//*****************************************************************************************
// Kind Demo
//*****************************************************************************************

type KindDemoProps = {
  /** Demo whose engine resolves the query string. */
  demo: SearchParamsKindDemo;
  /** Hint displayed under the input. */
  helperText?: string;
};

const KindDemo = memo(({ demo, helperText = null }: KindDemoProps) => {
  const [query, setQuery] = useState<string>(demo.initial);

  const output = useMemo(() => {
    const result = demo.resolve(query);

    return {
      values: stringifyResult(() => result.values),
      delta: stringifyResult(() => result.delta),
      search: result.search
    };
  }, [demo, query]);

  const handleChange = useCallback((_event: unknown, next: string) => setQuery(next), []);

  return (
    <Column>
      <TextInput label="query string" value={query} helperText={helperText} onChange={handleChange} />
      <ResultBlock label="engine.full(params).toObject()">{output.values}</ResultBlock>
      <ResultBlock label="engine.delta(params).toObject()">{output.delta}</ResultBlock>
      <ResultBlock label="engine.delta(params).toString()">{output.search || '(empty)'}</ResultBlock>
    </Column>
  );
});

KindDemo.displayName = 'KindDemo';

//*****************************************************************************************
// Live Store Controls
//*****************************************************************************************

const LiveStoreControls = memo(() => {
  const location = useLocation();
  const { search, setSearchObject, setSearchParams, setDefaultParams, clearDefaultParams } =
    LIVE_STORE.useSearchParams<typeof LIVE_PARAMS>();

  const [saved, setSaved] = useState<string | null>(() => localStorage.getItem(LIVE_STORAGE_KEY));

  const values = search.toObject();

  const handlePage = useCallback(
    (_event: unknown, next: number | null) => setSearchObject(prev => ({ ...prev, live_page: next ?? 1 })),
    [setSearchObject]
  );

  const handleQuery = useCallback(
    (_event: unknown, next: string) => setSearchObject(prev => ({ ...prev, live_query: next })),
    [setSearchObject]
  );

  const handleSort = useCallback(
    (_event: unknown, next: (typeof SORT_OPTIONS)[number]) =>
      setSearchObject(prev => ({ ...prev, live_sort: next ?? prev.live_sort })),
    [setSearchObject]
  );

  const handleOpen = useCallback(
    (_event: unknown, next: boolean) => setSearchObject(prev => ({ ...prev, live_open: next })),
    [setSearchObject]
  );

  const handlePanel = useCallback(
    (_event: unknown, next: string) => setSearchObject(prev => ({ ...prev, live_panel: next })),
    [setSearchObject]
  );

  const handleReset = useCallback(
    () => setSearchParams(new URLSearchParams({ tab: LIVE_TAB }), true),
    [setSearchParams]
  );

  const handleSave = useCallback(() => {
    setDefaultParams(search.toObject());
    setSaved(localStorage.getItem(LIVE_STORAGE_KEY));
  }, [search, setDefaultParams]);

  const handleClear = useCallback(() => {
    clearDefaultParams();
    setSaved(localStorage.getItem(LIVE_STORAGE_KEY));
  }, [clearDefaultParams]);

  return (
    <Column>
      <NumberInput label="live_page (1 to 20)" value={values.live_page} onChange={handlePage} />
      <TextInput label="live_query" value={values.live_query} onChange={handleQuery} />
      <SelectInput label="live_sort" value={values.live_sort} options={SORT_SELECT_OPTIONS} onChange={handleSort} />
      <SwitchInput label="live_open" value={values.live_open} onChange={handleOpen} />
      <TextInput
        label="live_panel (location.state)"
        value={values.live_panel}
        helperText="Sourced from location.state, so it never appears in the url."
        onChange={handlePanel}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button variant="outlined" onClick={handleReset}>
          Reset
        </Button>
        <Button variant="outlined" onClick={handleSave}>
          Save as defaults
        </Button>
        <Button variant="outlined" onClick={handleClear}>
          Clear defaults
        </Button>
      </div>

      <ResultBlock label="useSearchParams().search.toObject()">{stringifyResult(() => values)}</ResultBlock>
      <ResultBlock label="useLocation().search">{location.search || '(empty)'}</ResultBlock>
      <ResultBlock label="useLocation().state">{stringifyResult(() => location.state)}</ResultBlock>
      <ResultBlock label={`localStorage.getItem('${LIVE_STORAGE_KEY}')`}>{saved ?? '(empty)'}</ResultBlock>
    </Column>
  );
});

LiveStoreControls.displayName = 'LiveStoreControls';

//*****************************************************************************************
// Checks Table
//*****************************************************************************************

const ChecksTable = memo(() => {
  const theme = useTheme();

  const results = useMemo(() => SEARCH_PARAMS_CHECKS.map(runSearchParamsCheck), []);
  const passed = useMemo(() => results.filter(result => result.passed).length, [results]);

  return (
    <Column>
      <Typography
        variant="subtitle1"
        sx={{ color: passed === results.length ? theme.palette.success.main : theme.palette.error.main }}
      >
        {`${passed} of ${results.length} checks passed`}
      </Typography>

      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody>
          {results.map(result => (
            <tr key={`${result.group}/${result.name}`} style={{ borderTop: `1px solid ${theme.palette.divider}` }}>
              <td style={{ padding: theme.spacing(0.5, 1), color: theme.palette.text.secondary, whiteSpace: 'nowrap' }}>
                {result.group}
              </td>
              <td style={{ padding: theme.spacing(0.5, 1) }}>
                {result.name}
                {!result.passed && (
                  <pre style={{ margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {`expected ${result.expected}\nreceived ${result.actual}`}
                  </pre>
                )}
              </td>
              <td
                style={{
                  padding: theme.spacing(0.5, 1),
                  fontWeight: theme.typography.fontWeightBold,
                  color: result.passed ? theme.palette.success.main : theme.palette.error.main
                }}
              >
                {result.passed ? 'PASS' : 'FAIL'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Column>
  );
});

ChecksTable.displayName = 'ChecksTable';

//*****************************************************************************************
// Search Params Section
//*****************************************************************************************

export const SearchParamsSection = memo(() => {
  const form = useForm();

  return (
    <DemoContainer>
      <PageSection primary="Search Params" anchor subheader divider />

      <DemoSection
        id="Search Params: Playground"
        primary="Playground"
        secondary={
          <>
            <span>{'Resolve every kind of param from the three places a value can come from. '}</span>
            <span>
              {'The inputs are resolved in memory, so nothing here touches the real url of the library page.'}
            </span>
          </>
        }
        left={
          <Column>
            <PlaygroundField field="query" label="query string" helperText="Read by params sourced from the url." />
            <PlaygroundField
              field="state"
              label="location.state (JSON)"
              helperText="Read by params with source 'state'."
            />
            <PlaygroundField
              field="transient"
              label="transient values (JSON)"
              helperText="Read by params with source 'transient'. Invalid JSON is ignored."
            />
            <form.Subscribe
              selector={state => state.values.components.search_params.values}
              children={values => <PlaygroundResults {...values} />}
            />
          </Column>
        }
        right={
          <MonacoEditor
            language="typescript"
            value={`
const p = SEARCH_PARAM_BLUEPRINTS_MAP;

const engine = new SearchParamEngine({
  page: p.number(1).min(1).max(50),
  query: p.string(''),
  sort: p.enum('date', ['name', 'date', 'score'] as const),
  advanced: p.boolean(false),
  filters: p.filters(['type:file']),
  config: p.object({ ids: ['default'], limit: 5, nested: { on: true } }),
  fixed: p.string('fixed').locked(),
  note: p.string('').ephemeral(),
  panel: p.string('').source('state'),
  selection: p.filters([]).source('transient')
});

// Search params come from the href, state params from
// location.state and transient params from the third argument.
const snapshot = engine.fromRoute('/library?page=3', { panel: 'details' }, { selection: ['row-1'] });

snapshot.toObject();            // every param, defaults filled in
snapshot.toLocationSearch();    // only search params that differ from the default
snapshot.toLocationState();     // only state params that differ from the default
snapshot.toLocationTransient(); // only transient params that differ from the default`}
          />
        }
      />

      <DemoSection
        id="Search Params: Number"
        primary="Number"
        secondary="Values are clamped between min() and max(). Text that is not a number falls back to the default."
        left={<KindDemo demo={KIND_DEMOS.number} helperText="Try page=-5, page=abc or page=7." />}
        right={
          <MonacoEditor
            language="typescript"
            value={`
const engine = new SearchParamEngine({
  page: p.number(1).min(1).max(50)
});

engine.full(new URLSearchParams('page=99')).toObject();  // { page: 50 }
engine.full(new URLSearchParams('page=-5')).toObject();  // { page: 1 }
engine.full(new URLSearchParams('page=abc')).toObject(); // { page: 1 }`}
          />
        }
      />

      <DemoSection
        id="Search Params: Boolean"
        primary="Boolean"
        secondary="Only the exact text true or false is recognized. Anything else falls back to the default."
        left={<KindDemo demo={KIND_DEMOS.boolean} helperText="Try advanced=false or advanced=yes." />}
        right={
          <MonacoEditor
            language="typescript"
            value={`
const engine = new SearchParamEngine({
  advanced: p.boolean(false)
});

engine.full(new URLSearchParams('advanced=true')).toObject(); // { advanced: true }
engine.full(new URLSearchParams('advanced=yes')).toObject();  // { advanced: false }
engine.delta(new URLSearchParams('advanced=false')).toString(); // '' (equal to the default)`}
          />
        }
      />

      <DemoSection
        id="Search Params: String"
        primary="String"
        secondary="Values are decoded from the url and written back encoded. An empty string is a valid value."
        left={<KindDemo demo={KIND_DEMOS.string} helperText="Try query=a%26b or query=." />}
        right={
          <MonacoEditor
            language="typescript"
            value={`
const engine = new SearchParamEngine({
  query: p.string('')
});

engine.full(new URLSearchParams('query=a%20b%26c')).toObject(); // { query: 'a b&c' }
engine.delta({ query: 'a b&c' }).toString();                    // 'query=a+b%26c'`}
          />
        }
      />

      <DemoSection
        id="Search Params: Enum"
        primary="Enum"
        secondary="Only the listed options are accepted. Options may be strings, numbers or booleans, but their string forms must be unique."
        left={<KindDemo demo={KIND_DEMOS.enum} helperText="Try sort=score or sort=other." />}
        right={
          <MonacoEditor
            language="typescript"
            value={`
const engine = new SearchParamEngine({
  sort: p.enum('date', ['name', 'date', 'score'] as const)
});

engine.full(new URLSearchParams('sort=name')).toObject();  // { sort: 'name' }
engine.full(new URLSearchParams('sort=other')).toObject(); // { sort: 'date' }

// Numeric options are restored from their serialized form
new SearchParamEngine({ mode: p.enum(1, [1, 2] as const) })
  .full(new URLSearchParams('mode=2')).toObject(); // { mode: 2 }`}
          />
        }
      />

      <DemoSection
        id="Search Params: Filters"
        primary="Filters"
        secondary="Url values are added to the defaults, deduplicated and sorted. NOT() negates a value and !() removes it, including a default."
        left={<KindDemo demo={KIND_DEMOS.filters} helperText="Try filters=!(type:file) to remove the default." />}
        right={
          <MonacoEditor
            language="typescript"
            value={`
const engine = new SearchParamEngine({
  filters: p.filters(['type:file'])
});

engine.full(new URLSearchParams('filters=b&filters=a')).toObject();
// { filters: ['a', 'b', 'type:file'] }

engine.full(new URLSearchParams('filters=NOT(a)')).toObject();
// { filters: ['NOT(a)', 'type:file'] }

engine.full(new URLSearchParams('filters=!(type:file)')).toObject();
// { filters: [] }`}
          />
        }
      />

      <DemoSection
        id="Search Params: Object"
        primary="Object"
        secondary="The url value is JSON. It is merged over the default key by key and must match the type of the default, otherwise the default is used."
        left={
          <KindDemo
            demo={KIND_DEMOS.object}
            helperText={'Try config={"ids":false}, config={"nested":{"on":false}} or config={"ids":["a"]}.'}
          />
        }
        right={
          <MonacoEditor
            language="typescript"
            value={`
const engine = new SearchParamEngine({
  config: p.object({ ids: ['default'], limit: 5, nested: { on: true } })
});

// Partial values are merged over the default
engine.full(new URLSearchParams('config={"limit":9}')).toObject();
// { config: { ids: ['default'], limit: 9, nested: { on: true } } }

// Arrays are replaced, not merged
engine.full(new URLSearchParams('config={"ids":["a"]}')).toObject();
// { config: { ids: ['a'], limit: 5, nested: { on: true } } }

// A value of the wrong type is rejected
engine.full(new URLSearchParams('config={"ids":false}')).toObject();
// { config: { ids: ['default'], limit: 5, nested: { on: true } } }

// A __proto__ key stays a plain own property
engine.full(new URLSearchParams('config={"__proto__":{"x":1}}'));`}
          />
        }
      />

      <DemoSection
        id="Search Params: Modifiers"
        primary="Modifiers"
        secondary="Builder methods change how a param behaves. locked() ignores external input and nullable() accepts null."
        left={
          <Column>
            <KindDemo demo={KIND_DEMOS.locked} helperText="A locked param always resolves to its default." />
            <KindDemo demo={KIND_DEMOS.nullable} helperText="A nullable param accepts config=null." />
          </Column>
        }
        right={
          <MonacoEditor
            language="typescript"
            value={`
p.string('fixed').locked();        // always resolves to 'fixed'
p.object({ a: 1 }).nullable();     // config=null resolves to null
p.string('').ephemeral();          // excluded from saved defaults
p.string('').ignored();            // excluded from change detection
p.string('').source('state');      // read from location.state
p.string('').source('transient');  // read from the transient values

engine.describeParams();
// { page: { kind: 'number', min: 1, max: 50, source: 'search', locked: false, ... } }`}
          />
        }
      />

      <DemoSection
        id="Search Params: Snapshot"
        primary="Snapshot"
        secondary="A snapshot is an immutable set of resolved values. These results use the playground inputs above."
        left={
          <form.Subscribe
            selector={state => state.values.components.search_params.values}
            children={values => <SnapshotResults {...values} />}
          />
        }
        right={
          <MonacoEditor
            language="typescript"
            value={`
snapshot.get('page');                  // 3, or null for an unknown key
snapshot.has('filters', 'type:file');  // true when the value is present
snapshot.pick(['page', 'sort']);       // new snapshot with only those keys
snapshot.omit(['config']);             // new snapshot without those keys
snapshot.defaults();                   // new snapshot reset to the defaults
snapshot.set(prev => ({ ...prev, page: prev.page + 1 }));

snapshot.sourceKeys('state');          // keys read from location.state
snapshot.ephemeralKeys();              // keys excluded from saved defaults

snapshot.toObject();                   // deep copy of the values
snapshot.toParams();                   // URLSearchParams
snapshot.toString();                   // sorted query string`}
          />
        }
      />

      <DemoSection
        id="Search Params: Live store"
        primary="Live store"
        secondary={
          <>
            <span>{'The real provider and hook, wired to the url of this page. '}</span>
            <span>{'The tab param is part of the params so that writing them back keeps this library tab open.'}</span>
          </>
        }
        left={
          <LIVE_STORE.SearchParamsProvider params={LIVE_PARAMS} storageKey={LIVE_STORAGE_KEY}>
            <LiveStoreControls />
          </LIVE_STORE.SearchParamsProvider>
        }
        right={
          <MonacoEditor
            language="typescript"
            value={`
const { SearchParamsProvider, useSearchParams } = createSearchParamsStore();

<SearchParamsProvider params={PARAMS} storageKey="my-key">
  <Page />
</SearchParamsProvider>

const { search, setSearchObject, setSearchParams, setDefaultParams, clearDefaultParams } =
  useSearchParams<typeof PARAMS>();

search.get('live_page');

// Writes the delta to location.search and the state params to location.state
setSearchObject(prev => ({ ...prev, live_page: 2 }));
setSearchParams(new URLSearchParams('live_page=3'), true); // replace the history entry

// Saves the current values as the defaults of the user in localStorage
setDefaultParams(search.toObject());
clearDefaultParams();`}
          />
        }
      />

      <PageSection
        id="Search Params: Self tests"
        primary="Self tests"
        secondary="Assertions on the search-params feature, evaluated each time this section renders."
        anchor
      >
        <ChecksTable />
      </PageSection>
    </DemoContainer>
  );
});

SearchParamsSection.displayName = 'SearchParamsSection';
