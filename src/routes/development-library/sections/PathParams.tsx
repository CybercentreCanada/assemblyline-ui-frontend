import { Typography, useTheme } from '@mui/material';
import { createPathParamsCodec } from 'features/path-params';
import React from 'react';
import type { Location } from 'react-router';
import { DemoContainer } from 'routes/development-library/components/DemoContainer';
import { DemoSection } from 'routes/development-library/components/DemoSection';
import { useForm } from 'routes/development-library/contexts/form';
import { SelectInput } from 'ui/inputs/SelectInput';
import { TextInput } from 'ui/inputs/TextInput';
import { PageSection } from 'ui/layouts/PageSection';
import MonacoEditor from 'ui/MonacoEditor';

const TAB_VALUES = ['ascii', 'code', 'hex'] as const;

const TAB_OPTIONS = [
  { primary: 'None', value: null },
  { primary: 'ASCII', value: 'ascii' },
  { primary: 'Code', value: 'code' },
  { primary: 'Hex', value: 'hex' }
] as const;

export type PathParamsLibraryState = {
  path_params: {
    name: string;
    values: {
      sectionOpen: boolean;
      id: string;
      tab: (typeof TAB_VALUES)[number] | null;
      pathname: string;
      itemsPathname: string;
    };
  };
};

export const PATH_PARAMS_LIBRARY_STATE: PathParamsLibraryState = {
  path_params: {
    name: 'Path Params',
    values: {
      sectionOpen: true,
      id: 'abc123',
      tab: 'ascii',
      pathname: '/file/viewer/abc123/hex',
      itemsPathname: '/items/2/date/true'
    }
  }
} as const;

const FILE_VIEWER_CODEC = createPathParamsCodec('/file/viewer/:id/:tab?')(b => ({
  id: b.string(),
  tab: b.enum(TAB_VALUES, 'ascii')
}));

const ITEMS_CODEC = createPathParamsCodec('/items/:page/:sort?/:descending?')(b => ({
  page: b.number(1),
  sort: b.enum(['name', 'date'] as const, 'name'),
  descending: b.boolean(false)
}));

const PATTERNS = [
  '/path/:param',
  '/path/:param?',
  '/path/:param?/:other?',
  '/path/:param?/:other',
  '/path/:param?/:other/:next?',
  '/item/:id/:id',
  '/files/:id/*'
] as const;

const makeLocation = (pathname: string): Location => ({ pathname, search: '', hash: '', state: null, key: 'demo' });

const run = (fn: () => unknown): string => {
  try {
    const result = fn();
    return typeof result === 'string' ? result : JSON.stringify(result, null, 2);
  } catch (error) {
    return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  }
};

