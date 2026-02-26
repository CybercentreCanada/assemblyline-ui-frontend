import { Link } from 'core/router/components/Link';
import React from 'react';

export const Links = React.memo(() => {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Link to="/submit">Submit</Link>
      <Link to="/page1">Page 1</Link>
      <Link to="/page2/asdasd">Page 2</Link>
      <Link to="/submissions/asdasd">Submissions</Link>
    </div>
  );
});

Links.displayName = 'Links';
