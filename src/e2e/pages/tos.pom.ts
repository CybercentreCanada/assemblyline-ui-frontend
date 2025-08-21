import type { Locator, Page } from '@playwright/test';
import { SHORT_TIMEOUT } from 'e2e/shared/constants';
import { expect, test } from 'e2e/shared/fixtures';
import type { WaitForOptions } from 'e2e/shared/models';
import { PageObjectModel } from 'e2e/utils/PageObjectModel';

export class TermsOfServicesError extends Error {
  visible: boolean;

  constructor(visible: boolean) {
    super(null);
    this.name = 'TermsOfServiceError';
    this.visible = visible;
  }
}

export class TermsOfServicePage extends PageObjectModel {
  readonly header: Locator;
  readonly acceptButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page, 'Terms Of Service page', '/tos');

    this.header = page.getByRole('heading', { name: 'Terms of Service', exact: true });
    this.acceptButton = page.getByRole('button', { name: 'Accept terms', exact: true });
    this.logoutButton = page.getByRole('button', { name: 'Logout', exact: true });
  }

  async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await Promise.all([this.header.waitFor({ state, timeout })]);
  }

  async waitForFallback({ state = 'visible', timeout = 0 }: WaitForOptions = {}): Promise<TermsOfServicesError> {
    return await test.step(`Waiting for ${this.name} fallback to become ${state}`, async () => {
      try {
        await this.waitForPage({ state, timeout });
        console.log('we saw it');
        throw new TermsOfServicesError(true);
      } catch (err) {
        if (err instanceof TermsOfServicesError) {
          return err;
        }
      }
      return new TermsOfServicesError(false);
    });
  }

  async monitorForError({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    return await test.step(`Expecting the ${this.name} to be ${state}`, async () => {
      const { visible } = await this.waitForFallback({ state, timeout });
      expect(visible, `Expected ${this.name} to be visible!`).toBeTruthy();
    });
  }

  async monitorForNoError({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    return await test.step(`Expecting the ${this.name} to not be ${state}`, async () => {
      await this.waitForFallback({ state, timeout }).then(({ visible }) => {
        expect(visible, `Unexpected ${this.name} appeared!`).toBeFalsy();
      });
    });
  }

  async acceptIfVisible({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    return await test.step(`Accepting the ${this.name} when it is ${state}`, async () => {
      const { visible } = await this.waitForFallback({ state, timeout });
      if (visible) {
        await this.acceptButton.click({ timeout: SHORT_TIMEOUT });
      }
    });
  }
}
