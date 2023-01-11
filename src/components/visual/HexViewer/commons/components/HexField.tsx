import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      // '& > fieldset': {
      //   border: 'none !important',
      //   borderWidth: '0px'
      // }
    },
    formControl: {},
    outlinedInput: {
      paddingRight: '4px'
    },
    buttonGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    iconButton: {
      height: '20px',
      borderRadius: 0,
      minWidth: '20px'
    },
    input: {
      textAlign: 'left'
    }
  })
);

export type HexFieldProps = {
  id?: string;
  classes?: { root?: string; formControl?: string; input?: string };
};

export const WrappedHexField = ({
  id = '',
  classes = { root: null, formControl: null, input: null }
}: HexFieldProps) => {
  const fieldClasses = useStyles();

  const inputRef = useRef<HTMLInputElement>(null);

  const [textValue, setTextValue] = useState<string>('\\n\\t');
  const [inputValue, setInputValue] = useState<Array<string>>([]);

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
    let paste = event.clipboardData.getData('text');
    console.log(event.type, paste, inputRef.current.selectionStart);
  }, []);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    inputRef.current.addEventListener('mousedown', onMouseDown);
    inputRef.current.addEventListener('keydown', onKeyDown);
    inputRef.current.addEventListener('keypress', onKeyPress);
    inputRef.current.addEventListener('paste', onPaste);
  }, []);

  return (
    <FormControl
      fullWidth={true}
      className={clsx(fieldClasses.formControl, classes.formControl)}
      variant="outlined"
      size="small"
    >
      <InputLabel htmlFor={id}>{'label'}</InputLabel>
      <OutlinedInput
        classes={{
          root: classes.root,
          input: classes.input
        }}
        inputRef={inputRef}
        placeholder={'text'}
        fullWidth
        autoFocus
        margin="dense"
        multiline
        maxRows={1}
        value={textValue}
        onChange={event => {
          setTextValue(event.target.value);
        }}
        // onChange={event => {
        //   console.log('onChange', event);
        //   //   setTextValue(event.target.value);

        //   setTextValue(
        //     encodeURIComponent(event.target.value)
        //     //   .replace(/!/g, '%21')
        //     //   .replace(/'/g, '%27')
        //     //   .replace(/\(/g, '%28')
        //     //   .replace(/\)/g, '%29')
        //     //   .replace(/\*/g, '%2A')
        //   );
        // }}
        // onCopy={event => console.log('onCopy', event.nativeEvent)}
        // onPaste={event => console.log('onPaste', event.nativeEvent)}
        // onInput={event => console.log('onInput', event)}
        // onKeyPress={event => console.log('onKeyPress', event)}
      />
      {/* <input type="text" name="" id="" value={textValue} onInput={e=>console.log(e)} /> */}
    </FormControl>
  );
};

export const HexField = React.memo(WrappedHexField);

export default HexField;
