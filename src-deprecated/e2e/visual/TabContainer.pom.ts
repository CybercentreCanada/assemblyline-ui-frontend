import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

export class TabContainer<Tab extends string> {
  private readonly page: Page;
  private readonly tabList: Locator;

  constructor(page: Page, tablistSelector?: string) {
    this.page = page;
    this.tabList = tablistSelector ? page.locator(tablistSelector) : page.locator('div[role="tablist"]').first();
  }

  getTabs(): Locator {
    return this.tabList.locator('button[role="button"]');
  }

  async selectTab(tabText: Tab) {
    await test.step(`Selecting tab: "${tabText}"`, async () => {
      const tab = this.tabList.getByRole('button', { name: tabText }).first();
      await tab.click();
      await this.expectTabSelected(tabText);
    });
  }

  async selectTabByIndex(index: number) {
    await test.step(`Selecting tab by index: ${index}`, async () => {
      const tab = this.getTabs().nth(index);
      const text = await tab.innerText();
      await tab.click();
      await this.expectTabSelected(text);
    });
  }

  async getSelectedTab(): Promise<string> {
    return await test.step('Getting currently selected tab', async () => {
      const selectedTab = this.tabList.locator('button[aria-selected="true"]').first();
      return selectedTab.innerText();
    });
  }

  async expectTabSelected(tabText: string) {
    await test.step(`Expecting tab to be selected: "${tabText}"`, async () => {
      const selectedTab = this.tabList.locator('button[aria-selected="true"]').first();
      await expect(selectedTab).toHaveText(tabText);
    });
  }
}
