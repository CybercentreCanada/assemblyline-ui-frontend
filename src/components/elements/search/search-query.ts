export interface SearchQueryParameter {
  name: string;
  value: string;
}

export default class SearchQuery {
  private params: URLSearchParams = null;

  constructor(private path: string, baseSearch: string, private pageSize: number) {
    this.params = new URLSearchParams(baseSearch);
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
    return this.hasQuery() ? this.params.get('q') : '';
  }

  public reset(): SearchQuery {
    this.setOffset('0').setRows(`${this.pageSize}`).setQuery('');
    return this;
  }

  public build(): string {
    return `${this.path}?${this.params.toString()}`;
  }

  public apply(): void {
    console.log(this.build());
    window.history.pushState(null, '', this.build());
  }
}
