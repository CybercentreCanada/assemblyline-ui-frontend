import type { OrderedKeyValueBody as OrderedKeyValueData } from 'components/models/base/result_body';
import TitleKey from 'components/visual/TitleKey';
import { default as React } from 'react';

type Props = {
  body: OrderedKeyValueData;
};

const WrappedOrderedKVBody = ({ body }: Props) => (
  <table cellSpacing={0}>
    <tbody>
      {Object.keys(body).map(id => {
        const item = body[id];
        let key = item[0];
        let value = item[1];
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

export const OrderedKVBody = React.memo(WrappedOrderedKVBody);
