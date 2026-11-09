import { styled, Typography } from '@mui/material';
import { useStore } from '@tanstack/react-form';
import { createPathParamsCodec } from 'features/path-params';
import type { ReactNode } from 'react';
import { memo, useCallback, useMemo } from 'react';
import type { Location } from 'react-router';
import { DemoContainer } from 'routes/development-library/components/DemoContainer';
import { DemoSection } from 'routes/development-library/components/DemoSection';
import { useForm } from 'routes/development-library/contexts/form';
import { SelectInput } from 'ui/inputs/SelectInput';
import { TextInput } from 'ui/inputs/TextInput';
import { PageSection } from 'ui/layouts/PageSection';
import { MonacoEditor } from 'ui/MonacoEditor';

//*****************************************************************************************
// Library State
//*****************************************************************************************

const TAB_VALUES = ['ascii', 'code', 'hex'] as const;
const NULL_TAB_OPTION_VALUE = '__null_tab__';
const UNDEFINED_TAB_OPTION_VALUE = '__undefined_tab__';

type Tab = (typeof TAB_VALUES)[number] | '' | null | undefined;
type TabOptionValue = Tab | typeof NULL_TAB_OPTION_VALUE | typeof UNDEFINED_TAB_OPTION_VALUE;

/** State of the Path Params section, stored in the library form. */
export type PathParamsLibraryState = {
  path_params: {
    /** Name displayed in the library navigation. */
    name: string;
    /** Values edited by the section. */
    values: {
      /** Value of the `id` parameter. */
      id: string;
      /** Pathname parsed with the items codec. */
      itemsPathname: string;
      /** Pathname parsed with the file viewer codec. */
      pathname: string;
      /** Value of the `tab` parameter. */
      tab: Tab;
    };
  };
};

export const PATH_PARAMS_LIBRARY_STATE: PathParamsLibraryState = {
  path_params: {
    name: 'Path Params',
    values: {
      id: 'abc123',
      itemsPathname: '/items/2/date/true',
      pathname: '/file/viewer/abc123/hex',
      tab: 'ascii'
    }
  }
} as const;

//*****************************************************************************************
// Codecs
//*****************************************************************************************

const FILE_VIEWER_CODEC = createPathParamsCodec('/file/viewer/:id/:tab')(b => ({
  id: b.string(''),
  tab: b.enum(TAB_VALUES, 'ascii')
}));

const ITEMS_CODEC = createPathParamsCodec('/items/:page/:sort/:descending')(b => ({
  page: b.number(1),
  sort: b.enum(['name', 'date'] as const, 'name'),
  descending: b.boolean(false)
}));

const PARSE_BY_FIELD = {
  itemsPathname: ITEMS_CODEC.parse,
  pathname: FILE_VIEWER_CODEC.parse
} as const;

//*****************************************************************************************
// Helpers
//*****************************************************************************************

/**
 * @name createLocation
 * @description Builds a React Router location that only carries a pathname.
 * @param pathname - Pathname of the location
 * @returns A location with an empty search and hash and no state
 */
const createLocation = (pathname: string): Location => ({ pathname, search: '', hash: '', state: null, key: 'demo' });

/**
 * @name stringifyResult
 * @description Runs a function and renders its result, or the error it throws, as text.
 * @param fn - Function to evaluate
 * @returns The string result as-is, otherwise indented JSON, or `Name: message` when `fn` throws
 */
const stringifyResult = (fn: () => unknown): string => {
  try {
    const result = fn();
    return typeof result === 'string' ? result : String(JSON.stringify(result, null, 2));
  } catch (error) {
    return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  }
};

//*****************************************************************************************
// Constants
//*****************************************************************************************

const TAB_OPTIONS = [
  { primary: 'ASCII', value: 'ascii' },
  { primary: 'Code', value: 'code' },
  { primary: 'Hex', value: 'hex' },
  { primary: 'Empty string ("")', value: '' },
  { primary: 'null', value: NULL_TAB_OPTION_VALUE },
  { primary: 'undefined', value: UNDEFINED_TAB_OPTION_VALUE }
] as const;

