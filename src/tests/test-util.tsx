import { ThemeProvider, createTheme } from '@mui/material/styles';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import 'setimmediate';
import DEFAULT_THEME from '../components/hooks/useMyTheme';

/**
 * Button State, can be one of notPresent, disabled or enabled.
 */
export const enum ButtonState {
  notPresent = 0,
  disabled = 1,
  enabled = 2
}

/**
 * Like the name says... do nothing! Useful for required callbacks that don't need to do anything.
 */
export const doNothing = () => {};

/**
 * Helper to wait for fetching inside the component to finish.
 */
const flushPromises = () => new Promise(setImmediate);

/**
 * Flush pending promises.
 */
export async function flush(): Promise<void> {
  await act(async () => {
    // ensure there aren't any promises in progress.
    await flushPromises();
  });
}

/**
 * Read a blob.
 *
 * @param content The blob.
 */
export function readblob(content: Blob): Promise<string | ArrayBuffer> {
  return new Promise(resolve => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      return resolve(fileReader.result);
    };
    fileReader.readAsText(content);
  });
}

/**
 * Find an element.
 * @param id The element id.
 * @param index Optional index of the element with the same id.
 * @param checkDisabled Set to true to check if the element is disabled.
 */
export function findElement(id: string, index?: number, checkDisabled?: boolean): HTMLElement {
  let element: HTMLElement;
  if (index === undefined) {
    element = screen.getByTestId(id);
  } else {
    element = screen.getAllByTestId(id)[index];
  }
  if (checkDisabled && element.hasAttribute('disabled')) {
    throw Error(
      `Element with id:${id} (index: ${index}) is disabled, so firing events on it will not have expected results.`
    );
  }
  return element;
}

/**
 * Change the contents of an input.
 *
 * @param id The element id.
 * @param text The text to put in the input.
 * @param index Optional index of the element with the same id.
 * @param selectionStart Optional selection start value.
 * @param selectionEnd Optional selection end value.
 * @Throws error if you didn't pick a unique instance, none with the id exist or the button is disabled and can't be clicked.
 */
export async function changeInput(
  id: string,
  text: string,
  index?: number,
  selectionStart?: number,
  selectionEnd?: number
): Promise<void> {
  const element = findElement(id, index, true);
  fireEvent.change(element, {
    target: {
      value: text,
      selectionStart: selectionStart !== undefined ? selectionStart : text.length,
      selectionEnd: selectionEnd !== undefined ? selectionEnd : text.length,
      setSelectionRange: doNothing
    }
  });
  await flush();
}

/**
 * Drop a file to a "section" element on the document.
 * @param file the file to drop.
 */
export async function dropFile(file: File): Promise<void> {
  const elementWrapper: HTMLElement = document.querySelector('section');
  fireEvent.drop(elementWrapper, { dataTransfer: { files: [file], types: ['Files'] } });
  await flush();
}

/**
 * Blur an input component.
 *
 * @param id The element id.
 * @param text Optional text to put in the input.
 * @param index Optional index of the element with the same id.
 * @param selectionStart Optional selection start value.
 * @param selectionEnd Optional selection end value.
 * @Throws error if you didn't pick a unique instance, none with the id exist or the button is disabled and can't be clicked.
 * @Throws error if you didn't pick a unique instance, none with the id exist or the button is disabled and can't be clicked.
 */
export async function blurInput(
  id: string,
  text?: string,
  index?: number,
  selectionStart?: number,
  selectionEnd?: number
): Promise<void> {
  const element = findElement(id, index, true);
  fireEvent.blur(element, {
    target: {
      value: text ? text : undefined,
      selectionStart: selectionStart !== undefined ? selectionStart : text ? text.length : undefined,
      selectionEnd: selectionEnd !== undefined ? selectionEnd : text ? text.length : undefined
    }
  });
  await flush();
}

/**
 * Focus an input component.
 *
 * @param id The element id.
 * @param index Optional index of the element with the same id.
 * @Throws error if you didn't pick a unique instance, none with the id exist or the button is disabled and can't be clicked.
 */
export async function focusInput(id: string, index?: number): Promise<void> {
  const element = findElement(id, index, true);
  fireEvent.focus(element);
  await flush();
}