const ResultBlock = React.memo(({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Typography color="textSecondary" variant="caption">
      {label}
    </Typography>
    <Typography component="pre" variant="body2" sx={{ margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      {children}
    </Typography>
  </div>
));

export const PathParamsSection = React.memo(() => {
  const theme = useTheme();
  const form = useForm();

  return (
    <DemoContainer>
      <PageSection primary="Path Params Codec" anchor subheader divider />

      <DemoSection
        id="Path Params: Stringify"
        primary="Stringify"
        secondary={
          <>
            <span>{'Build a pathname from typed values. '}</span>
            <span>
              {'Values are URL-encoded, and an omitted optional param is dropped from the end of the pathname.'}
            </span>
          </>
        }
        left={
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
            <form.Subscribe
              selector={state => state.values.components.path_params.values.id}
              children={value => (
                <TextInput
                  label="id"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.path_params.values.id', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.path_params.values.tab}
              children={value => (
                <SelectInput
                  label="tab"
                  value={value}
                  options={TAB_OPTIONS}
                  displayEmpty
                  onChange={(event, next) => form.setFieldValue('components.path_params.values.tab', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state =>
                [state.values.components.path_params.values.id, state.values.components.path_params.values.tab] as const
              }
              children={([id, tab]) => (
                <ResultBlock label="codec.stringify(params)">
                  {run(() => FILE_VIEWER_CODEC.stringify({ id, tab }))}
                </ResultBlock>
              )}
            />
          </div>
        }
        right={
          <MonacoEditor
            language="typescript"
            value={`
import { createPathParamsCodec } from 'features/path-params';

const codec = createPathParamsCodec('/file/viewer/:id/:tab?')(b => ({
  id: b.string(),
  tab: b.enum(['ascii', 'code', 'hex'] as const, 'ascii')
}));

codec.stringify({ id: 'abc123', tab: 'hex' });
// '/file/viewer/abc123/hex'

codec.stringify({ id: 'abc123' });
// '/file/viewer/abc123'

codec.stringify({ id: 'a b/c' });
// '/file/viewer/a%20b%2Fc'

// Empty, '.' and '..' values are rejected
codec.stringify({ id: '' });
// TypeError`}
          />
        }
      />

      <DemoSection
        id="Path Params: Parse"
        primary="Parse"
        secondary={
          <>
            <span>{'Read typed values from a Location pathname. '}</span>
            <span>{'Missing params and values the blueprint does not recognize resolve to its default.'}</span>
          </>
        }
        left={
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
            <form.Subscribe
              selector={state => state.values.components.path_params.values.pathname}
              children={value => (
                <TextInput
                  label="pathname"
                  value={value}
                  helperText="Pattern: /file/viewer/:id/:tab?"
                  onChange={(event, next) => form.setFieldValue('components.path_params.values.pathname', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.path_params.values.pathname}
              children={pathname => (
                <ResultBlock label="codec.parse(location)">
                  {run(() => FILE_VIEWER_CODEC.parse(makeLocation(pathname ?? '')))}
                </ResultBlock>
              )}
            />
          </div>
        }
        right={
          <MonacoEditor
            language="typescript"
            value={`
codec.parse(location); // location.pathname = '/file/viewer/abc123/hex'
// { id: 'abc123', tab: 'hex' }

codec.parse(location); // '/file/viewer/abc123'
// { id: 'abc123', tab: 'ascii' }   <- default of the omitted tab

codec.parse(location); // '/file/viewer/abc123/unknown'
// { id: 'abc123', tab: 'ascii' }   <- unrecognized value

codec.parse(location); // '/file/viewer/a%20b'
// { id: 'a b', tab: 'ascii' }      <- decoded

codec.parse(location); // '/file/viewer/'
// TypeError                        <- empty value`}
          />
        }
      />

      <DemoSection
        id="Path Params: Blueprints"
        primary="Blueprints"
        secondary={
          <>
            <span>{'Each param is described by a blueprint: string, number, boolean or enum. '}</span>
            <span>{'A value that cannot be converted falls back to the default of the blueprint.'}</span>
          </>
        }
        left={
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
            <form.Subscribe
              selector={state => state.values.components.path_params.values.itemsPathname}
              children={value => (
                <TextInput
                  label="pathname"
                  value={value}
                  helperText="Pattern: /items/:page/:sort?/:descending?"
                  onChange={(event, next) => form.setFieldValue('components.path_params.values.itemsPathname', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.path_params.values.itemsPathname}
              children={pathname => (
                <ResultBlock label="codec.parse(location)">
                  {run(() => ITEMS_CODEC.parse(makeLocation(pathname ?? '')))}
                </ResultBlock>
              )}
            />
          </div>
        }
        right={
          <MonacoEditor
            language="typescript"
            value={`
const codec = createPathParamsCodec('/items/:page/:sort?/:descending?')(b => ({
  page: b.number(1),                           // 'abc' -> 1
  sort: b.enum(['name', 'date'] as const, 'name'), // 'other' -> 'name'
  descending: b.boolean(false)                 // 'true' or '1' -> true
}));

codec.parse(location); // '/items/2/date/true'
// { page: 2, sort: 'date', descending: true }

codec.parse(location); // '/items/abc'
// { page: 1, sort: 'name', descending: false }`}
          />
        }
      />

      <DemoSection
        id="Path Params: Optional params"
        primary="Optional params"
        secondary={
          <>
            <span>{'Optional params are only supported at the end of the path. '}</span>
            <span>{'Repeated param names and wildcards are rejected when the codec is created.'}</span>
          </>
        }
        left={
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
            {PATTERNS.map(pattern => (
              <ResultBlock key={pattern} label={pattern}>
                {run(() => {
                  createPathParamsCodec(pattern as string);
                  return 'Supported';
                })}
              </ResultBlock>
            ))}
          </div>
        }
        right={
          <MonacoEditor
            language="typescript"
            value={`
// Supported
createPathParamsCodec('/path/:param');
createPathParamsCodec('/path/:param?');
createPathParamsCodec('/path/:param?/:other?');

// Rejected: an optional param is followed by a required segment
createPathParamsCodec('/path/:param?/:other');
createPathParamsCodec('/path/:param?/:other/:next?');

// Rejected: param names must be unique and alphanumeric
createPathParamsCodec('/item/:id/:id');
createPathParamsCodec('/files/:id/*');

// An omitted optional before a supplied one is written with its default
const codec = createPathParamsCodec('/path/:param?/:other?')(b => ({
  param: b.string('default'),
  other: b.string('default')
}));

codec.stringify({});                  // '/path'
codec.stringify({ param: 'x' });      // '/path/x'
codec.stringify({ other: 'y' });      // '/path/default/y'`}
          />
        }
      />
    </DemoContainer>
  );
});
