import { useEffect } from 'react';

export type UseAppKeyboardShortcutType = {
  key: string;
  expectControl?: boolean;
  expectShift?: boolean;
  expectAlt?: boolean;
  onKeyPressed: () => void;
};

/**
 * A react hook that will call a function when the necessary keys are pressed in unison
 *
 * @param {string} key Which key needs to be pressed to perform some action
 * @param {boolean} [expectControl=false] An optional field to need CTRL to be pressed as part of the keybind
 * @param {boolean} [expectShift=false] An optional field to need SHIFT to be pressed as part of the keybind
 * @param {boolean} [expectAlt=false] An optional field to need ALT to be pressed as part of the keybind
 * @param {() => void} [onKeyPressed] The action to perform when all of the necessary keys are pressed
 */
export function useAppKeyboardShortcut({
  key,
  onKeyPressed,
  expectControl = false,
  expectShift = false,
  expectAlt = false
}: UseAppKeyboardShortcutType) {
  useEffect(() => {
    function keyDownHandler(e: globalThis.KeyboardEvent) {
      if (
        (!expectControl || (expectControl && e.ctrlKey)) &&
        (!expectShift || (expectShift && e.shiftKey)) &&
        (!expectAlt || (expectAlt && e.altKey)) &&
        e.key === key
      ) {
        e.preventDefault();
        onKeyPressed();
      }
    }

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [key, expectControl, expectShift, expectAlt, onKeyPressed]);
}
