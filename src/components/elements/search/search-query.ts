export interface SearchQueryParameter {
  name: string;
  value: string;
}

export default class SearchQuery {
  private params: URLSearchParams = null;

  constructor(private path: string, baseSearch: string) {
    this.params = new URLSearchParams(baseSearch);
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

  public build(): string {
    return `${this.path}?${this.params.toString()}`;
  }

  public update(): void {
    console.log(this.build());
    window.history.pushState(null, '', this.build());
  }
}
