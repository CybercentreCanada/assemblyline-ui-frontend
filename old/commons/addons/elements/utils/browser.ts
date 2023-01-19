/* eslint-disable no-param-reassign */
import browser from 'browser-detect';

export function insertText(input, from, to, text) {
  const browserName = browser().name;
  // execCommand doesn't work in FF.
  input.focus();
  if (browserName === 'firefox') {
    _insertTextFF(input, from, to, text);
  } else {
    _insertText(input, from, to, text);
  }
}

function _insertText(input, from, to, text) {
  // const thisCursor = input.selectionStart;
  // const nextCursor = thisCursor + text.length;
  input.setSelectionRange(from, to);
  document.execCommand('insertText', false, text);
}

function _insertTextFF(input, from, to, text) {
  // UNDO is broken in FF.
  const oldText = input.value;
  const prefix = oldText.substring(0, from);
  const suffix = oldText.substring(to);
  const newText = `${prefix}${text}${suffix}`;
  input.value = newText;
}
