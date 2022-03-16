import { MutableRefObject } from 'react';

export const addClass = (ref: MutableRefObject<HTMLDivElement>, index: number, classname: string) =>
  ref.current
    ?.querySelectorAll("[data-index='" + index + "']")
    ?.forEach(element => element.classList.add('class', classname));

export const removeClass = (ref: MutableRefObject<HTMLDivElement>, index: number, classname: string) =>
  ref.current
    ?.querySelectorAll("[data-index='" + index + "']")
    ?.forEach(element => element.classList.remove('class', classname));

export const addClassToRange = (
  ref: MutableRefObject<HTMLDivElement>,
  start: number,
  end: number,
  classname: string
) => {
  for (let i = start; i <= end; i++) addClass(ref, i, classname);
};

export const removeClassToRange = (
  ref: MutableRefObject<HTMLDivElement>,
  start: number,
  end: number,
  classname: string
) => {
  for (let i = start; i <= end; i++) removeClass(ref, i, classname);
};

export const addClassToArray = (
  ref: MutableRefObject<HTMLDivElement>,
  indexes: Array<number>,
  length: number,
  classname: string
) => indexes.forEach(index => addClassToRange(ref, index, index + length - 1, classname));

export const removeClassToArray = (
  ref: MutableRefObject<HTMLDivElement>,
  indexes: Array<number>,
  length: number,
  classname: string
) => indexes.forEach(index => removeClassToRange(ref, index, index + length - 1, classname));

const getQuery = (index: number | number[]) => {
  if (Number.isInteger(index)) return ` [data-index="${index}"]`;
  else if (Array.isArray(index)) return index.map(i => (i !== null && i >= 0 ? `[data-index="${i}"]` : '')).toString();
};

export const renderClass = (
  ref: MutableRefObject<HTMLDivElement>,
  prevState: number | number[],
  nextState: number | number[],
  classname: string,
  { overscanStartIndex: start, overscanStopIndex: stop }: { overscanStartIndex: number; overscanStopIndex: number }
) => {
  if (Number.isInteger(prevState) && Number.isInteger(nextState)) {
    if (prevState === nextState) return;
    ref.current?.querySelectorAll(getQuery([prevState as number, nextState as number]))?.forEach(el => {
      const index = parseInt(el.getAttribute('data-index'));
      if (nextState === index) el.classList.add('class', classname);
      if (prevState === index) el.classList.remove('class', classname);
    });
    return;
  } else if (Array.isArray(prevState) && Array.isArray(nextState)) {
    const prev = prevState.filter(index => !nextState.includes(index) && start <= index && index <= stop);
    const next = nextState.filter(index => !prevState.includes(index) && start <= index && index <= stop);
    ref.current?.querySelectorAll('.cell').forEach(el => {
      const index = parseInt(el.getAttribute('data-index'));
      if (next.includes(index)) el.classList.add('class', classname);
      if (prev.includes(index)) el.classList.remove('class', classname);
    });
    return;
  }
};
