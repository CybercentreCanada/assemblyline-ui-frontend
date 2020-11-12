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
  tc: string;
  groupBy: string;
  statuses: SearchFilter[];
  priorities: SearchFilter[];
  labels: SearchFilter[];
  queries: SearchFilter[];
}

export interface SearchQueryParameter {
  name: string;
  value: string;
}

export default class SearchQuery {
  private params: URLSearchParams = null;

  constructor(private path: string, baseSearch: string, private pageSize: number, setDefaults: boolean = true) {
    this.params = new URLSearchParams(baseSearch);
    if (setDefaults) {
      if (!this.hasOffset()) {
        this.setOffset('0');
      }
      if (!this.hasTc()) {
        this.setTc('4d');
      }
      if (!this.hasRows()) {
        this.setRows(`${pageSize}`);
      }
      if (!this.hasGroupBy()) {
        this.setGroupBy('file.sha256');
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
    this.params.set('query', query);
    return this;
  }

  public hasQuery(): boolean {
    return this.params.has('q') || this.params.has('query');
  }

  public getQuery(): string {
    return this.params.has('q') ? this.params.get('q') : this.params.has('query') ? this.params.get('query') : '';
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

  public setFilters(filters: SearchQueryFilters): SearchQuery {
    this.reset().setTc(filters.tc).setGroupBy(filters.groupBy);
    [...filters.statuses, ...filters.priorities, ...filters.labels, ...filters.queries].forEach(filter =>
      this.addFq(filter.value)
    );
    return this;
  }

  public reset(): SearchQuery {
    this.setOffset('0')
      .setRows(`${this.pageSize}`)
      .setQuery('')
      .setTc('4d')
      .setGroupBy('file.sha256')
      .setTcStart('')
      .clearFq();
    return this;
  }

  public buildQueryString(): string {
    const params = new URLSearchParams(this.params.toString());
    params.delete('group_by');
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

  public apply(): SearchQuery {
    const params = new URLSearchParams(this.params.toString());
    params.delete('group_by');
    params.delete('rows');
    params.delete('offset');
    params.delete('tc_start');
    window.history.pushState(null, '', `${this.path}?${params.toString()}`);
    return this;
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
