import type { ReactElement } from 'react';

// Specification interface for elements of user and admin menus within the appbar's user profile.
export type AppBarUserMenuElement = {
  i18nKey?: string; // (RECOMMENDED) i18n key used to resolved the elements label/title.
  title?: string; // The title/label to display when rendering the menu element.
  route?: string; // The route to use when rendering the link component of this menu element.
  icon?: ReactElement<any>; // The icon to render to the left of the title.
  element?: ReactElement<any>; // If specified, will be used to render a profile menu element (takes precedence over [i18nKey, title, route, icon]).
};