/**
 * Click a button.
 *
 * @param id The element id.
 * @param index Optional index of the element with the same id.
 * @Throws error if you didn't pick a unique instance, none with the id exist or the button is disabled and can't be clicked.
 */
export async function clickButton(id: string, index: number = 0): Promise<void> {
  const element = findElement(id, index, true);
  fireEvent.click(element);
  await flush();
}

/**
 * Click a button within the given element.
 * @param card The element.
 * @param id The button ID.
 * @param index The index to click.
 */
export async function clickButtonWithinElement(card: HTMLElement, id: string, index?: number): Promise<void> {
  let element: HTMLElement;
  if (index !== undefined) {
    const result = await within(card).findAllByTestId(id);
    element = result[index];
  } else {
    element = await within(card).findByTestId(id);
  }
  fireEvent.click(element);
  await flush();
}

/**
 * Right-click the element.
 *
 * @param element
 * @Throws error if you didn't pick a unique instance, none with the id exist or the button is disabled and can't be clicked.
 */
export async function contextMenuElement(element: Element): Promise<void> {
  fireEvent.contextMenu(element);
  await flush();
}

/**
 * Right-click the element.
 *
 * @param id The element id.
 * @param index Optional index of the element with the same id.
 * @Throws error if you didn't pick a unique instance, none with the id exist or the button is disabled and can't be clicked.
 */
export async function contextMenu(id: string, index?: number): Promise<void> {
  const element = findElement(id, index, true);
  await contextMenuElement(element);
}

/**
 * Click an item element/
 *
 * @param id The element id.
 * @param index Optional index of the element with the same id.
 * @param ctrlKey
 * @Throws error if you didn't pick a unique instance, none with the id exist or the button is disabled and can't be clicked.
 */
export async function clickItem(id: string, index?: number, ctrlKey = false): Promise<void> {
  const element = findElement(id, index, true);
  fireEvent.click(element, { ctrlKey });
  await flush();
}

/**
 * Click an element.
 *
 * @param element The element to lick.
 * @param ctrlKey
 * @param shiftKey
 * @Throws error if you didn't pick a unique instance, none with the id exist or the button is disabled and can't be clicked.
 */
export async function clickElement(element: Element, ctrlKey = false, shiftKey = false): Promise<void> {
  fireEvent.click(element, { ctrlKey, shiftKey });
  await flush();
}

/**
 * Click an item in a list.
 * @param tableId The table manager id.
 * @param rowIndex
 */
export async function clickListItem(tableId: string, rowIndex: number): Promise<void> {
  const elementWrapper = screen.getByTestId(tableId).querySelector(`div[data-index="${rowIndex}"]`);
  fireEvent.click(elementWrapper);
  await flush();
}

/**
 * Click a table cell.
 * @param tableId The table id.
 * @param rowIndex
 * @param cellIndex
 * @param extras
 */
export async function clickRow(tableId: string, rowIndex: number, cellIndex: number, extras?: object): Promise<void> {
  const elementWrapper = screen
    .getByTestId(tableId)
    .querySelector(`td[data-rowindex="${rowIndex}"][data-cellindex="${cellIndex}"]`);
  fireEvent.click(elementWrapper, extras);
  await flush();
}

/**
 * Click multiple table cells.
 * @param tableId The table id.
 * @param rowIndexes
 * @param cellIndex
 */
export async function clickRows(tableId: string, rowIndexes: number[], cellIndex: number): Promise<void> {
  const table = screen.getByTestId(tableId);
  rowIndexes.forEach(rowIndex => {
    const str = `td[data-rowindex="${rowIndex}"][data-cellindex="${cellIndex}"]`;
    const elementWrapper = table.querySelector(str);
    fireEvent.click(elementWrapper, { ctrlKey: true });
  });
  await flush();
}

/**
 * Verify the table content. This is just for checking the rows/cells of the table without the rest done by verifyTable().
 *
 * @param id The table id.
 * @param expectedContent The expected content.
 */
