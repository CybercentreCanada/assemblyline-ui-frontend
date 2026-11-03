import { memo, useCallback } from 'react';
import {
  StoreDemoCheckbox,
  StoreDemoRecreateButton,
  StoreDemoSection,
  StoreDemoTextField,
  StoreDemoValues
} from 'routes/development-library/sections/store/StoreDemo.components';
import { useRenderCount } from 'routes/development-library/sections/store/store.hooks';
import type { StoreDemoState } from 'routes/development-library/sections/store/store.models';
import { DEFAULT_STORE_DEMO_STATE } from 'routes/development-library/sections/store/store.models';
import { PageSection } from 'ui/layouts/PageSection';
import type { StoreApi, UseBoundStore } from 'zustand';
import { create } from 'zustand';

type DemoStore = UseBoundStore<StoreApi<StoreDemoState>>;

const createDemoStore = (): DemoStore => create<StoreDemoState>(() => structuredClone(DEFAULT_STORE_DEMO_STATE));

//*****************************************************************************************
// Readers: select the root store and destructure it, or select the leaf directly
//*****************************************************************************************

type Readers = {
  useChecked: (useStore: DemoStore) => boolean;
  useFirst: (useStore: DemoStore) => string;
  useLast: (useStore: DemoStore) => string;
};

const rootReaders: Readers = {
  useChecked: useStore => {
    const {
      settings: {
        options: {
          consent: { checked }
        }
      }
    } = useStore(s => s);
    return checked;
  },
  useFirst: useStore => {
    const {
      account: {
        profile: {
          name: { first }
        }
      }
    } = useStore(s => s);
    return first;
  },
  useLast: useStore => {
    const {
      account: {
        identity: {
          family: {
            details: { last }
          }
        }
      }
    } = useStore(s => s);
    return last;
  }
};

const leafReaders: Readers = {
  useChecked: useStore => useStore(s => s.settings.options.consent.checked),
  useFirst: useStore => useStore(s => s.account.profile.name.first),
  useLast: useStore => useStore(s => s.account.identity.family.details.last)
};

const ROOT_READ_SNIPPETS = {
  checked: 'const { settings: { options: { consent: { checked } } } } = useStore(s => s);',
  first: 'const { account: { profile: { name: { first } } } } = useStore(s => s);',
  last: 'const { account: { identity: { family: { details: { last } } } } } = useStore(s => s);'
};

const LEAF_READ_SNIPPETS = {
  checked: 'const checked = useStore(s => s.settings.options.consent.checked);',
  first: 'const first = useStore(s => s.account.profile.name.first);',
  last: 'const last = useStore(s => s.account.identity.family.details.last);'
};

//*****************************************************************************************
// Writers: spread to create new nested objects, or mutate in place
//*****************************************************************************************

type Writers = {
  recreate: (store: DemoStore) => void;
  setChecked: (store: DemoStore, checked: boolean) => void;
  setFirst: (store: DemoStore, first: string) => void;
  setLast: (store: DemoStore, last: string) => void;
};

const spreadWriters: Writers = {
  recreate: store => store.setState(structuredClone(DEFAULT_STORE_DEMO_STATE)),
  setChecked: (store, checked) =>
    store.setState(s => ({
      settings: {
        ...s.settings,
        options: { ...s.settings.options, consent: { ...s.settings.options.consent, checked } }
      }
    })),
  setFirst: (store, first) =>
    store.setState(s => ({
      account: {
        ...s.account,
        profile: { ...s.account.profile, name: { ...s.account.profile.name, first } }
      }
    })),
  setLast: (store, last) =>
    store.setState(s => ({
      account: {
        ...s.account,
        identity: {
          ...s.account.identity,
          family: { ...s.account.identity.family, details: { ...s.account.identity.family.details, last } }
        }
      }
    }))
};

// Zustand skips notifying when an updater returns the same reference, so the root is shallow-copied.
const mutateWriters: Writers = {
  recreate: store => store.setState(structuredClone(DEFAULT_STORE_DEMO_STATE)),
  setChecked: (store, checked) =>
    store.setState(s => {
      s.settings.options.consent.checked = checked;
      return { ...s };
    }),
  setFirst: (store, first) =>
    store.setState(s => {
      s.account.profile.name.first = first;
      return { ...s };
    }),
  setLast: (store, last) =>
    store.setState(s => {
      s.account.identity.family.details.last = last;
      return { ...s };
    })
};