const RESULT_SX = { margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap' } as const;

const STRINGIFY_SNIPPET = `
import { createPathParamsCodec } from 'features/path-params';

const codec = createPathParamsCodec('/file/viewer/:id/:tab')(b => ({
  id: b.string(),
  tab: b.enum(['ascii', 'code', 'hex'] as const, 'ascii')
}));

codec.stringify({ id: 'abc123', tab: 'hex' });
// '/file/viewer/abc123/hex'

codec.stringify({ id: 'a b/c', tab: 'hex' });
// '/file/viewer/a%20b%2Fc/hex'

codec.stringify({ id: 'abc123', tab: '' });
// '/file/viewer/abc123/ascii' <- unrecognized enum value uses its default

codec.stringify({ id: 'abc123', tab: null });
codec.stringify({ id: 'abc123', tab: undefined });
// '/file/viewer/abc123/ascii' <- nullish values use the blueprint default

// String values are URL-encoded
codec.stringify({ id: '', tab: 'hex' });
// '/file/viewer//hex'`;

const PARSE_SNIPPET = `
codec.parse(location); // location.pathname = '/file/viewer/abc123/hex'
// { id: 'abc123', tab: 'hex' }

codec.parse(location); // '/file/viewer/abc123'
// { id: 'abc123', tab: 'ascii' }   <- default of the missing tab

codec.parse(location); // '/file/viewer/abc123/unknown'
// { id: 'abc123', tab: 'ascii' }   <- unrecognized value

codec.parse(location); // '/file/viewer/a%20b/hex'
// { id: 'a b', tab: 'hex' }        <- decoded

codec.parse(location); // '/other/path/hex'
// { id: 'path', tab: 'hex' }       <- static segments are not compared

codec.parse(location); // '/file/viewer/'
// { id: null, tab: 'ascii' }       <- empty id uses its null default`;

const BLUEPRINTS_SNIPPET = `
const codec = createPathParamsCodec('/items/:page/:sort/:descending')(b => ({
  page: b.number(1),                           // 'abc' -> 1
  sort: b.enum(['name', 'date'] as const, 'name'), // 'other' -> 'name'
  descending: b.boolean(false)                 // 'true' or '1' -> true
}));

codec.parse(location); // '/items/2/date/true'
// { page: 2, sort: 'date', descending: true }

codec.parse(location); // '/items/abc'
// { page: 1, sort: 'name', descending: false }`;

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
  <div aria-live="polite" aria-atomic="true">
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
// Path Params Text Field
//*****************************************************************************************

type PathParamsTextFieldProps = {
  /** Field of the library form that holds the text. */
  field: 'id' | 'itemsPathname' | 'pathname';
  /** Hint displayed under the input. */
  helperText?: string;
  /** Input label. */
  label: string;
};

const PathParamsTextField = memo(({ field, helperText, label }: PathParamsTextFieldProps) => {
  const form = useForm();
  const value = useStore(form.store, state => state.values.components.path_params.values[field]);

  const handleChange = useCallback(
    (_event: unknown, next: string) => form.setFieldValue(`components.path_params.values.${field}`, next),
    [field, form]
  );

  return <TextInput label={label} value={value} helperText={helperText} onChange={handleChange} />;
});

PathParamsTextField.displayName = 'PathParamsTextField';

//*****************************************************************************************
// Path Params Tab Field
//*****************************************************************************************

const PathParamsTabField = memo(() => {
  const form = useForm();
  const value = useStore(form.store, state => state.values.components.path_params.values.tab);
  const selectValue: TabOptionValue =
    value === null ? NULL_TAB_OPTION_VALUE : value === undefined ? UNDEFINED_TAB_OPTION_VALUE : value;

  const handleChange = useCallback(
    (_event: unknown, next: TabOptionValue) => {
      const nextValue = next === NULL_TAB_OPTION_VALUE ? null : next === UNDEFINED_TAB_OPTION_VALUE ? undefined : next;
      form.setFieldValue('components.path_params.values.tab', nextValue);
    },
    [form]
  );

  return <SelectInput label="tab" value={selectValue} options={TAB_OPTIONS} onChange={handleChange} />;
});

PathParamsTabField.displayName = 'PathParamsTabField';

//*****************************************************************************************
// Path Params Stringify Result
//*****************************************************************************************

const PathParamsStringifyResult = memo(() => {
  const form = useForm();
  const id = useStore(form.store, state => state.values.components.path_params.values.id);
  const tab = useStore(form.store, state => state.values.components.path_params.values.tab);

  const result = useMemo(() => stringifyResult(() => FILE_VIEWER_CODEC.stringify({ id, tab })), [id, tab]);

  return <ResultBlock label="codec.stringify(params)">{result}</ResultBlock>;
});

PathParamsStringifyResult.displayName = 'PathParamsStringifyResult';

//*****************************************************************************************
// Path Params Parse Result
//*****************************************************************************************

type PathParamsParseResultProps = {
  /** Field of the library form that holds the pathname to parse. */
  field: keyof typeof PARSE_BY_FIELD;
};

const PathParamsParseResult = memo(({ field }: PathParamsParseResultProps) => {
  const form = useForm();
  const pathname = useStore(form.store, state => state.values.components.path_params.values[field]);

  const result = useMemo(
    () => stringifyResult(() => PARSE_BY_FIELD[field](createLocation(pathname ?? ''))),
    [field, pathname]
  );

  return <ResultBlock label="codec.parse(location)">{result}</ResultBlock>;
});

PathParamsParseResult.displayName = 'PathParamsParseResult';

//*****************************************************************************************
// Path Params Section
//*****************************************************************************************

export const PathParamsSection = memo(() => (
  <DemoContainer>
    <PageSection primary="Path Params Codec" anchor subheader divider />

    <DemoSection
      id="Path Params: Stringify"
      primary="Stringify"
      secondary="Build a pathname from typed values. Values are URL-encoded and written as they are"
      left={
        <Column>
          <PathParamsTextField field="id" label="id" />
          <PathParamsTabField />
          <PathParamsStringifyResult />
        </Column>
      }
      right={<MonacoEditor language="typescript" value={STRINGIFY_SNIPPET} />}
    />

    <DemoSection
      id="Path Params: Parse"
      primary="Parse"
      secondary="Read typed values from a Location pathname, by position. Static segments are not compared. A missing or empty segment and a value the blueprint does not recognize resolve to its default."
      left={
        <Column>
          <PathParamsTextField field="pathname" label="pathname" helperText="Definition: /file/viewer/:id/:tab" />
          <PathParamsParseResult field="pathname" />
        </Column>
      }
      right={<MonacoEditor language="typescript" value={PARSE_SNIPPET} />}
    />

    <DemoSection
      id="Path Params: Blueprints"
      primary="Blueprints"
      secondary="Each param is described by a blueprint: string, number, boolean or enum. A value that cannot be converted falls back to the default of the blueprint."
      left={
        <Column>
          <PathParamsTextField
            field="itemsPathname"
            label="pathname"
            helperText="Definition: /items/:page/:sort/:descending"
          />
          <PathParamsParseResult field="itemsPathname" />
        </Column>
      }
      right={<MonacoEditor language="typescript" value={BLUEPRINTS_SNIPPET} />}
    />
  </DemoContainer>
));

PathParamsSection.displayName = 'PathParamsSection';
