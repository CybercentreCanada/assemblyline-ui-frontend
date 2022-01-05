export default class SimpleSearchQuery {
  private params: URLSearchParams = null;

  private defaultParams: URLSearchParams = null;

  constructor(baseSearch: string, defaults: string = 'rows=25&offset=0') {
    this.params = new URLSearchParams(baseSearch);
    this.defaultParams = new URLSearchParams(defaults);
  }

  public getDefaultString() {
    return this.defaultParams.toString();
  }

  public getDeltaString() {
    const deltaParams = new URLSearchParams();
    this.params.forEach((value, key) => {
      if (this.defaultParams.get(key) !== value) {
        deltaParams.append(key, value);
      }
    });
    return deltaParams.toString();
  }

  public getParams() {
    const output = {};
    this.defaultParams.forEach((value, key) => {
      if (!(key in output) && !this.params.has(key)) {
        if (key !== 'fq') {
          output[key] = value;
        } else {
          output[key] = [value];
        }
      } else if (key === 'fq') {
        output[key].push(value);
      }
    });

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

  public get(key: string, defaultVal = null) {
    return this.params.get(key) || defaultVal;
  }

  public set(key: string, value) {
    this.params.set(key, value);
  }

  public getAll(key: string, defaultVal = null) {
    return this.params.getAll(key) || defaultVal;
  }

  public delete(key: string) {
    this.params.delete(key);
  }

  public deleteAll() {
    let keys = [];
    this.params.forEach((value, key) => keys.push(key));
    keys.forEach(key => this.params.delete(key));
  }

  public has(key: string): boolean {
    return this.params.has(key);
  }

  public toString(): string {
    const params = new URLSearchParams(this.params.toString());
    params.delete('group_by');
    return params.toString();
  }
}
