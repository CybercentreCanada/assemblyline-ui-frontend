import { useCallback, useMemo, useState, type FC, type PropsWithChildren } from 'react';
import { useCookiesStore } from '../../cookies';
import { visit, type LeftNavMenuItem, type LeftNavMenuProps } from '../../leftnav';
import { AppLeftNavContext } from '../AppContexts';
import { useAppPreferences } from '../hooks';

export const AppLeftNavProvider: FC<PropsWithChildren> = ({ children }) => {
  const { leftnav } = useAppPreferences();

  const drawerOpen = useCookiesStore(state => state.drawerOpen);

  const setDrawerOpen = useCookiesStore(state => state.setDrawerOpen);

  const [menus, setMenus] = useState<LeftNavMenuProps[]>();

  const _menus = useMemo(() => menus || leftnav.menus, [menus, leftnav.menus]);

  // Open/Close left nav drawer.
  const toggle = useCallback(() => {
    setDrawerOpen(!drawerOpen);
  }, [drawerOpen, setDrawerOpen]);

  // Update the menu specified by the `menuId` parameter.
  const updateMenu = useCallback(
    (menuId: string | number, updater: (current: LeftNavMenuProps) => LeftNavMenuProps) => {
      setMenus(
        _menus.map(_menu => ({
          ..._menu,
          items: visit(
            _menu.items,
            (child: LeftNavMenuItem) => child.type === 'menu' && child.id === menuId,
            (child: LeftNavMenuProps) => updater(child)
          )
        }))
      );
    },
    [_menus]
  );

  // Expand/Collapse, Open/Close the menu specified by the 'menuId' parameter.
  // If drawer is open, it will toggle the `expanded` property, if not it toggles the `open` property.
  const toggleMenu = useCallback(
    (menuId: string | number) => {
      setMenus(
        _menus.map(_menu => ({
          ..._menu,
          items: visit(
            _menu.items,
            (child: LeftNavMenuItem) => child.type === 'menu' && child.id === menuId,
            (child: LeftNavMenuProps) => ({
              ...child,
              expanded: drawerOpen ? !child.expanded : child.expanded,
              popped: drawerOpen ? child.popped : !child.popped
            })
          )
        }))
      );
    },
    [_menus, drawerOpen]
  );

  // Collapse & Close the menu specified by the 'menuId' parameter.
  // If drawer is open, it will set the `expanded` property to false, if not it sets the `open` property to false.
  const closeMenu = useCallback(
    (menuId: string | number) => {
      setMenus(
        _menus.map(_menu => ({
          ..._menu,
          items: visit(
            _menu.items,
            (child: LeftNavMenuItem) => child.type === 'menu' && child.id === menuId,
            (child: LeftNavMenuProps) => ({
              ...child,
              expanded: drawerOpen ? false : child.expanded,
              popped: drawerOpen ? child.popped : false
            })
          )
        }))
      );
    },
    [_menus, drawerOpen]
  );

  // Expand & Open the menu specified by the 'menuId' parameter.
  // If drawer is open, it will set the `expanded` property to true, if not it sets the `open` property to true.
  const openMenu = useCallback(
    (menuId: string | number) => {
      setMenus(
        _menus.map(_menu => ({
          ..._menu,
          items: visit(
            _menu.items,
            (child: LeftNavMenuItem) => child.type === 'menu' && child.id === menuId,
            (child: LeftNavMenuProps) => ({
              ...child,
              expanded: drawerOpen ? true : child.expanded,
              popped: drawerOpen ? child.popped : true
            })
          )
        }))
      );
    },
    [_menus, drawerOpen]
  );

  // Collapse/Close the menu specified by the `menuId`.
  // If the drawer is open, it will set all the menu's `expanded` property to false, if not it sets the `open` property to false.
  const collapseMenus = useCallback(() => {
    setMenus(
      _menus.map(_menu => ({
        ..._menu,
        items: visit(
          _menu.items,
          (child: LeftNavMenuItem) => child.type === 'menu',
          (child: LeftNavMenuProps) => ({
            ...child,
            expanded: drawerOpen ? false : child.expanded,
            popped: drawerOpen ? child.popped : false
          })
        )
      }))
    );
  }, [_menus, drawerOpen]);

  // Expand/Open the menu specified by the `menuId`.
  // If the drawer is open, it will set all the menu's `expanded` property to true, if not it sets the `open` property to true.
  const expandMenus = useCallback(() => {
    setMenus(
      _menus.map(_menu => ({
        ..._menu,
        items: visit(
          _menu.items,
          (child: LeftNavMenuItem) => child.type === 'menu',
          (child: LeftNavMenuProps) => ({
            ...child,
            expanded: drawerOpen ? true : child.expanded,
            popped: drawerOpen ? child.popped : true
          })
        )
      }))
    );
  }, [_menus, drawerOpen]);

  // Memoized context value.
  const value = useMemo(
    () => ({
      initialized: true,
      menus: _menus,
      open: drawerOpen,
      setOpen: setDrawerOpen,
      toggle,
      toggleMenu,
      closeMenu,
      openMenu,
      updateMenu,
      collapseMenus,
      expandMenus,
      setMenus
    }),
    [_menus, drawerOpen, setDrawerOpen, toggle, toggleMenu, closeMenu, openMenu, updateMenu, collapseMenus, expandMenus]
  );

  return <AppLeftNavContext.Provider value={value}>{children}</AppLeftNavContext.Provider>;
};

export default AppLeftNavProvider;
