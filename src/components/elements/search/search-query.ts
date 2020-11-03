export enum SearchFilterType {
  STATUS = 'status',
  PRIORITY = 'priority',
  LABEL = 'label',
  QUERY = 'query'
}

export interface SearchFilter {
  id: number | string;
  type: SearchFilterType;
  label: string;
  value: any;
  object: any;
}

export interface SearchQueryParameter {
  name: string;
  value: string;
}

export default class SearchQuery {
  private params: URLSearchParams = null;

  constructor(private path: string, baseSearch: string, private pageSize: number, private setDefaults: boolean = true) {
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

  public getParams() {
    const output = {};
    this.params.forEach((value, key) => {
      if (!(key in output)) {
        if (key !== 'fq') {
          output[key] = value;
        } else {
          output[key] = [value];
        }
      } else if (key === 'fq') {
        output[key].push(value);
      }
    });
    return output;
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

  public reset(): SearchQuery {
    this.setOffset('0').setRows(`${this.pageSize}`).setQuery('').setTc('4d').setGroupBy('file.sha256').clearFq();
    return this;
  }

  public buildQueryString(): string {
    const params = new URLSearchParams(this.params.toString());
    params.delete('group_by');
    return params.toString();
  }

  public build(): string {
    return `${this.path}?${this.buildQueryString()}`;
  }

  public apply(): void {
    const params = new URLSearchParams(this.params.toString());
    params.delete('group_by');
    params.delete('rows');
    params.delete('offset');
    window.history.pushState(null, '', `${this.path}?${params.toString()}`);
  }

  public parseFilters(): SearchFilter[] {
    if (this.getFqList().length) {
      return this.getFqList().map((fq, i) => SearchQuery.parseFilterValue(i, fq));
    }
    return [];
  }

  public static parseFilterValue(id: string | number, filter: string): SearchFilter {
    const [type] = filter.split(':');

    // TODO: need a way to differentiate value/favorite filters!

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
      object: null
    };
  }
}
