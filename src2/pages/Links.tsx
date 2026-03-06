import { AppLink } from 'core/router';
import React from 'react';

export const Links = React.memo(() => {
  return (
    <nav style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
      <AppLink path="/submit">Submit</AppLink>
      <AppLink path="/page1">Page 1</AppLink>
      <AppLink path="/page2/:fileID" params={{ fileID: 'asd' }}>
        Page 2
      </AppLink>
      <AppLink path="/submissions/:query" params={{ query: '123' }}>
        Submission
      </AppLink>
    </nav>
  );
});

Links.displayName = 'Links';
