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
