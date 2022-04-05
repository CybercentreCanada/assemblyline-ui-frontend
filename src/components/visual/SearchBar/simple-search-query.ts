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

  public pop(key: string, defaultVal = null) {
    const val = this.params.get(key) || defaultVal;
    this.params.delete(key);
    return val;
  }

  public set(key: string, value) {
    this.params.set(key, value);
  }

  public add(key: string, value: string) {
    const items = this.params.getAll(key) || [];
    if (items.indexOf(value) === -1) {
      this.params.append(key, value);
    }
    return this;
  }

  public remove(key: string, value: string) {
    const items = this.params.getAll(key) || [];
    this.params.delete(key);
    items.forEach(item => {
      if (item !== value) {
        this.params.append(key, item);
      }
    });
    return this;
  }

  public replace(key: string, old_item: string, new_item: string) {
    const items = this.params.getAll(key) || [];
    this.params.delete(key);
    items.forEach(item => {
      if (item !== old_item) {
        this.params.append(key, item);
      } else {
        this.params.append(key, new_item);
      }
    });
    return this;
  }

  public getAll(key: string, defaultVal = null) {
    return this.params.getAll(key) || defaultVal;
  }

  public delete(key: string) {
    this.params.delete(key);
  }

  public has(key: string): boolean {
    return this.params.has(key);
  }

  public toString(strip: string[] = ['group_by']): string {
    const params = new URLSearchParams(this.params.toString());
    strip.forEach(item => {
      params.delete(item);
    });
    return params.toString();
  }
}
