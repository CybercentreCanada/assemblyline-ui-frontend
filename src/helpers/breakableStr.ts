export class BreakableStr extends String {
  constructor(x = '') {
    const initVal = x || '';
    let outString = String();
    try {
      for (let i = 0; i < initVal.length; i += 4) {
        outString += initVal.substr(i, 4);
        outString += '\u200b';
      }
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.error(ex, '=>', x);
    }
    super(outString);
  }
}
