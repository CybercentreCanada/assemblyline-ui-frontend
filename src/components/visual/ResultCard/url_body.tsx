import type { URLBody as URLData } from 'components/models/base/result_body';
import { ExternalLinkConfirmation } from 'components/visual/ExternalLinkConfirmation';
import React from 'react';

type Props = {
  body: URLData;
};

const WrappedURLBody = ({ body }: Props) => {
  const arr = [];
  if (!(body instanceof Array)) {
    arr.push(body);
  } else {
    Array.prototype.push.apply(arr, body);
  }

  return (
    <ul
      style={{
        listStyleType: 'none',
        paddingInlineStart: 0,
        marginBlockStart: '0.25rem',
        marginBlockEnd: '0.25rem'
      }}
    >
      {arr.map((item, id) => (
        <li key={id}>
          <ExternalLinkConfirmation href={item.url}>{item.name ? item.name : item.url}</ExternalLinkConfirmation>
        </li>
      ))}
    </ul>
  );
};

export const URLBody = React.memo(WrappedURLBody);
