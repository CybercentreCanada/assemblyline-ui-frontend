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
    this.params.set('query', query);
    return this;
  }

  public getQuery(): string {
    return this.params.get('query');
  }

  public build(): string {
    return `${this.path}?${this.params.toString()}`;
  }

  public update(): void {
    window.history.pushState(null, '', this.build());
  }
}