const SPREAD_WRITE_SNIPPETS = {
  checked: `useStore.setState(s => ({
  settings: {
    ...s.settings,
    options: { ...s.settings.options, consent: { ...s.settings.options.consent, checked: value } }
  }
}));`,
  first: `useStore.setState(s => ({
  account: {
    ...s.account,
    profile: { ...s.account.profile, name: { ...s.account.profile.name, first: value } }
  }
}));`,
  last: `useStore.setState(s => ({
  account: {
    ...s.account,
    identity: {
      ...s.account.identity,
      family: { ...s.account.identity.family, details: { ...s.account.identity.family.details, last: value } }
    }
  }
}));`,
  recreate: 'useStore.setState(structuredClone(DEFAULT_STORE_DEMO_STATE));'
};

const MUTATE_WRITE_SNIPPETS = {
  checked: `useStore.setState(s => {
  s.settings.options.consent.checked = value;
  return { ...s };
});`,
  first: `useStore.setState(s => {
  s.account.profile.name.first = value;
  return { ...s };
});`,
  last: `useStore.setState(s => {
  s.account.identity.family.details.last = value;
  return { ...s };
});`,
  recreate: 'useStore.setState(structuredClone(DEFAULT_STORE_DEMO_STATE));'
};

//*****************************************************************************************
// Variants
//*****************************************************************************************

type MatrixVariant = {
  id: string;
  primary: string;
  readers: Readers;
  secondary: string;
  snippets: { checked: string; first: string; last: string; recreate: string };
  store: DemoStore;
  writers: Writers;
};

const combine = (read: string, write: string) => `${read}\n${write}`;

const VARIANTS: MatrixVariant[] = [
  {
    id: 'root-spread',
    primary: 'zustand: root select, spread update',
    readers: rootReaders,
    secondary: 'Selects the whole store and destructures it. Updates spread every level into new objects.',
    snippets: {
      checked: combine(ROOT_READ_SNIPPETS.checked, SPREAD_WRITE_SNIPPETS.checked),
      first: combine(ROOT_READ_SNIPPETS.first, SPREAD_WRITE_SNIPPETS.first),
      last: combine(ROOT_READ_SNIPPETS.last, SPREAD_WRITE_SNIPPETS.last),
      recreate: SPREAD_WRITE_SNIPPETS.recreate
    },
    store: createDemoStore(),
    writers: spreadWriters
  },
  {
    id: 'root-mutate',
    primary: 'zustand: root select, mutate update',
    readers: rootReaders,
    secondary: 'Selects the whole store and destructures it. Updates mutate the leaf and keep the nested references.',
    snippets: {
      checked: combine(ROOT_READ_SNIPPETS.checked, MUTATE_WRITE_SNIPPETS.checked),
      first: combine(ROOT_READ_SNIPPETS.first, MUTATE_WRITE_SNIPPETS.first),
      last: combine(ROOT_READ_SNIPPETS.last, MUTATE_WRITE_SNIPPETS.last),
      recreate: MUTATE_WRITE_SNIPPETS.recreate
    },
    store: createDemoStore(),
    writers: mutateWriters
  },
  {
    id: 'leaf-spread',
    primary: 'zustand: leaf select, spread update',
    readers: leafReaders,
    secondary: 'Selects each leaf value. Updates spread every level into new objects.',
    snippets: {
      checked: combine(LEAF_READ_SNIPPETS.checked, SPREAD_WRITE_SNIPPETS.checked),
      first: combine(LEAF_READ_SNIPPETS.first, SPREAD_WRITE_SNIPPETS.first),
      last: combine(LEAF_READ_SNIPPETS.last, SPREAD_WRITE_SNIPPETS.last),
      recreate: SPREAD_WRITE_SNIPPETS.recreate
    },
    store: createDemoStore(),
    writers: spreadWriters
  },
  {
    id: 'leaf-mutate',
    primary: 'zustand: leaf select, mutate update',
    readers: leafReaders,
    secondary: 'Selects each leaf value. Updates mutate the leaf and keep the nested references.',
    snippets: {
      checked: combine(LEAF_READ_SNIPPETS.checked, MUTATE_WRITE_SNIPPETS.checked),
      first: combine(LEAF_READ_SNIPPETS.first, MUTATE_WRITE_SNIPPETS.first),
      last: combine(LEAF_READ_SNIPPETS.last, MUTATE_WRITE_SNIPPETS.last),
      recreate: MUTATE_WRITE_SNIPPETS.recreate
    },
    store: createDemoStore(),
    writers: mutateWriters
  }
];

