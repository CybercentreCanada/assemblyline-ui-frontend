import { Link } from 'core/router/components/Link';
import React from 'react';

export const Links = React.memo(() => {
  return (
    <nav style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
      <Link path="/submit">Submit</Link>
      <Link path="/page1">Submit</Link>
      <Link path="/page2/:fileID" params={{ fileID: 'asd' }}>
        Submit
      </Link>
      <Link path="/submissions/:query" params={{ query: '123' }}>
        Submit
      </Link>
    </nav>
  );
});

Links.displayName = 'Links';
