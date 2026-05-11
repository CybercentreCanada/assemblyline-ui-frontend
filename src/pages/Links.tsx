import { AppLink } from 'core/router';
import { memo } from 'react';

export const Links = memo(() => {
  return (
    <nav style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
      <AppLink to={{ path: '/submit' }}>Submit</AppLink>
      <AppLink to={{ path: '/page1' }}>Page 1</AppLink>
      <AppLink to={{ path: '/page2/:fileID', params: { fileID: 'asd' } }}>Page 2</AppLink>
      <AppLink to={{ path: '/submissions/:query', params: { query: '123' }, search: { query: 'asdf' } }}>
        Submission
      </AppLink>
    </nav>
  );
});

Links.displayName = 'Links';