//*****************************************************************************************
// Matrix First Field
//*****************************************************************************************

type MatrixProps = {
  /** Combination of read and write strategies being tested. */
  variant: MatrixVariant;
};

const MatrixFirstField = memo(({ variant }: MatrixProps) => {
  const countRef = useRenderCount();
  const value = variant.readers.useFirst(variant.store);

  const handleChange = useCallback((first: string) => variant.writers.setFirst(variant.store, first), [variant]);

  return (
    <StoreDemoTextField
      countRef={countRef}
      implementation={variant.snippets.first}
      label="First"
      value={value}
      onChange={handleChange}
    />
  );
});

MatrixFirstField.displayName = 'MatrixFirstField';

//*****************************************************************************************
// Matrix Last Field
//*****************************************************************************************

const MatrixLastField = memo(({ variant }: MatrixProps) => {
  const countRef = useRenderCount();
  const value = variant.readers.useLast(variant.store);

  const handleChange = useCallback((last: string) => variant.writers.setLast(variant.store, last), [variant]);

  return (
    <StoreDemoTextField
      countRef={countRef}
      implementation={variant.snippets.last}
      label="Last"
      value={value}
      onChange={handleChange}
    />
  );
});

MatrixLastField.displayName = 'MatrixLastField';

//*****************************************************************************************
// Matrix Checked Field
//*****************************************************************************************

const MatrixCheckedField = memo(({ variant }: MatrixProps) => {
  const countRef = useRenderCount();
  const checked = variant.readers.useChecked(variant.store);

  const handleChange = useCallback((value: boolean) => variant.writers.setChecked(variant.store, value), [variant]);

  return (
    <StoreDemoCheckbox
      checked={checked}
      countRef={countRef}
      implementation={variant.snippets.checked}
      label="Checked"
      onChange={handleChange}
    />
  );
});

MatrixCheckedField.displayName = 'MatrixCheckedField';

//*****************************************************************************************
// Matrix Recreate Button
//*****************************************************************************************

const MatrixRecreateButton = memo(({ variant }: MatrixProps) => {
  const handleClick = useCallback(() => variant.writers.recreate(variant.store), [variant]);

  return (
    <StoreDemoRecreateButton
      id={`store-demo-zustand-${variant.id}-recreate`}
      implementation={variant.snippets.recreate}
      onClick={handleClick}
    />
  );
});

MatrixRecreateButton.displayName = 'MatrixRecreateButton';

//*****************************************************************************************
// Matrix Values
//*****************************************************************************************

const MatrixValues = memo(({ variant }: MatrixProps) => {
  const values = variant.store(s => s);

  return <StoreDemoValues values={values} />;
});

MatrixValues.displayName = 'MatrixValues';

//*****************************************************************************************
// Store Demo Zustand Matrix Cell
//*****************************************************************************************

const StoreDemoZustandMatrixCell = memo(({ variant }: MatrixProps) => (
  <StoreDemoSection
    primary={variant.primary}
    secondary={variant.secondary}
    implementationLabel="select + setState"
    values={<MatrixValues variant={variant} />}
  >
    <MatrixFirstField variant={variant} />
    <MatrixLastField variant={variant} />
    <MatrixCheckedField variant={variant} />
    <MatrixRecreateButton variant={variant} />
  </StoreDemoSection>
));

StoreDemoZustandMatrixCell.displayName = 'StoreDemoZustandMatrixCell';

//*****************************************************************************************
// Store Demo Zustand Matrix
//*****************************************************************************************

export const StoreDemoZustandMatrix = memo(() => (
  <>
    <PageSection
      primary="zustand: read and write strategies"
      secondary="Reads select the root store or the leaf value. Writes spread new objects or mutate in place."
      subheader
      anchor
    />
    {VARIANTS.map(variant => (
      <StoreDemoZustandMatrixCell key={variant.id} variant={variant} />
    ))}
  </>
));

StoreDemoZustandMatrix.displayName = 'StoreDemoZustandMatrix';
