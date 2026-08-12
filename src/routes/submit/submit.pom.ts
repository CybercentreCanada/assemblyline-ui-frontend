import type { Locator, Page } from '@playwright/test';
import { SHORT_TIMEOUT } from 'app/spec.constant';
import type { WaitForOptions } from 'core/e2e/e2e.models';
import { test } from 'core/e2e/e2e.fixtures';
import { PageObjectModel } from 'core/e2e/utils/PageObjectModel';
import path from 'path';
import { SelectInput } from 'ui/inputs/pom/SelectInput.pom';
import { TextInput } from 'ui/inputs/pom/TextInput.pom';
import { TabContainer } from 'ui/TabContainer.pom';

type SubmitTab = 'File' | 'Hash/URL';

const SUBMISSION_PROFILES = [
  { label: 'Custom Analysis', value: 'default' },
  { label: 'Static Analysis [OFFLINE]', value: 'static' },
  { label: 'Static + Dynamic Analysis [ONLINE]', value: 'static_and_dynamic_with_internet' },
  { label: 'Static + Dynamic Analysis [OFFLINE]', value: 'static_with_dynamic' },
  { label: 'Static Analysis [ONLINE]', value: 'static_with_internet' }
] as const;

export class SubmitPage extends PageObjectModel {
  private readonly bannerImage: Locator;
  private readonly fileDropper: Locator;
  private readonly cancelButton: Locator;
  private readonly submitButton: Locator;
  private readonly searchButton: Locator;
  public readonly adjustButton: Locator;
  private readonly submissionProfileInput: SelectInput<typeof SUBMISSION_PROFILES>;
  private readonly tab: TabContainer<SubmitTab>;
  private readonly hashInput: TextInput;
  public readonly fileTypeInput: TextInput;

  constructor(page: Page) {
    super(page, 'Submit page', '/submit');
    this.bannerImage = this.page.locator('img[src="/images/banner.svg"], img[src="/images/banner_dark.svg"]');
    this.fileDropper = this.page.locator('#file_dropper');
    this.cancelButton = this.page.locator('button#cancel');
    this.submitButton = this.page.locator('button#submit');
    this.searchButton = this.page.locator('button#check-if-a-file-matching-your-input-exist-in-the-system');
    this.adjustButton = this.page.locator('button#open-the-panel-to-adjust-the-submit-parameters');
    this.submissionProfileInput = new SelectInput(page, 'submission-profile');
    this.tab = new TabContainer(page);
    this.hashInput = new TextInput(page, 'HashInput');
    this.fileTypeInput = new TextInput(page, 'file-type');
  }

  locators(): Locator[] {
    return [this.bannerImage];
  }

  async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await this.bannerImage.waitFor({ state, timeout });
  }

  async switchTab(tabLabel: 'File' | 'Hash/URL') {
    await test.step(`Switching to tab: "${tabLabel}"`, async () => {
      await this.tab.selectTab(tabLabel);
    });
  }

  async uploadFile(filePath: string) {
    const fileName = path.basename(filePath);
    await test.step(`Uploading file: ${fileName}`, async () => {
      await this.fileDropper.setInputFiles(filePath, { timeout: SHORT_TIMEOUT });
    });
  }

  async uploadHash(hash: string) {
    await test.step(`Entering Hash/URL: ${hash}`, async () => {
      await this.hashInput.inputValue(hash);
      await this.hashInput.expectValue(hash);
    });
  }

  async selectSubmissionProfile(option: (typeof SUBMISSION_PROFILES)[number]['value']) {
    const label = SUBMISSION_PROFILES.find(o => o.value === option)?.label;
    await test.step(`Selecting analysis type: "${label}"`, async () => {
      await this.submissionProfileInput.inputByValue(option);
      await this.submissionProfileInput.expectSelected(label);
    });
  }

  async clickSubmit() {
    await test.step('Clicking the submit button', async () => {
      await this.page.waitForTimeout(SHORT_TIMEOUT);
      await this.submitButton.click();
    });
  }
}
