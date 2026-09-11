import type { Locator, Page } from '@playwright/test';
import { SHORT_TIMEOUT } from 'app/spec.constant';
import { expect, test } from 'core/e2e/e2e.fixtures';
import type { WaitForOptions } from 'core/e2e/e2e.models';
import { PageObjectModel } from 'core/e2e/utils/PageObjectModel';
import type { Priority, Status } from 'models/base/workflow';
import { CheckboxInput } from 'ui/inputs/pom/CheckboxInput.pom';
import { ChipsInput } from 'ui/inputs/pom/ChipsInput.pom';
import { SelectInput } from 'ui/inputs/pom/SelectInput.pom';
import { TextAreaInput } from 'ui/inputs/pom/TextAreaInput.pom';
import { TextInput } from 'ui/inputs/pom/TextInput.pom';

export class WorkflowCreatePage extends PageObjectModel {
  private readonly title: Locator;
  private readonly nameInput: TextInput;
  private readonly queryInput: TextAreaInput;
  private readonly labelsInput: ChipsInput;
  private readonly priorityInput: SelectInput<any>;
  private readonly statusInput: SelectInput<any>;
  private readonly applyInput: CheckboxInput;
  private readonly createButton: Locator;

  constructor(page: Page) {
    super(page, 'Workflow create page', '/manage/workflows#/create/');
    this.title = page.getByRole('heading', { name: 'Adding a workflow' });

    this.nameInput = new TextInput(page, 'name');
    this.queryInput = new TextAreaInput(page, 'query');
    this.labelsInput = new ChipsInput(page, 'labels');
    this.priorityInput = new SelectInput<any>(page, 'priority');
    this.statusInput = new SelectInput<any>(page, 'status');
    this.applyInput = new CheckboxInput(page, 'apply-workflow-to-all-existing-alerts?-0-matching-alerts');
    this.createButton = this.page.getByRole('button', { name: 'add-workflow' });
  }

  locators(): Locator[] {
    return [this.title];
  }

  async waitForPage({ state = 'visible', timeout = 0 }: WaitForOptions = {}) {
    await test.step(`Wait for ${this.name}`, async () => {
      await this.title.waitFor({ state, timeout });
    });
  }

  async inputName(value: string) {
    await test.step(`Enter workflow name: ${value}`, async () => {
      await this.nameInput.inputValue(value);
    });
  }

  async inputQuery(value: string) {
    await test.step(`Enter query`, async () => {
      await this.queryInput.inputValue(value);
    });
  }

  async inputLabels(labels: string[]) {
    await test.step(`Enter labels: ${labels.join(', ')}`, async () => {
      await this.labelsInput.inputValue(labels);
    });
  }

  async inputPriority(value: Priority) {
    await test.step(`Select priority: ${value}`, async () => {
      await this.priorityInput.inputByLabel(value);
    });
  }

  async inputStatus(value: Status) {
    await test.step(`Select status: ${value}`, async () => {
      await this.statusInput.inputByLabel(value);
    });
  }

  async inputApplyToAllWorkflows(checked: boolean) {
    await test.step(`Toggle apply-to-all-existing-alerts: ${checked}`, async () => {
      await this.applyInput.inputValue(checked);
    });
  }

  async clickCreateWorkflowButton() {
    await test.step('Clicking the Create Workflow button', async () => {
      await this.createButton.waitFor({ state: 'visible', timeout: SHORT_TIMEOUT });
      await this.createButton.isEnabled({ timeout: SHORT_TIMEOUT });
      await this.createButton.click({ timeout: SHORT_TIMEOUT });
    });
  }

  async expectCreateWorkflowButtonToBeDisabled(expected: boolean) {
    return await test.step('Check if Create Workflow button is disabled', async () => {
      await this.page.waitForTimeout(SHORT_TIMEOUT);
      const isDisabled = await this.createButton.isDisabled({ timeout: SHORT_TIMEOUT });
      expect(isDisabled).toBe(expected);
    });
  }

  async isCreateWorkflowButtonDisabled(): Promise<boolean> {
    return await test.step('Check if Create Workflow button is disabled', async () => {
      return await this.createButton.isDisabled({ timeout: SHORT_TIMEOUT });
    });
  }
}
