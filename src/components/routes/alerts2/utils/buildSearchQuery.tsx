import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';

export const buildSearchQuery = (
  search: string,
  singles: string[] = [],
  multiples: string[] = [],
  strip: string[] = [],
  defaultString: string = ''
): string => {
  const defaults = new SimpleSearchQuery(defaultString);
  const current = new SimpleSearchQuery(search);
  const query = new SimpleSearchQuery('');

  const groupBy = current.get('group_by');
  if (groupBy && groupBy !== '') query.add('fq', `${groupBy}:*`);

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

  return query.toString();
};
