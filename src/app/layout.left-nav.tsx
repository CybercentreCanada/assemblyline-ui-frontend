import type { AppLeftNavItem } from 'core/template';
import { useMemo } from 'react';

//*****************************************************************************************
// App Template Left Nav
//*****************************************************************************************

export const useAppTemplateLeftNav = () =>
  useMemo<AppLeftNavItem[]>(
    () => [
      { link: { route: '/submit' } },
      { link: { route: '/submissions' } },
      { link: { route: '/alerts-redirect' } },
      { link: { route: '/archives' } },
      { link: { route: '/retrohunt' } },
      {
        link: { route: '/search' },
        items: [
          { link: { route: '/search' } },
          { link: { route: '/search/:index', path: { index: 'alert' } } },
          { link: { route: '/search/:index', path: { index: 'file' } } },
          { link: { route: '/search/:index', path: { index: 'result' } } },
          { link: { route: '/search/:index', path: { index: 'retrohunt' } } },
          { link: { route: '/search/:index', path: { index: 'signature' } } },
          { link: { route: '/search/:index', path: { index: 'submission' } } }
        ] as const
      },
      { divider: true },
      { link: { route: '/dashboard' } },
      {
        link: { route: '/manage' },
        items: [
          { link: { route: '/manage/badlists' } },
          { link: { route: '/manage/heuristics' } },
          { link: { route: '/manage/safelists' } },
          { link: { route: '/manage/signatures' } },
          { link: { route: '/manage/sources' } },
          { link: { route: '/manage/workflows' } }
        ]
      },
      {
        link: { route: '/admin' },
        items: [
          { link: { route: '/admin/apikeys' } },
          { link: { route: '/admin/errors' } },
          { link: { route: '/admin/identify' } },
          { link: { route: '/admin/actions' } },
          { link: { route: '/admin/services' } },
          { link: { route: '/admin/service_review' } },
          { link: { route: '/admin/sitemap' } },
          { link: { route: '/admin/tag_safelist' } },
          { link: { route: '/admin/users' } }
        ]
      },
      { divider: true },
      {
        link: { route: '/help' },
        items: [
          { link: { route: '/help/api' } },
          { link: { route: '/help/classification' } },
          { link: { route: '/help/configuration' } },
          { link: { route: '/help/search' } },
          { link: { route: '/help/services' } }
        ]
      },
      {
        link: { route: '/development' },
        items: [
          { link: { route: '/development/api' } },
          { link: { route: '/development/customize' } },
          { link: { route: '/development/library' } },
          { link: { route: '/development/theme' } }
        ]
      }
    ],
    []
  );
