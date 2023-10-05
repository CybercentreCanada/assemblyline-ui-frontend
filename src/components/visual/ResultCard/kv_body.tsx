import makeStyles from '@mui/styles/makeStyles';
import TitleKey from 'components/visual/TitleKey';
import { default as React, useCallback } from 'react';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, auto)',
    columnGap: theme.spacing(1)
  },
  offsets: {
    display: 'flex',
    columnGap: theme.spacing(1)
  }
}));

const StringHits = ({ values }: { values: string[] }) => {
  const classes = useStyles();

  const Hit = useCallback(
    ({ value }: { value: string }) => {
      const title = `${value.match(/.* : /g)}`.replace(' : ', '');
      const hit = `${value.match(/''.*''/g)}`.replace(/''/g, '');
      const offsets = `${value.match(/\[@.*\]/g)}`.replace('[@ ', '').replace(']', '').split(', ');

      return (
        <>
          <div>{title}</div>
          <div style={{ justifySelf: 'end' }}>{hit}</div>
          <div className={classes.offsets}>
            {offsets.map((offset, i) => (
              <div key={i}>{offset}</div>
            ))}
          </div>
        </>
      );
    },
    [classes.offsets]
  );

  return (
    <div className={classes.container}>
      {values.map((value, i) => (
        <Hit key={i} value={value} />
      ))}
    </div>
  );
};

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
            <td style={{ wordBreak: 'break-word' }}>
              {key === 'string_hits' ? <StringHits values={body[key]} /> : value}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

export const KVBody = React.memo(WrappedKVBody);
