import { Link } from 'core/router';
import React from 'react';

export const Links = React.memo(() => {
  return (
    <nav style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
      <Link path="/submit">Submit</Link>
      <Link path="/page1">Page 1</Link>
      <Link path="/page2/:fileID" params={{ fileID: 'asd' }}>
        Page 2
      </Link>
      <Link path="/submissions/:query" params={{ query: '123' }}>
        Submission
      </Link>
    </nav>
  );
});

Links.displayName = 'Links';
