/**
 * Insert a \<wbr \/\> before every dot in the data
 */
export const wbr = (text: string): React.ReactNode => (
  <>
    {text.split('.')[0]}
    {text
      .split('.')
      .slice(1)
      .map(t => (
        <>
          <wbr />.{t}
        </>
      ))}
  </>
);
