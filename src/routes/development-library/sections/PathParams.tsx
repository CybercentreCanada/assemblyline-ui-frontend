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
      tab: (typeof TAB_VALUES)[number];
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

const FILE_VIEWER_CODEC = createPathParamsCodec('/file/viewer/:id/:tab')(b => ({
  id: b.string(),
  tab: b.enum(TAB_VALUES, 'ascii')
}));

const ITEMS_CODEC = createPathParamsCodec('/items/:page/:sort/:descending')(b => ({
  page: b.number(1),
  sort: b.enum(['name', 'date'] as const, 'name'),
  descending: b.boolean(false)
}));

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
            <span>{'Values are URL-encoded and written as they are, without validation.'}</span>
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
            validation={false}
            value={`
import { createPathParamsCodec } from 'features/path-params';

const codec = createPathParamsCodec('/file/viewer/:id/:tab')(b => ({
  id: b.string(),
  tab: b.enum(['ascii', 'code', 'hex'] as const, 'ascii')
}));

codec.stringify({ id: 'abc123', tab: 'hex' });
// '/file/viewer/abc123/hex'

codec.stringify({ id: 'a b/c', tab: 'hex' });
// '/file/viewer/a%20b%2Fc/hex'

// Values are not validated
codec.stringify({ id: '', tab: 'hex' });
// '/file/viewer//hex'`}
          />
        }
      />

      <DemoSection
        id="Path Params: Parse"
        primary="Parse"
        secondary={
          <>
            <span>{'Read typed values from a Location pathname, by position. '}</span>
            <span>
              {
                'Static segments are not compared. A missing or empty segment and a value the blueprint does not recognize resolve to its default.'
              }
            </span>
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
                  helperText="Definition: /file/viewer/:id/:tab"
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
            validation={false}
            value={`
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
// { id: '', tab: 'ascii' }         <- empty segment, defaults`}
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
                  helperText="Definition: /items/:page/:sort/:descending"
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
            validation={false}
            value={`
const codec = createPathParamsCodec('/items/:page/:sort/:descending')(b => ({
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
    </DemoContainer>
  );
});