export function verifyTableContent(id: string, expectedContent: string[][]) {
  // Build out the content
  const content: string[][] = [];

  const tableWrapper = screen.queryByTestId(id);
  if (tableWrapper) {
    const rowWrappers = tableWrapper.querySelector('tbody').querySelectorAll('tr');
    rowWrappers.forEach(rowWrapper => {
      const row: string[] = [];
      let cellWrappers = rowWrapper.querySelectorAll('td');
      cellWrappers.forEach(cellWrapper => {
        row.push(cellWrapper.textContent);
      });
      content.push(row);
    });
  }

  expect(content).toEqual(expectedContent);
}

export type MouseActionType = 'mouseUp' | 'mouseOver' | 'mouseLeave';

/**
 * Simulate a mouse event
 * @param action
 * @param id The element id.
 * @param index Optional index of the element with the same id.
 */
async function mouseAction(action: MouseActionType, id: string, index?: number): Promise<void> {
  const element = findElement(id, index, true);
  fireEvent[action](element, { target: { selectionStart: 0, selectionEnd: 0, value: '' } });
  await flush();
}

/**
 * Simulate a mouse up event
 * @param id The element id.
 */
export async function mouseUp(id: string): Promise<void> {
  await mouseAction('mouseUp', id);
}

/**
 * Close an open materials popover by clicking the backdrop.
 * @param id The element id.
 */
export async function closePopover(id: string): Promise<void> {
  // find the backdrop and click it -> closes the popover
  const element = findElement(`${id}-popover`, 0, true);
  fireEvent.click(element);
  await flush();
}

/**
 * Verify if an element is disabled.
 *
 * @param element The element.
 * @param disabled Set to true if expected to be disabled (Default) or false if it shouldn't be disabled.
 */
export function verifyElementDisabled(element: HTMLElement, disabled: boolean = true): void {
  if (disabled) {
    expect(element).toBeDisabled();
  } else {
    expect(element).not.toBeDisabled();
  }
}

/**
 * Verify if an element is disabled.
 *
 * @param id The element id.
 * @param disabled Set to true if expected to be disabled (Default) or false if it shouldn't be disabled.
 * @param index Optional index of the element with the same id.
 */
export function verifyDisabled(id: string, disabled: boolean = true, index?: number): void {
  verifyElementDisabled(findElement(id, index), disabled);
}

/**
 * Verify if an element has the expected text.
 *
 * @param element The element.
 * @param text The expected text.
 */
export function verifyElementText(element: Element, text: string | RegExp): void {
  expect(element).toHaveTextContent(text, { normalizeWhitespace: false });
}

/**
 * Verify if an element has the given text.
 *
 * @param id The element id.
 * @param text The expected text.
 * @param index Optional index of the element with the same id.
 */
export function verifyText(id: string, text: string | RegExp, index?: number): void {
  verifyElementText(findElement(id, index), text);
}

/**
 * Verify if an element has the given text within a provided parent ID.
 *
 * @param id The element id.
 * @param parentId The parent ID to look within.
 * @param text The expected text.
 */
export function verifyTextWithinParent(
  id: string,
  parentId: string,
  text: string | RegExp,
  parentIndex: number = 0,
  index: number = 0
): void {
  verifyElementText(within(screen.getAllByTestId(parentId)[parentIndex]).getAllByTestId(id)[index], text);
}

/**
 * Verify if an element has the given title.
 *
 * @param element The element.
 * @param title The expected text.
 */
export function verifyElementTitle(element: Element, title: string): void {
  expect(element).toHaveAttribute('title', title);
}

/**
 * Verify if an element has the given title.
 *
 * @param id The element id.
 * @param title The expected text.
 * @param index Optional index of the element with the same id.
 */
export function verifyTitle(id: string, title: string, index?: number): void {
  verifyElementTitle(findElement(id, index), title);
}

/**
 * Verify an input.
 *
 * @param id The element id.
 * @param text The text to input
 * @param message Optional expected message.
 * @param disabled Optional disabled check.
 * @param index Optional index of the element with the same id.
 */
