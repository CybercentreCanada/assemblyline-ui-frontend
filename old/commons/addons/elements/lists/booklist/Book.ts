/* eslint-disable no-param-reassign */
import { LineItem } from 'commons/addons/elements/lists/item/ListItemBase';

export const DEFAULT_PAGESIZE = 25;

export interface BookPage {
  index: number;
  lines: LineItem[];
}

export default class Book {
  private pageSize: number;

  private cursor: number = 0;

  private _pageCount: number = 0;

  private pages: BookPage[] = [{ index: 0, lines: [] }];

  constructor(lines: LineItem[], pageSize: number = DEFAULT_PAGESIZE) {
    this.pageSize = pageSize;
    this.addAll(lines);
  }

  public addAll(lines: LineItem[]): Book {
    lines.forEach(line => this.add(line));
    return this;
  }

  public add(line: LineItem): Book {
    const lastPage = this.lastPage();
    if (lastPage.lines.length < this.pageSize) {
      lastPage.lines.push(line);
    } else {
      this.pages.push({
        index: this.pages.length,
        lines: [line]
      });
    }

    return this;
  }

  public currentNumber(): number {
    return this.cursor;
  }

  public indexes(): number[] {
    return this.pages.flatMap(p => [p.index + 1]);
  }

  public currentPage(): BookPage {
    return this.page(this.cursor);
  }

  public page(pageNumber: number): BookPage {
    return this.pages[pageNumber];
  }

  public lastPage(): BookPage {
    return this.pages[this.pages.length - 1];
  }

  public turnTo(pageNumber: number): Book {
    this.cursor = pageNumber;
    return this;
  }

  public isOnLastPage(): boolean {
    return this.cursor === this.pages.length - 1;
  }

  public total(): number {
    const counts = this.pages.flatMap(b => [b.lines.length]);
    return counts.reduce((agg, c) => agg + c, 0);
  }

  public isEmpty(): boolean {
    return !(this.page && this.pages.length > 0);
  }

  public hasPage(pageNumber: number) {
    return this.pages.length > pageNumber;
  }

  public isPageEmpty(pageNumber: number): boolean {
    return !this.hasPage(pageNumber) || this.page(pageNumber).lines.length === 0;
  }

  public isCurrentPageEmpty(): boolean {
    return this.isPageEmpty(this.cursor);
  }

  public pageCount(): number {
    return this.indexes().length;
  }

  public currentPageLineCount(): number {
    return this.currentPage().lines.length;
  }

  public repartition(pageSize: number) {
    const lines = this.pages.reduce((agg, book) => agg.concat(book.lines), []);
    return new Book(lines, pageSize);
  }

  public build(): Book {
    const book = new Book([], this.pageSize);
    book.pages = this.pages;
    book.cursor = this.cursor;
    return book;
  }

  private index(): Book {
    this.pages.forEach((p, i) => {
      p.index = i;
    });
    return this;
  }
}
