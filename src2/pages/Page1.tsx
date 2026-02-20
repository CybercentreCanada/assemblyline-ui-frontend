import { Link } from 'core/router/components/Link';
import { createReversePortalNode, InPortal, OutPortal } from 'core/router/components/Portals';
import React, { useMemo, useState } from 'react';
import Page2 from './Page2';
import { SubmissionsRoute } from './Submissions';

const StatefulWidget = React.memo(() => {
  const [count, setCount] = useState(0);
  const [seed, setSeed] = useState(42);

  console.log('statefull rerender');

  const expensiveValue = useMemo(() => {
    const size = 15000;
    const values = new Array<number>(size);
    let x = seed + count * 7919;

    for (let i = 0; i < size; i++) {
      x = (x * 1664525 + 1013904223) % 2147483647;
      values[i] = x;
    }

    values.sort((a, b) => a - b);

    let checksum = 0;
    for (let i = 0; i < size; i += 7) {
      checksum = (checksum + values[i]) % 1000000007;
    }

    return checksum;
  }, [count, seed]);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <button onClick={() => setSeed(s => s + 1)} style={{ marginLeft: 8 }}>
        Recompute
      </button>
      <div style={{ marginTop: 8 }}>Expensive checksum: {expensiveValue}</div>
    </div>
  );
});

export const Page1 = () => {
  const node = useMemo(() => createReversePortalNode(), []);
  const [right, setRight] = useState<null | number>(null);

  return (
    <div>
      <h1>Page 1</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link to={Page2} params={{ fileID: 'from-page1' }}>
          Go to Page 2
        </Link>
        <Link to={SubmissionsRoute}>Go to Submissions</Link>
        {/* <Link to={Page2} params={{ fileID: 'from-page1-drawer' }}>
          Open Page 2 (drawer)
        </Link>
        <Link to={Page3}>Open Page 3 (drawer)</Link> */}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <h3>Left</h3>
        {right === 1 && <OutPortal node={node} />}
      </div>

      <div style={{ flex: 1 }}>
        <h3>Right</h3>
        {right === 2 && <OutPortal node={node} />}
      </div>

      <div style={{ position: 'fixed', bottom: 16 }}>
        <button
          onClick={() =>
            setRight(v => {
              switch (v) {
                case 1:
                  return 2;
                case 2:
                  return null;
                default:
                  return 1;
              }
            })
          }
        >
          Move
        </button>
      </div>

      <InPortal node={node}>
        <StatefulWidget />
      </InPortal>
    </div>
  );
};
