import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';

type BuildSearchQueryProps = {
  search: string;
  singles?: string[];
  multiples?: string[];
  strip?: string[];
  defaultString?: string;
  groupByAsFilter?: boolean;
};

export const buildSearchQuery = ({
  search = '',
  singles = [],
  multiples = [],
  strip = [],
  defaultString = '',
  groupByAsFilter = false
}: BuildSearchQueryProps): SimpleSearchQuery => {
  const defaults = new SimpleSearchQuery(defaultString);
  const current = new SimpleSearchQuery(search);
  const query = new SimpleSearchQuery('');

  if (groupByAsFilter) {
    const groupBy = current.get('group_by');
    if (groupBy && groupBy !== '') query.add('fq', `${groupBy}:*`);
  }

  singles.forEach(key => {
    if (strip.includes(key)) return;
    const value = current.get(key);
    const other = defaults.get(key);
    if (value && value !== '') query.set(key, value);
    else if (!current.has(key) && other && other !== '') query.set(key, other);
  });

  multiples.forEach(key => {
    [...defaults.getAll(key, []), ...current.getAll(key, [])]
      .filter((f: string) => !strip.some((s: string) => f.startsWith(s)))
      .forEach(value => query.add(key, value));
  });

  return query;
};

export const getGroupBy = (search: string, defaults: string): string => {
  const current = new SimpleSearchQuery(search, defaults);
  const params = current.getParams();
  return (
    current.has('group_by') && current.get('group_by', '') === '' ? '' : 'group_by' in params ? params.group_by : ''
  ) as string;
};
