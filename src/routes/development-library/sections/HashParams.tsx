import { styled, Typography } from '@mui/material';
import { createHashParamCodec } from 'features/hash-params';
import type { ReactNode } from 'react';
import { memo, useCallback } from 'react';
import type { Location } from 'react-router';
import { useLocation, useNavigate } from 'react-router';
import { DemoContainer } from 'routes/development-library/components/DemoContainer';
import { DemoSection } from 'routes/development-library/components/DemoSection';
import { useForm } from 'routes/development-library/contexts/form';
import { SelectInput } from 'ui/inputs/SelectInput';
import { TextInput } from 'ui/inputs/TextInput';
import { PageSection } from 'ui/layouts/PageSection';
import MonacoEditor from 'ui/MonacoEditor';

//*****************************************************************************************
// Library State
//*****************************************************************************************

const SECTIONS = ['overview', 'installation', 'usage'] as const;

type Section = (typeof SECTIONS)[number];

const SECTION_OPTIONS = [
  { primary: 'None', value: null },
  { primary: 'Overview', value: 'overview' },
  { primary: 'Installation', value: 'installation' },
  { primary: 'Usage', value: 'usage' }
] as const;

export type HashParamsLibraryState = {
  hash_params: {
    name: string;
    values: {
      hash: string;
      section: Section | null;
      text: string;
    };
  };
};

export const HASH_PARAMS_LIBRARY_STATE: HashParamsLibraryState = {
  hash_params: {
    name: 'Hash Params',
    values: {
      hash: '#usage',
      section: 'usage',
      text: 'hello world'
    }
  }
} as const;

//*****************************************************************************************
// Codecs
//*****************************************************************************************

const STRING_CODEC = createHashParamCodec<string>()(b => b.string());

const STRING_DEFAULT_CODEC = createHashParamCodec<string>()(b => b.string('overview'));

const SECTION_CODEC = createHashParamCodec<Section>()(b => b.enum(SECTIONS));

const SECTION_DEFAULT_CODEC = createHashParamCodec<Section>()(b => b.enum(SECTIONS, 'overview'));

const makeLocation = (hash: string): Location => ({ pathname: '/library', search: '', hash, state: null, key: 'demo' });

const show = (fn: () => unknown): string => {
  try {
    const result = fn();
    return result === undefined ? 'undefined' : JSON.stringify(result);
  } catch (error) {
    return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  }
};

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
    <Typography component="pre" variant="body2" sx={{ margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      {children}
    </Typography>
  </div>
));

ResultBlock.displayName = 'ResultBlock';

//*****************************************************************************************
// Live Hash
//*****************************************************************************************

const LiveHash = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = useCallback(
    (_event: unknown, next: Section | null) =>
      void navigate(
        {
          pathname: location.pathname,
          search: location.search,
          hash: SECTION_CODEC.stringify(next ?? undefined)
        },
        { replace: true }
      ),
    [location.pathname, location.search, navigate]
  );

  return (
    <Column>
      <SelectInput
        label="section"
        value={SECTION_CODEC.parse(location) ?? null}
        options={SECTION_OPTIONS}
        onChange={handleChange}
      />
      <ResultBlock label="location.hash">{location.hash || '(empty)'}</ResultBlock>
      <ResultBlock label="sectionCodec.parse(location)">{show(() => SECTION_CODEC.parse(location))}</ResultBlock>
      <ResultBlock label="stringCodec.parse(location)">{show(() => STRING_CODEC.parse(location))}</ResultBlock>
    </Column>
  );
});

LiveHash.displayName = 'LiveHash';

//*****************************************************************************************
// Hash Params Section
//*****************************************************************************************