export function verifyInput(
  id: string,
  text: string,
  message?: string,
  disabled: boolean = false,
  index?: number
): void {
  const inputElement: HTMLElement = findElement(id, index, disabled);
  if (inputElement instanceof HTMLInputElement) {
    expect(inputElement).toHaveAttribute('value', text);
  } else {
    verifyElementText(inputElement, text);
  }
  if (message) {
    verifyTitle(`${id}-message`, message);
  } else {
    const messageElement: HTMLElement[] = screen.queryAllByTestId(`${id}-message`);
    if (messageElement.length > 0) {
      throw new Error(`Input '${id}' found to have unexpected message '${messageElement[0].getAttribute('title')}'`);
    }
  }
}

/**
 * Change and verify an input component.
 *
 * @param id The element id.
 * @param newVal    The new value to be put in the input field.
 * @param message   The expected error message, if there should be one.
 */
export async function changeInputAndVerify(id: string, newVal: string, message?: string): Promise<void> {
  await changeInput(id, newVal);
  verifyInput(id, newVal, message);
}

/**
 * Verify if a button is not present, disabled or enabled.
 */
export function verifyButton(id: string, state: ButtonState, title: string, index: number = 0): void {
  if (state > 0) {
    // button present
    const buttons = screen.queryAllByTestId(id);
    const button = buttons[index];
    expect(button).toBeInTheDocument();

    expect(button).toHaveAttribute('title', title);

    try {
      if (state > 1) {
        // button enabled
        expect(button).not.toHaveAttribute('disabled');
      } else {
        expect(button).toHaveAttribute('disabled');
      }
    } catch (error) {
      // to notify which id failed, this is usefully when multiple buttons are checked in 1 test
      throw new Error(`${error} while testing the state of button '${id}'`);
    }
  } else {
    expect(screen.queryByTestId(id)).toBeNull();
  }
}

/**
 * Verify an element exists.
 * @param id The element id.
 * @param exists Set to true if expected to exist (Default) or false if it shouldn't exist.
 */
export function verifyExistence(id: string, exists = true): void {
  if (exists) {
    expect(screen.getByTestId(id)).toBeInTheDocument();
  } else {
    expect(screen.queryByTestId(id)).toBeNull();
  }
}

/**
 * asynchronously verifies if an element exists.
 * @param id The element id.
 */
export async function asyncVerifyExistence(id: string): Promise<void> {
  expect(await waitFor(() => screen.findByTestId(id))).toBeInTheDocument();
}

/**
 * Verify an element exists within a parent.
 * @param id The element id.
 * @param parentId The parent ID to look in for the element.
 * @param exists Set to true if expected to exist (Default) or false if it shouldn't exist.
 */
export function verifyExistenceWithinParent(id: string, parentId: string, exists = true): void {
  if (exists) {
    expect(within(screen.getByTestId(parentId)).getByTestId(id)).toBeInTheDocument();
  } else {
    expect(within(screen.getByTestId(parentId)).queryByTestId(id)).toBeNull();
  }
}

/**
 * Verify an element exists.
 * @param element The element.
 * @param exists Set to true if expected to exist (Default) or false if it shouldn't exist.
 */
export function verifyElementExistence(element: HTMLElement, exists = true): void {
  if (exists) {
    expect(element).toBeInTheDocument();
  } else {
    expect(element).toBeNull();
  }
}

/**
 * Get the input value.
 * @param id The element id.
 */
export function getInputValue(id: string): string {
  const inputElement = screen.getByTestId(id);
  return inputElement.getAttribute('value');
}

/**
 *
 * @param keyEvent
 * @param id
 * @param keyCode
 * @param index
 * @param ctrlKey
 * @param shiftKey
 * @param value
 * @param selectionStart
 */
async function keyInput(
  keyEvent: string,
  id: string,
  keyCode: number,
  index?: number,
  ctrlKey?: boolean,
  shiftKey?: boolean,
  value?: string,
  selectionStart?: number
): Promise<void> {
  const element = findElement(id, index);
  fireEvent[keyEvent](element, {
    keyCode,
    ctrlKey,
    shiftKey,
    target: {
      value: value,
      selectionStart: selectionStart ? selectionStart : 0,
      selectionEnd: selectionStart ? selectionStart : 0
    },
    persist: doNothing,
    preventDefault: doNothing
  });
  await flush();
}

/**
 * Send keyup event to input
 * @param id The element id.
 * @param keyCode
 * @param index Optional index of the element with the same id.
 * @param ctrlKey
 * @param shiftKey
 * @param value
 * @param selectionStart
 */
