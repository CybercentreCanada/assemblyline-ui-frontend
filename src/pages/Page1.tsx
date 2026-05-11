import { createAppRoute } from 'core/routes';
import { memo, useEffect, useMemo, useState } from 'react';
import { Button } from 'ui/buttons/Button';
import { Links } from './Links';

const StatefulWidget = memo(() => {
  const [count, setCount] = useState(0);
  const [seed, setSeed] = useState(42);

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

StatefulWidget.displayName = 'StatefulWidget';

export const Page1Page = memo(() => {
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
      <Button to={{ path: '/subm', search: { query: '' } }}>asdasd</Button>
    </div>
  );
});

Page1Page.displayName = 'Page1Page';

export const Page1Route = createAppRoute({ path: '/page1', component: Page1Page });