export const HashParamsSection = memo(() => {
  const form = useForm();

  const handleHash = useCallback(
    (_event: unknown, next: string) => form.setFieldValue('components.hash_params.values.hash', next),
    [form]
  );

  const handleText = useCallback(
    (_event: unknown, next: string) => form.setFieldValue('components.hash_params.values.text', next),
    [form]
  );

  const handleSection = useCallback(
    (_event: unknown, next: Section | null) => form.setFieldValue('components.hash_params.values.section', next),
    [form]
  );

  return (
    <DemoContainer>
      <PageSection primary="Hash Params Codec" anchor subheader divider />

      <DemoSection
        id="Hash Params: Parse"
        primary="Parse"
        secondary="Read one typed value from the hash of a Location. A missing or empty hash and a value that does not match resolve to the default, or to undefined when there is none."
        left={
          <Column>
            <form.Subscribe
              selector={state => state.values.components.hash_params.values.hash}
              children={hash => (
                <>
                  <TextInput
                    label="location.hash"
                    value={hash}
                    helperText="Try #usage, #other, #a%20b or an empty value."
                    onChange={handleHash}
                  />
                  <ResultBlock label="b.string()">{show(() => STRING_CODEC.parse(makeLocation(hash)))}</ResultBlock>
                  <ResultBlock label="b.string('overview')">
                    {show(() => STRING_DEFAULT_CODEC.parse(makeLocation(hash)))}
                  </ResultBlock>
                  <ResultBlock label="b.enum(['overview', 'installation', 'usage'])">
                    {show(() => SECTION_CODEC.parse(makeLocation(hash)))}
                  </ResultBlock>
                  <ResultBlock label="b.enum([...], 'overview')">
                    {show(() => SECTION_DEFAULT_CODEC.parse(makeLocation(hash)))}
                  </ResultBlock>
                </>
              )}
            />
          </Column>
        }
        right={
          <MonacoEditor
            language="typescript"
            value={`
type Section = 'overview' | 'installation' | 'usage';

const codec = createHashParamCodec<Section>()(b => b.enum(['overview', 'installation', 'usage']));

codec.parse(location); // location.hash = '#usage'
// 'usage'

codec.parse(location); // '#other'
// undefined  <- no match and no default

const withDefault = createHashParamCodec<Section>()(b => b.enum(['overview', 'installation', 'usage'], 'overview'));

withDefault.parse(location); // '#other' or ''
// 'overview'

createHashParamCodec<string>()(b => b.string()).parse(location); // '#a%20b'
// 'a b'  <- decoded`}
          />
        }
      />

      <DemoSection
        id="Hash Params: Stringify"
        primary="Stringify"
        secondary="Build a hash from a typed value. The value is URI-encoded, and a value equal to the default, or no value, gives an empty hash."
        left={
          <Column>
            <form.Subscribe
              selector={state => state.values.components.hash_params.values.text}
              children={text => (
                <>
                  <TextInput
                    label="text"
                    value={text}
                    helperText="Try overview, a b/c or an empty value."
                    onChange={handleText}
                  />
                  <ResultBlock label="b.string().stringify(text)">
                    {show(() => STRING_CODEC.stringify(text))}
                  </ResultBlock>
                  <ResultBlock label="b.string('overview').stringify(text)">
                    {show(() => STRING_DEFAULT_CODEC.stringify(text))}
                  </ResultBlock>
                </>
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.hash_params.values.section}
              children={section => (
                <>
                  <SelectInput label="section" value={section} options={SECTION_OPTIONS} onChange={handleSection} />
                  <ResultBlock label="b.enum([...]).stringify(section)">
                    {show(() => SECTION_CODEC.stringify(section ?? undefined))}
                  </ResultBlock>
                  <ResultBlock label="b.enum([...], 'overview').stringify(section)">
                    {show(() => SECTION_DEFAULT_CODEC.stringify(section ?? undefined))}
                  </ResultBlock>
                </>
              )}
            />
          </Column>
        }
        right={
          <MonacoEditor
            language="typescript"
            value={`
codec.stringify('usage');      // '#usage'
codec.stringify(undefined);    // ''

withDefault.stringify('overview'); // ''  <- the default is not written
withDefault.stringify('usage');    // '#usage'

stringCodec.stringify('a b/c');    // '#a%20b%2Fc'
stringCodec.stringify('');         // ''

// Malformed UTF-16 such as a lone surrogate throws a URIError
stringCodec.stringify('\\uD800');`}
          />
        }
      />

      <DemoSection
        id="Hash Params: Live"
        primary="Live"
        secondary="Reads and writes the real hash of this page. The tab in the search is kept, so the library stays open."
        left={<LiveHash />}
        right={
          <MonacoEditor
            language="typescript"
            value={`
const location = useLocation();
const navigate = useNavigate();

codec.parse(location);

navigate(
  { pathname: location.pathname, search: location.search, hash: codec.stringify('usage') },
  { replace: true }
);`}
          />
        }
      />

      <DemoSection
        id="Hash Params: Blueprints"
        primary="Blueprints"
        secondary="Enum options must have unique string forms, and an empty option is only allowed as the default because an empty hash means the default."
        left={
          <Column>
            <ResultBlock label="b.enum(['a', 'b'])">
              {show(() => createHashParamCodec<string>()(b => b.enum(['a', 'b'])).type)}
            </ResultBlock>
            <ResultBlock label="b.enum([1, '1'])">
              {show(() => createHashParamCodec<string | number>()(b => b.enum([1, '1'])).type)}
            </ResultBlock>
            <ResultBlock label="b.enum(['', 'a'])">
              {show(() => createHashParamCodec<string>()(b => b.enum(['', 'a'])).type)}
            </ResultBlock>
            <ResultBlock label="b.enum(['', 'a'], '')">
              {show(() => createHashParamCodec<string>()(b => b.enum(['', 'a'], '')).type)}
            </ResultBlock>
          </Column>
        }
        right={
          <MonacoEditor
            language="typescript"
            value={`
// Accepted
b.enum(['a', 'b']);

// Rejected: 1 and '1' serialize to the same text
b.enum([1, '1']);
// TypeError

// Rejected: an empty option must be the configured default
b.enum(['', 'a']);
// TypeError

// Accepted
b.enum(['', 'a'], '');`}
          />
        }
      />
    </DemoContainer>
  );
});

HashParamsSection.displayName = 'HashParamsSection';
