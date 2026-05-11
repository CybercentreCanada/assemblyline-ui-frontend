import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import type { SxProps } from '@mui/material/styles';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import React, { useCallback, useRef, useState } from 'react';

export type HexFieldProps = {
  id?: string;
  slotSX?: { root?: SxProps; formControl?: SxProps; input?: SxProps };
};

export const WrappedHexField = ({
  id = '',
  slotSX = { root: null, formControl: null, input: null }
}: HexFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [textValue, setTextValue] = useState<string>('\\n\\t');
  const [inputValue, setInputValue] = useState<string[]>([]);

  const onMouseDown = useCallback((event: Event | any) => {
    console.log(event, inputRef.current.selectionStart);
  }, []);

  const onKeyDown = useCallback((event: Event | any) => {
    console.log(event, inputRef.current.selectionStart);
  }, []);

  const onKeyPress = useCallback((event: Event | any) => {
    console.log(event, inputRef.current.selectionStart);
  }, []);

  const onPaste = useCallback((event: Event | any) => {
    const paste = event.clipboardData.getData('text');
    console.log(event.type, paste, inputRef.current.selectionStart);
  }, []);

  useEffectOnce(() => {
    inputRef.current.addEventListener('mousedown', onMouseDown);
    inputRef.current.addEventListener('keydown', onKeyDown);
    inputRef.current.addEventListener('keypress', onKeyPress);
    inputRef.current.addEventListener('paste', onPaste);
    return () => {
      inputRef.current.removeEventListener('mousedown', onMouseDown);
      inputRef.current.removeEventListener('keydown', onKeyDown);
      inputRef.current.removeEventListener('keypress', onKeyPress);
      inputRef.current.removeEventListener('paste', onPaste);
    };
  });

  useEffectOnce(() => {
    inputRef.current.addEventListener('mousedown', onMouseDown);
    inputRef.current.addEventListener('keydown', onKeyDown);
    inputRef.current.addEventListener('keypress', onKeyPress);
    inputRef.current.addEventListener('paste', onPaste);
  });

  return (
    <FormControl fullWidth={true} variant="outlined" size="small" sx={{ ...slotSX?.formControl }}>
      <InputLabel htmlFor={id}>label</InputLabel>
      <OutlinedInput
        inputRef={inputRef}
        placeholder="text"
        fullWidth
        autoFocus
        size="small"
        margin="dense"
        multiline
        maxRows={1}
        value={textValue}
        onChange={event => {
          setTextValue(event.target.value);
        }}
        slotProps={{
          root: { sx: { ...slotSX?.root } },
          input: { sx: { ...slotSX?.input } }
        }}
      />
    </FormControl>
  );
};

export const HexField = React.memo(WrappedHexField);

export default HexField;
