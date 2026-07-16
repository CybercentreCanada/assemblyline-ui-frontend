import { AppLink } from 'core/router';
import { memo } from 'react';

export const Links = memo(() => {
  return (
    <nav style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
      <AppLink nav={nav => nav.to().create({ route: '/submit' })}>Submit</AppLink>
      <AppLink nav={nav => nav.to().create({ route: '/page1' })}>Page 1</AppLink>
      <AppLink nav={nav => nav.to().create({ route: '/page2/:fileID', path: { fileID: 'asd' } })}>Page 2</AppLink>
      <AppLink
        nav={nav =>
          nav.to().create({ route: '/submissions/:query', path: { query: '123' }, search: { query: 'asdf' } })
        }
      >
        Submission
      </AppLink>
    </nav>
  );
});

Links.displayName = 'Links';
