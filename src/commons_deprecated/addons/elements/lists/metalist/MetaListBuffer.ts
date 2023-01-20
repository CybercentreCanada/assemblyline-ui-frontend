import { MetaListItem } from './MetaList';

export default class MetaListBuffer {
  private _total: number = 0;

  public items: MetaListItem[] = [];

  constructor(public readonly size?: number) {}

  public inc(by: number): MetaListBuffer {
    this._total += by;
    return this;
  }

  public total(): number {
    return this.size ? this._total : this.items.length;
  }

  public push(newItems: MetaListItem[]): MetaListBuffer {
    if (this.size) {
      const diff = this.items.length + newItems.length - this.size;
      if (diff > 0) {
        this.items = this.items.slice(diff);
      }
      this.items = this.items.concat(newItems);
    } else {
      this.items = this.items.concat(newItems);
    }
    return this;
  }

  public get(from: number, to: number): { loaded: boolean; item: MetaListItem }[] {
    const items = [];
    for (let i = from; i <= to; i++) {
      const _item = this.items.find(item => item.index === i);
      if (_item) {
        items.push({ loaded: true, item: _item });
      } else {
        items.push({ loaded: false, item: { index: i, id: i } });
      }
    }
    if (!this.size) {
      return items.filter(i => i.loaded);
    }
    return items;
  }

  public one(index: number): { loaded: boolean; item: MetaListItem } {
    const _item = this.items.find(i => i.index === index);
    return { loaded: !!_item, item: _item };
  }

  public build(): MetaListBuffer {
    const buffer = new MetaListBuffer(this.size);
    buffer._total = this._total;
    buffer.items = this.items;
    return buffer;
  }
}
