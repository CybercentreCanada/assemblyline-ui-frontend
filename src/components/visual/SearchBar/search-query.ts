export enum SearchFilterType {
  BLANK = 'blank',
  STATUS = 'status',
  PRIORITY = 'priority',
  LABEL = 'label',
  QUERY = 'query'
}

export const EMPTY_SEARCHFILTER = {
  id: 'emtpy_search_filter',
  type: SearchFilterType.BLANK,
  label: '',
  value: null
};

export interface SearchFilter {
  id: number | string;
  type: SearchFilterType;
  label: string;
  value: any;
  other?: any;
}

export interface SearchQueryFilters {
  groupBy: string;
  sortBy: string;
  tc: string;
  labels: SearchFilter[];
  priorities: SearchFilter[];
  queries: SearchFilter[];
  statuses: SearchFilter[];
}

export interface SearchQueryParameter {
  name: string;
  value: string;
}

const DEFAULT_TC = '4d';
const DEFAULT_OFFSET = 0;
const DEFAULT_GROUPBY = 'file.sha256';
export const DEFAULT_SORTBY = 'reporting_ts desc';

export default class SearchQuery {
  private params: URLSearchParams = null;

  constructor(private path: string, baseSearch: string, private pageSize: number, setDefaults: boolean = true) {
    this.params = new URLSearchParams(baseSearch);
    if (setDefaults) {
      if (!this.hasOffset()) {
        this.setOffset(`${DEFAULT_OFFSET}`);
      }
      if (!this.hasTc()) {
        this.setTc(DEFAULT_TC);
      }
      if (!this.hasRows()) {
        this.setRows(`${pageSize}`);
      }
      if (!this.hasGroupBy()) {
        this.setGroupBy(DEFAULT_GROUPBY);
      }
      if (!this.hasSortBy()) {
        this.setSortBy(DEFAULT_SORTBY);
      }
    }
  }

  public setRows(rows: string): SearchQuery {
    this.params.set('rows', rows);
    return this;
  }

  public hasRows(): boolean {
    return this.params.has('rows');
  }

  public getRows(): string {
    return this.hasRows() ? this.params.get('rows') : `${this.pageSize}`;
  }

  public getRowsNumber(): number {
    return this.hasRows() ? parseInt(this.params.get('rows')) : this.pageSize;
  }

  public setOffset(offset: string): SearchQuery {
    this.params.set('offset', offset);
    return this;
  }

  public hasOffset(): boolean {
    return this.params.has('offset');
  }

  public getOffset(): string {
    return this.hasOffset() ? this.params.get('offset') : '0';
  }

  public getOffsetNumber(): number {
    return this.hasOffset() ? parseInt(this.params.get('offset')) : 0;
  }

  public tickOffset(): SearchQuery {
    this.setOffset(`${this.getOffsetNumber() + this.pageSize}`).setRows(this.getRows());
    return this;
  }

  public setQuery(query: string): SearchQuery {
    this.params.set('q', query);
    return this;
  }

  public hasQuery(): boolean {
    return this.params.has('q');
  }

  public getQuery(): string {
    return this.params.has('q') ? this.params.get('q') : '';
  }

  public setTc(tc: string): SearchQuery {
    this.params.set('tc', tc);
    return this;
  }

  public hasTc(): boolean {
    return this.params.has('tc');
  }

  public getTc(): string {
    return this.hasTc() ? this.params.get('tc') : '';
  }

  public setTcStart(tcStart: string): SearchQuery {
    this.params.set('tc_start', tcStart);
    return this;
  }

  public hasTcStart(): boolean {
    return this.params.has('tc_start');
  }

  public getTcStart(): string {
    return this.hasTcStart() ? this.params.get('tc_start') : '';
  }

  public addFq(fq: string): SearchQuery {
    this.params.append('fq', fq);
    return this;
  }

  public getFqList(): string[] {
    return this.params.getAll('fq');
  }

  public clearFq(): SearchQuery {
    this.params.delete('fq');
    return this;
  }

  public setGroupBy(groupBy: string): SearchQuery {
    this.params.set('group_by', groupBy);
    return this;
  }

