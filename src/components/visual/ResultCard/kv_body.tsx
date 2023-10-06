import TitleKey from 'components/visual/TitleKey';
import { default as React } from 'react';

const WrappedKVBody = ({ body }) => (
  <table cellSpacing={0}>
    <tbody>
      {Object.keys(body).map((key, id) => {
        let value = body[key];
        if (value instanceof Array) {
          value = value.join(' | ');
        } else if (value === true) {
          value = 'true';
        } else if (value === false) {
          value = 'false';
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        return (
          <tr key={id}>
            <td style={{ paddingRight: '16px', wordBreak: 'normal' }}>
              <TitleKey title={key} />
            </td>
            <td style={{ wordBreak: 'break-word' }}>{value}</td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

export const KVBody = React.memo(WrappedKVBody);
