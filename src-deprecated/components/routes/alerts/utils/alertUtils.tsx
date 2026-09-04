import type { DetailedItem } from 'components/models/base/alert';
import { verdictRank } from 'helpers/utils';

export const detailedItemCompare = (a: DetailedItem, b: DetailedItem) => {
  const aVerdict = verdictRank(a.verdict);
  const bVerdict = verdictRank(b.verdict);

  if (aVerdict === bVerdict) {
    return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
  } else {
    return aVerdict < bVerdict ? -1 : 1;
  }
};