  public hasGroupBy(): boolean {
    return this.params.has('group_by');
  }

  public getGroupBy(): string {
    return this.hasGroupBy() ? this.params.get('group_by') : 'file.sha256';
  }

  public setSortBy(sortBy: string): SearchQuery {
    this.params.set('sort_by', sortBy);
    return this;
  }

  public hasSortBy(): boolean {
    return this.params.has('sort_by');
  }

  public getSortBy(): string {
    return this.hasSortBy() ? this.params.get('sort_by') : DEFAULT_SORTBY;
  }

  public setFilters(filters: SearchQueryFilters): SearchQuery {
    this.reset(false).setTc(filters.tc).setGroupBy(filters.groupBy).setSortBy(filters.sortBy);
    [...filters.statuses, ...filters.priorities, ...filters.labels, ...filters.queries].forEach(filter =>
      this.addFq(filter.value)
    );
    return this;
  }

  public deleteQuery() {
    this.params.delete('q');
    return this;
  }

  public deleteTCStart() {
    this.params.delete('tc_start');
    return this;
  }

  public reset(clearQuery = true): SearchQuery {
    this.setOffset('0')
      .setRows(`${this.pageSize}`)
      .setTc('4d')
      .setGroupBy('file.sha256')
      .setSortBy(DEFAULT_SORTBY)
      .setTcStart('')
      .clearFq();
    if (clearQuery) this.setQuery('');
    return this;
  }

  public buildURLQueryString(): string {
    const params = new URLSearchParams(this.params.toString());
    params.delete('tc_start');
    params.delete('offset');
    params.delete('rows');
    if (this.getTc() === DEFAULT_TC) params.delete('tc');
    if (this.getGroupBy() === DEFAULT_GROUPBY) params.delete('group_by');
    if (this.getSortBy() === DEFAULT_SORTBY) params.delete('sort_by');
    if (this.getQuery() === '') params.delete('q');
    return params.toString();
  }

  public buildAPIQueryString(): string {
    const params = new URLSearchParams(this.params.toString());
    params.delete('group_by');
    if (this.getTc() === '') params.delete('tc');
    if (this.getQuery() === '') params.delete('q');
    return params.toString();
  }

  public newBase(accept?: (name: string) => boolean): SearchQuery {
    const q = new SearchQuery(this.path, '', this.pageSize);
    const params = new URLSearchParams();
    if (accept) {
      this.params.forEach((value: string, key: string) => {
        if (accept(key)) {
          params.set(key, value);
        }
      });
    }
    q.params = params;
    return q;
  }

  public build(): SearchQuery {
    return new SearchQuery(this.path, this.params.toString(), this.pageSize);
  }

  public parseFilters(): SearchQueryFilters {
    let fqs = [];
    let statuses = [];
    let priorities = [];
    let labels = [];
    let queries = [];

    if (this.getFqList().length) {
      fqs = this.getFqList().map((fq, i) => SearchQuery.parseFilterValue(i, fq));
      statuses = fqs.filter(f => f.type === SearchFilterType.STATUS);
      priorities = fqs.filter(f => f.type === SearchFilterType.PRIORITY);
      labels = fqs.filter(f => f.type === SearchFilterType.LABEL);
      queries = fqs.filter(f => f.type === SearchFilterType.QUERY);
    }
    return {
      tc: this.getTc(),
      groupBy: this.getGroupBy(),
      sortBy: this.getSortBy(),
      statuses,
      priorities,
      labels,
      queries
    };
  }

  public static parseFilterValue(id: string | number, filter: string): SearchFilter {
    const [type] = filter.split(':');
    const resolveType = (): SearchFilterType => {
      switch (type) {
        case 'status':
          return SearchFilterType.STATUS;
        case 'priority':
          return SearchFilterType.PRIORITY;
        case 'label':
          return SearchFilterType.LABEL;
        default:
          return SearchFilterType.QUERY;
      }
    };
    return {
      id,
      type: resolveType(),
      label: filter,
      value: filter,
      other: null
    };
  }
}
