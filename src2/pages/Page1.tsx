import React, { useEffect, useMemo, useState } from 'react';
import { Links } from './Links';
import { createReversePortalNode, OutPortal, InPortal } from 'core/portal';
import { createRoute } from 'core/router';

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

export const Page1Page = React.memo(() => {
  const node = useMemo(() => createReversePortalNode(), []);
  const [right, setRight] = useState<null | number>(null);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return loading ? (
    <div>loading</div>
  ) : (
    <div>
      <Links />
      <h1>Page 1</h1>
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
});

Page1Page.displayName = 'Page1Page';

export const Page1Route = createRoute({ path: '/page1', component: Page1Page });

export default Page1Route;
