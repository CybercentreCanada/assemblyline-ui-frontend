import { createRoute } from 'core/router/route/route.utils';
import React, { useEffect, useState } from 'react';
import { Links } from './Links';

export type SubmitParams = typeof SubmitRoute.params;
export type SubmitSearch = typeof SubmitRoute.search;
export type SubmitHash = typeof SubmitRoute.hash;

export const SubmitPage = React.memo(() => {
  // const { fileID } = useParams<typeof Submit>();
  // const search = useSearch<typeof Submit>();
  // const hash = useHash<typeof Submit>();

  // const navigate = useNavigate();

  // console.log(location, fileID);

  const lorem = {
    title: 'Lorem Ipsum Dashboard',
    subtitle: 'Mock content for routing and panel stress tests',
    paragraphs: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
    ],
    cards: [
      { id: 'c1', label: 'Users', value: 1240, trend: '+4.2%' },
      { id: 'c2', label: 'Sessions', value: 8921, trend: '+1.8%' },
      { id: 'c3', label: 'Errors', value: 17, trend: '-12.0%' },
      { id: 'c4', label: 'Revenue', value: '$12,430', trend: '+9.1%' }
    ],
    tableA: [
      { id: 1, name: 'Alpha', status: 'active', score: 91, updatedAt: '2026-02-21' },
      { id: 2, name: 'Beta', status: 'pending', score: 76, updatedAt: '2026-02-22' },
      { id: 3, name: 'Gamma', status: 'active', score: 88, updatedAt: '2026-02-23' },
      { id: 4, name: 'Delta', status: 'disabled', score: 64, updatedAt: '2026-02-24' }
    ],
    tableB: [
      { key: 'r-001', route: '/submit', panel: 1, latencyMs: 22, cached: true },
      { key: 'r-002', route: '/submissions?query=test', panel: 2, latencyMs: 45, cached: false },
      { key: 'r-003', route: '/page2#details', panel: 1, latencyMs: 31, cached: true },
      { key: 'r-004', route: '/page3?tab=history', panel: 3, latencyMs: 58, cached: false }
    ],
    tags: ['lorem', 'ipsum', 'router', 'mock', 'panel', 'table']
  };

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
      <h1>Submit</h1>

      <div>
        <h1>{lorem.title}</h1>
        <p>{lorem.subtitle}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {lorem.cards.map(card => (
            <div key={card.id} style={{ border: '1px solid #ccc', padding: 12 }}>
              <h3>{card.label}</h3>
              <div>{card.value}</div>
              <small>{card.trend}</small>
            </div>
          ))}
        </div>

        {lorem.paragraphs.map((text, i) => (
          <p key={i}>{text}</p>
        ))}

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Score</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {lorem.tableA.map(row => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.status}</td>
                <td>{row.score}</td>
                <td>{row.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Route</th>
              <th>Panel</th>
              <th>Latency</th>
              <th>Cached</th>
            </tr>
          </thead>
          <tbody>
            {lorem.tableB.map(row => (
              <tr key={row.key}>
                <td>{row.key}</td>
                <td>{row.route}</td>
                <td>{row.panel}</td>
                <td>{row.latencyMs}ms</td>
                <td>{String(row.cached)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

SubmitPage.displayName = 'SubmitPage';

export const SubmitRoute = createRoute({ path: '/submit', component: SubmitPage });

export default SubmitRoute;