export async function keyupInput(
  id: string,
  keyCode: number,
  index?: number,
  ctrlKey?: boolean,
  shiftKey?: boolean,
  value?: string,
  selectionStart?: number
): Promise<void> {
  await keyInput('keyUp', id, keyCode, index, ctrlKey, shiftKey, value, selectionStart);
}

/**
 * Send keydown event to input
 * @param id The element id.
 * @param keyCode
 * @param index Optional index of the element with the same id.
 * @param ctrlKey
 * @param shiftKey
 * @param value
 * @param selectionStart
 */
export async function keydownInput(
  id: string,
  keyCode: number,
  index?: number,
  ctrlKey?: boolean,
  shiftKey?: boolean,
  value?: string,
  selectionStart?: number
): Promise<void> {
  await keyInput('keyDown', id, keyCode, index, ctrlKey, shiftKey, value, selectionStart);
}

/**
 * Press a key down and up as a user would normally to ensure we hit all the handlers on that control.
 * @param id The element id.
 * @param keyCode
 * @param index Optional index of the element with the same id.
 * @param ctrlKey
 * @param shiftKey
 * @param value
 * @param selectionStart
 */
export async function toggleKeyInput(
  id: string,
  keyCode: number,
  index?: number,
  ctrlKey?: boolean,
  shiftKey?: boolean,
  value?: string,
  selectionStart?: number
): Promise<void> {
  await keydownInput(id, keyCode, index, ctrlKey, shiftKey, value, selectionStart);
  await keyupInput(id, keyCode, index, ctrlKey, shiftKey, value, selectionStart);
}

/**
 * Submit and verify an input component.
 *
 * @param id The element id.
 * @param newVal    The new value to be put in the input field.
 * @param message   The expected error message, if there should be one.
 */
export async function enterInputAndVerify(id: string, newVal: string, message?: string): Promise<void> {
  await toggleKeyInput(id, 13, 0, false, false, newVal);
  verifyInput(id, newVal, message);
}

/**
 * Verify an Accordion component.
 * @param id
 * @param expanded
 * @param title
 * @param content
 * @param disabled
 * @param nthAccordion
 */
export function verifyAccordion(
  id: string,
  expanded: boolean,
  title?: string,
  content?: string,
  disabled?: boolean,
  nthAccordion?: number
): void {
  if (title || content) {
    verifyText(id, `${title || ''}${content || ''}`);
  }
  // With the accordion element, children[0] is the header and children[1] is the content
  const element = screen.getAllByTestId(id)[nthAccordion || 0].children[0];
  expect(element).toHaveAttribute('aria-expanded', `${expanded}`);
  if (disabled) {
    expect(element).toHaveAttribute('aria-disabled', 'true');
  } else {
    expect(element).not.toHaveAttribute('aria-disabled', 'true');
  }
}

/**
 * Toggle an accordion from expanded to collapsed or vice versa
 * @param parentComponentId
 * @param nthAccordion
 */
export async function toggleAccordion(parentComponentId: string, nthAccordion?: number): Promise<void> {
  await clickElement(
    within(screen.getAllByTestId(parentComponentId)[nthAccordion || 0]).getByTestId('accordion-expand-icon')
  );
}

/**
 * Dispatch events
 * @param events
 */
export function dispatchEvents(events: CustomEvent[]) {
  act(() => {
    events.forEach(event => window.dispatchEvent(event));
  });
}

export function wrapWithTheme(element: JSX.Element): JSX.Element {
  return <ThemeProvider theme={createTheme({ palette: DEFAULT_THEME().palette.light })}>{element}</ThemeProvider>;
}

/**
 * Convenience function for rendering a component and waiting for any active promises.
 * @param element The element to render.
 * @return The result of the render.
 */
export async function renderComponent(element: JSX.Element): Promise<void> {
  render(element);
  await flush();
}

/**
 * Helper to print out the screen content. If null is passed, the entire screen is printed.
 * This will print out to a length of {@link Number#MAX_SAFE_INTEGER}
 * @param element
 */
export function screenDebug(element = null) {
  // eslint-disable-next-line
  screen.debug(element, Number.MAX_SAFE_INTEGER);
}
