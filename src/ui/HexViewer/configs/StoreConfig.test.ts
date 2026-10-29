import type { KeyboardEvent } from 'react';
import type { ReducersConfig } from 'ui/HexViewer/configs/StoreConfig';
import type { AppDispatchers } from 'ui/HexViewer/dispatchers/useAppDispatcher';
import type { BodyDispatchers } from 'ui/HexViewer/dispatchers/useBodyDispatcher';
import type { CellDispatchers } from 'ui/HexViewer/dispatchers/useCellDispatcher';
import type { ScrollDispatchers } from 'ui/HexViewer/dispatchers/useScrollDispatcher';
import type { SettingDispatchers } from 'ui/HexViewer/dispatchers/useSettingDispatcher';
import type { ToolbarDispatchers } from 'ui/HexViewer/dispatchers/useToolbarDispatcher';
import type { StoreAction } from 'ui/HexViewer/stores/useAction';
import type { Store } from 'ui/HexViewer/stores/useStore';
import { describe, expectTypeOf, it } from 'vitest';

describe('DispatchersConfig', () => {
  it('allows omitted payloads across action groups', () => {
    expectTypeOf<Parameters<AppDispatchers['onAppClickAway']>>().toEqualTypeOf<[payload?: undefined]>();
    expectTypeOf<Parameters<BodyDispatchers['onBodyMouseLeave']>>().toEqualTypeOf<[payload?: undefined]>();
    expectTypeOf<Parameters<ScrollDispatchers['onScrollTouchEnd']>>().toEqualTypeOf<[payload?: undefined]>();
    expectTypeOf<Parameters<SettingDispatchers['onSettingReset']>>().toEqualTypeOf<[payload?: undefined]>();
    expectTypeOf<Parameters<ToolbarDispatchers['onSearchBarFocus']>>().toEqualTypeOf<[payload?: undefined]>();
  });

  it('keeps object payloads required, including objects with optional fields', () => {
    expectTypeOf<Parameters<AppDispatchers['onAppDataChange']>>().toEqualTypeOf<[payload: { data: string }]>();
    expectTypeOf<Parameters<BodyDispatchers['onBodyResize']>>().toEqualTypeOf<
      [payload: { width?: number; height?: number }]
    >();
    expectTypeOf<Parameters<ToolbarDispatchers['onSearchBarChange']>>().toEqualTypeOf<[payload: { value: string }]>();
    expectTypeOf<Parameters<CellDispatchers['onCellMouseDown']>['length']>().toEqualTypeOf<2>();
  });

  it('keeps guard arguments required even without a payload', () => {
    expectTypeOf<Parameters<BodyDispatchers['onCopyKeyDown']>['length']>().toEqualTypeOf<2>();
    expectTypeOf<Parameters<BodyDispatchers['onCopyKeyDown']>[0]>().toEqualTypeOf<undefined>();
    expectTypeOf<Parameters<BodyDispatchers['onCopyKeyDown']>[1]['event']>().toEqualTypeOf<KeyboardEvent>();
    expectTypeOf<Parameters<ToolbarDispatchers['onSearchBarKeyDown']>['length']>().toEqualTypeOf<2>();
  });
});

describe('ReducersConfig', () => {
  it('allows store-only calls for actions without payloads', () => {
    expectTypeOf<Parameters<ReducersConfig<StoreAction>['copyKeyDown']>>().toEqualTypeOf<
      [store: Store, payload?: undefined, prevStore?: Store]
    >();
    expectTypeOf<Parameters<ReducersConfig<StoreAction>['appClickAway']>>().toEqualTypeOf<
      [store: Store, payload?: undefined, prevStore?: Store]
    >();
    expectTypeOf<Parameters<ReducersConfig<StoreAction>['searchClear']>>().toEqualTypeOf<
      [store: Store, payload?: undefined, prevStore?: Store]
    >();
  });

  it('keeps object payloads required and previous state optional', () => {
    expectTypeOf<Parameters<ReducersConfig<StoreAction>['bodyResize']>>().toEqualTypeOf<
      [store: Store, payload: { width?: number; height?: number }, prevStore?: Store]
    >();
    expectTypeOf<Parameters<ReducersConfig<StoreAction>['searchBarChange']>>().toEqualTypeOf<
      [store: Store, payload: { value: string }, prevStore?: Store]
    >();
  });
});
