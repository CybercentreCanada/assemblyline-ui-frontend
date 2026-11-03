import { FormApi } from '@tanstack/react-form';
import { enableMapSet, enablePatches, Immer } from 'immer';
import { create as produceMutative } from 'mutative';
import type {
  BenchAdapter,
  BenchDraftRecipe,
  BenchImmutableRecipe,
  BenchRecipes,
  BenchState
} from 'routes/development-library/sections/store/benchmark.models';
import { BenchCounter } from 'routes/development-library/sections/store/benchmark.models';
import { BenchUnsupportedError } from 'routes/development-library/sections/store/benchmark.utils';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';

// Immer only drafts Map, Set and patches after they are enabled; the setting is global to immer.
enableMapSet();
enablePatches();

const immerPlain = new Immer({ autoFreeze: false });
const immerFrozen = new Immer({ autoFreeze: true });

const noop = () => undefined;

/** Synchronous access to a store that lives inside a mounted React provider. */
export type BenchAccess = {
  /** Returns the current state. */
  read: () => BenchState;
  /** Replaces the state with the result of the recipe. */
  write: (recipe: BenchImmutableRecipe) => void;
};

const requireImmutable = ({ immutable }: BenchRecipes): BenchImmutableRecipe => {
  if (!immutable) throw new BenchUnsupportedError();
  return immutable;
};

const zustandAdapter: BenchAdapter = {
  create: initial => {
    const store = createStore<BenchState>()(() => initial);

    return {
      dispose: noop,
      read: () => store.getState(),
      reset: () => store.setState(initial, true),
      update: recipes => store.setState(requireImmutable(recipes)(store.getState()), true)
    };
  },
  id: 'zustand',
  label: 'zustand'
};

const createDraftAdapter = (
  id: string,
  label: string,
  produce: (state: BenchState, recipe: BenchDraftRecipe) => BenchState,
  pick: (recipes: BenchRecipes) => BenchDraftRecipe | undefined
): BenchAdapter => ({
  create: initial => {
    const store = createStore<BenchState>()(() => initial);

    return {
      dispose: noop,
      read: () => store.getState(),
      reset: () => store.setState(initial, true),
      update: recipes => {
        const recipe = pick(recipes);
        if (!recipe) throw new BenchUnsupportedError();

        store.setState(produce(store.getState(), recipe), true);
      }
    };
  },
  id,
  label
});

const immerAdapter = createDraftAdapter(
  'immer',
  'zustand + immer',
  (state, recipe) => immerPlain.produce<BenchState, BenchState>(state, recipe),
  recipes => recipes.immer ?? recipes.draft
);

const immerFrozenAdapter = createDraftAdapter(
  'immer-freeze',
  'zustand + immer (auto-freeze)',
  (state, recipe) => immerFrozen.produce<BenchState, BenchState>(state, recipe),
  recipes => recipes.immer ?? recipes.draft
);

// The middleware drafts with immer's global instance, which auto-freezes; devtools only serializes while the extension is open.
const immerDevtoolsAdapter: BenchAdapter = {
  create: initial => {
    const store = createStore<BenchState>()(devtools(immer(() => initial)));

    return {
      dispose: noop,
      read: () => store.getState(),
      reset: () => store.setState(initial, true),
      update: recipes => {
        const recipe = recipes.immer ?? recipes.draft;
        if (!recipe) throw new BenchUnsupportedError();

        store.setState(recipe as (draft: unknown) => void, true);
      }
    };
  },
  id: 'immer-devtools',
  label: 'zustand + immer + devtools'
};

const mutativeAdapter = createDraftAdapter(
  'mutative',
  'zustand + mutative',
  (state, recipe) =>
    produceMutative(state, recipe, {
      mark: (target, { immutable }) => (target instanceof BenchCounter ? immutable : undefined)
    }),
  recipes => recipes.mutative ?? recipes.draft
);

const createAccessAdapter = (id: string, label: string, getAccess: () => BenchAccess | null): BenchAdapter => ({
  create: initial => {
    const access = getAccess();
    if (!access) throw new Error('The store is not mounted yet');

    access.write(() => initial);

    return {
      dispose: noop,
      read: access.read,
      reset: () => access.write(() => initial),
      update: recipes => access.write(requireImmutable(recipes))
    };
  },
  id,
  label
});

const syncExternalStoreAdapter: BenchAdapter = {
  create: initial => {
    let state = initial;
    const listeners = new Set<() => void>();

    return {
      dispose: () => listeners.clear(),
      read: () => state,
      reset: () => {
        state = initial;
      },
      update: recipes => {
        state = requireImmutable(recipes)(state);
        listeners.forEach(listener => listener());
      }
    };
  },
  id: 'sync-external-store',
  label: 'useSyncExternalStore'
};

const tanStackFormAdapter: BenchAdapter = {
  create: initial => {
    // The form's own types are too deep to instantiate for a state this wide, so only what is used is typed.
    const form = new FormApi({ defaultValues: initial }) as unknown as {
      mount: () => () => void;
      reset: (values: BenchState) => void;
      setFieldValue: (field: string, value: unknown) => void;
      state: { values: BenchState };
    };
    const keys = Object.keys(initial) as (keyof BenchState)[];
    // `state` only follows the form's writes once it is mounted, as `useForm` does.
    const unmount = form.mount();

    return {
      dispose: unmount,
      read: () => form.state.values,
      reset: () => form.reset(initial),
      update: recipes => {
        const previous = form.state.values;
        const next = requireImmutable(recipes)(previous);

        // A form updates one field at a time, so only the fields that changed are written.
        for (const key of keys) {
          if (next[key] !== previous[key]) form.setFieldValue(key, next[key]);
        }
      }
    };
  },
  id: 'tanstack-form',
  label: 'TanStack Form'
};

export type BenchStoreAccessors = {
  /** Access to the store created by `createAppStore`. */
  appStore: () => BenchAccess | null;
  /** Access to the store created by `createStoreContext`. */
  contextStore: () => BenchAccess | null;
};

/**
 * @name createBenchAdapters
 * @description Builds one adapter per store implementation, in the order of the table columns.
 * @param accessors - Getters for the stores that need a mounted React provider
 * @returns The adapters to benchmark
 */
export const createBenchAdapters = ({ appStore, contextStore }: BenchStoreAccessors): BenchAdapter[] => [
  zustandAdapter,
  immerAdapter,
  immerFrozenAdapter,
  immerDevtoolsAdapter,
  mutativeAdapter,
  createAccessAdapter('create-app-store', 'createAppStore', appStore),
  createAccessAdapter('create-store-context', 'createStoreContext', contextStore),
  syncExternalStoreAdapter,
  tanStackFormAdapter
];
