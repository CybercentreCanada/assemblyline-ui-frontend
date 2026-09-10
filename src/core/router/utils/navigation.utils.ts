import type {
  AppNavigateOptions,
  AppNavigationStore,
  AppRouterPage,
  AppRouterStore,
  ExtractNavReturn,
  InferAppNavigationOperationMapFromPath,
  InferAppNavigationPropsFromPath
} from 'core/router';
import {
  addPage,
  getPageDigestFromPage,
  removeNode,
  removePage,
  removePanel,
  setPanel,
  upsertPage,
  upsertPanel
} from 'core/router';
import type { SetStateAction } from 'react';

//*****************************************************************************************
// Navigation
//*****************************************************************************************

export const getDefaultNavigateOptions = function (options: Partial<AppNavigateOptions> = null): AppNavigateOptions {
  return {
    hashScrollIntoView: false,
    href: '',
    ignoreBlocker: false,
    reloadDocument: false,
    replace: false,
    resetScroll: false,
    viewTransition: false,
    ...options
  };
};

export const resolveNavigationIntent = function <const Origin extends AppRoute['path']>(
  nextNav: InferAppNavigationPropsFromPath<Origin>['nav']
): ExtractNavReturn<Origin> {
  if (!nextNav) {
    return { target: null, panelKey: null, operation: null, options: getDefaultNavigateOptions(), dispatch: null };
  }

  let target: ExtractNavReturn<Origin>['target'] = null;
  let panelKey: number | null = null;
  let options: AppNavigateOptions = getDefaultNavigateOptions();
  let operation: ExtractNavReturn<Origin>['operation'] = null;
  let dispatch: ExtractNavReturn<Origin>['dispatch'] = null;

  const buildCaptureOperations = (
    key: 'from' | 'here' | 'to' | 'at',
    atPanelKey: number | null,
    operationOptions: AppNavigateOptions = getDefaultNavigateOptions()
  ) => ({
    create: (operationDispatch: InferAppNavigationOperationMapFromPath<Origin>['create']) => {
      target = key;
      panelKey = atPanelKey;
      options = operationOptions;
      operation = 'create';
      dispatch = operationDispatch;
    },
    update: (operationDispatch: InferAppNavigationOperationMapFromPath<Origin>['update']) => {
      target = key;
      panelKey = atPanelKey;
      options = operationOptions;
      operation = 'update';
      dispatch = operationDispatch;
    },
    search: (operationDispatch: InferAppNavigationOperationMapFromPath<Origin>['search']) => {
      target = key;
      panelKey = atPanelKey;
      options = operationOptions;
      operation = 'search';
      dispatch = operationDispatch;
    },
    only: (operationDispatch: InferAppNavigationOperationMapFromPath<Origin>['only']) => {
      target = key;
      panelKey = atPanelKey;
      options = operationOptions;
      operation = 'only';
      dispatch = operationDispatch;
    },
    closePanel: (operationDispatch: InferAppNavigationOperationMapFromPath<Origin>['closePanel']) => {
      target = key;
      panelKey = atPanelKey;
      options = operationOptions;
      operation = 'closePanel';
      dispatch = operationDispatch;
    }
  });

  const navigationCapture: Parameters<NonNullable<InferAppNavigationPropsFromPath<Origin>['nav']>>[0] = {
    from: (operationOptions: AppNavigateOptions = getDefaultNavigateOptions()) =>
      buildCaptureOperations('from', null, operationOptions),
    here: (operationOptions: AppNavigateOptions = getDefaultNavigateOptions()) =>
      buildCaptureOperations('here', null, operationOptions),
    to: (operationOptions: AppNavigateOptions = getDefaultNavigateOptions()) =>
      buildCaptureOperations('to', null, operationOptions),
    at: (nextPanelKey: number, operationOptions: AppNavigateOptions = getDefaultNavigateOptions()) =>
      buildCaptureOperations('at', nextPanelKey, operationOptions)
  };

  nextNav(navigationCapture);

  return { target, panelKey, operation, options, dispatch };
};

export const applyNavigationDispatch = function <const Value>(
  dispatch: SetStateAction<Value>,
  prevValue: Value
): Value {
  return typeof dispatch === 'function' ? (dispatch as (prevState: Value) => Value)(prevValue) : dispatch;
};

//*****************************************************************************************
// Navigation Store
//*****************************************************************************************

export const applyDefaultNavigationStore = (
  store: AppNavigationStore,
  preference: AppPreferenceStore
): AppNavigationStore => {
  if (store?.panels?.length > 0 && Object.entries(store?.pages || {}).length > 0) return store;

  const [store1, nextPageKey] = addPage(store, { href: '/submit' });
  [store] = upsertPanel(store1, 0, { pageKey: nextPageKey }, preference);

  return store;
};

export const getNavigationStoreFromRouter = (store: AppNavigationStore, router: AppRouterStore): AppNavigationStore => {
  const clonePage = (page: AppRouterPage): AppNavigationStore['pages'][string] => {
    const nextPage = {
      ...page,
      state: page?.state == null ? page?.state : structuredClone(page.state),
      transient: page?.transient == null ? page?.transient : structuredClone(page.transient)
    };

    return nextPage;
  };

  store.id = router.id;

  for (let i = 0; i < router.panels.length; i++) {
    store = setPanel(store, i, router.panels[i]);
  }

  for (let i = store.panels.length - 1; i >= router.panels.length; i--) {
    store = removePanel(store, i);
  }

  for (const [pageKey, page] of Object.entries(router.pages)) {
    const currentPage = store.pages[pageKey];
    const nextDigest = page?.digest || getPageDigestFromPage(page);

    if (currentPage?.digest === nextDigest && currentPage?.scroll === page?.scroll && currentPage?.age === page?.age) {
      continue;
    }

    [store] = upsertPage(store, pageKey, clonePage(page));
  }

  for (const pageKey of Object.keys(store.pages)) {
    if (pageKey in router.pages) continue;
    store = removePage(store, pageKey);
  }

  if ('blockedPages' in (store as Record<string, unknown>)) {
    const navigationStore = store as unknown as AppNavigationStore;
    for (const pageKey of Object.keys(navigationStore.blockedPages)) {
      if (pageKey in router.pages) continue;
      delete navigationStore.blockedPages[pageKey];
    }
  }

  for (const [nodeKey, node] of Object.entries(router.nodes)) {
    const currentNode = store.nodes[nodeKey];

    if (currentNode?.pageKey === node.pageKey) {
      continue;
    }

    store.nodes[nodeKey] = { pageKey: node.pageKey };
  }

  for (const nodeKey of Object.keys(store.nodes)) {
    if (nodeKey in router.nodes) continue;
    store = removeNode(store, nodeKey);
  }

  return store;
};

// export const setPartialNavigationStore = (
//   store: AppNavigationStore,
//   next: Partial<AppNavigationStore>
// ): AppNavigationStore => {
//   const nextStore = getDefaultNavigationStore(next);

//   store.id = nextStore.id;
//   store.panels = structuredClone(nextStore.panels);
//   store.pages = structuredClone(nextStore.pages);
//   store.options.replace = nextStore.options.replace;
//   return store;
// };

export const clearNavigationStore = (store: AppNavigationStore): AppNavigationStore => {
  store.id = null;
  store.panels = [];
  store.nodes = {};
  store.pages = {};
  store.blockedPages = {};
  store.options = getDefaultNavigateOptions();

  return store;
};
