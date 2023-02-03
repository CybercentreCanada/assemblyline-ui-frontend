import { Link } from '@mui/material';
import { default as React } from 'react';

const WrappedURLBody = ({ body }) => {
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
          <Link href={item.url}>{item.name ? item.name : item.url}</Link>
        </li>
      ))}
    </ul>
  );
};

export const URLBody = React.memo(WrappedURLBody);
