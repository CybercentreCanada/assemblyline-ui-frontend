import type { Locator, Page } from '@playwright/test';
import { MEDIUM_TIMEOUT } from 'app/spec.constant';
import type { WaitForOptions } from 'core/e2e/e2e.models';
import { PageObjectModel } from 'core/e2e/utils/PageObjectModel';

// Input POMs
import { CheckboxInput } from 'ui/inputs/pom/CheckboxInput.pom';
import { ChipsInput } from 'ui/inputs/pom/ChipsInput.pom';
import { ClassificationInput } from 'ui/inputs/pom/ClassificationInput.pom';
import { DateInput } from 'ui/inputs/pom/DateInput.pom';
import { JSONInput } from 'ui/inputs/pom/JSONInput.pom';
import { NumberInput } from 'ui/inputs/pom/NumberInput.pom';
import { RadioInput } from 'ui/inputs/pom/RadioInput.pom';
import { SelectInput } from 'ui/inputs/pom/SelectInput.pom';
import { SliderInput } from 'ui/inputs/pom/SliderInput.pom';
import { SwitchInput } from 'ui/inputs/pom/SwitchInput.pom';
import { TextAreaInput } from 'ui/inputs/pom/TextAreaInput.pom';
import { TextInput } from 'ui/inputs/pom/TextInput.pom';

export class DevelopmentLibraryInputsPage extends PageObjectModel {
  readonly title: Locator;

  // Inputs
  readonly checkboxInput: CheckboxInput;
  readonly chipsInput: ChipsInput;
  readonly classificationInput: ClassificationInput;
  readonly dateInput: DateInput;
  readonly jsonInput: JSONInput;
  readonly numberInput: NumberInput;
  readonly radioInput: RadioInput;
  readonly selectInput: SelectInput<any>;
  readonly sliderInput: SliderInput;
  readonly switchInput: SwitchInput;
  readonly textAreaInput: TextAreaInput;
  readonly textInput: TextInput;

  // Statess
  readonly disabledButton: CheckboxInput;
  readonly loadingButton: CheckboxInput;
  readonly resetButton: CheckboxInput;
  readonly tooltipButton: CheckboxInput;
  readonly errorButton: CheckboxInput;
  readonly readOnlyButton: CheckboxInput;
  readonly helperTextButton: CheckboxInput;
  readonly placeholderButton: CheckboxInput;
  readonly endAdornmentButton: CheckboxInput;
  readonly tinyButton: CheckboxInput;
  readonly monospaceButton: CheckboxInput;
  readonly passwordButton: CheckboxInput;
  readonly longNameButton: CheckboxInput;
  readonly overflowHiddenButton: CheckboxInput;
  readonly requiredButton: CheckboxInput;
  readonly badgeButton: CheckboxInput;

  constructor(page: Page) {
    super(page, 'Development Library Inputs Page', '/development/library?tab=inputs');

    this.title = page.getByRole('heading', { name: 'Library' });

    this.checkboxInput = new CheckboxInput(page, 'interaction-checkbox-input');
    this.chipsInput = new ChipsInput(page, 'interaction-chips-input');
    this.classificationInput = new ClassificationInput(page, 'interaction-classification-input');
    this.dateInput = new DateInput(page, 'interaction-date-input');
    this.jsonInput = new JSONInput(page, 'interaction-json-input');
    this.numberInput = new NumberInput(page, 'interaction-number-input');
    this.radioInput = new RadioInput(page, 'interaction-radio-input');
    this.selectInput = new SelectInput(page, 'interaction-select-input');
    this.sliderInput = new SliderInput(page, 'interaction-slider-input');
    this.switchInput = new SwitchInput(page, 'interaction-switch-input');
    this.textAreaInput = new TextAreaInput(page, 'interaction-textarea-input');
    this.textInput = new TextInput(page, 'interaction-text-input');

    this.disabledButton = new CheckboxInput(page, 'disabled');
    this.loadingButton = new CheckboxInput(page, 'loading');
    this.resetButton = new CheckboxInput(page, 'reset');
    this.tooltipButton = new CheckboxInput(page, 'tooltip');
    this.errorButton = new CheckboxInput(page, 'error');
    this.readOnlyButton = new CheckboxInput(page, 'readonly');
    this.helperTextButton = new CheckboxInput(page, 'helper-text');
    this.placeholderButton = new CheckboxInput(page, 'placeholder');
    this.endAdornmentButton = new CheckboxInput(page, 'end-adornment');
    this.tinyButton = new CheckboxInput(page, 'tiny');
    this.monospaceButton = new CheckboxInput(page, 'monospace');
    this.passwordButton = new CheckboxInput(page, 'password');
    this.longNameButton = new CheckboxInput(page, 'long-name');
    this.overflowHiddenButton = new CheckboxInput(page, 'overflow-hidden');
    this.requiredButton = new CheckboxInput(page, 'required');
    this.badgeButton = new CheckboxInput(page, 'badge');
  }

  locators(): Locator[] {
    return [this.title];
  }

  async waitForPage({ state = 'visible', timeout = MEDIUM_TIMEOUT }: WaitForOptions = {}) {
    await this.title.waitFor({ state, timeout });
  }
}
