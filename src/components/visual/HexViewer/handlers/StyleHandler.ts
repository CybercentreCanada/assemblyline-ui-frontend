export const addClass = (index: number, classname: string) =>
  document
    .getElementById('hex-viewer')
    ?.querySelectorAll("[data-index='" + index + "']")
    ?.forEach(element => element.classList.add('class', classname));

export const removeClass = (index: number, classname: string) =>
  document
    .getElementById('hex-viewer')
    ?.querySelectorAll("[data-index='" + index + "']")
    ?.forEach(element => element.classList.remove('class', classname));

export const addClassToRange = (start: number, end: number, classname: string) => {
  for (let i = start; i <= end; i++) addClass(i, classname);
};

export const removeClassToRange = (start: number, end: number, classname: string) => {
  for (let i = start; i <= end; i++) removeClass(i, classname);
};

export const addClassToArray = (indexes: Array<number>, length: number, classname: string) =>
  indexes.forEach(index => addClassToRange(index, index + length - 1, classname));

export const removeClassToArray = (indexes: Array<number>, length: number, classname: string) =>
  indexes.forEach(index => removeClassToRange(index, index + length - 1, classname));

export const renderIndexClass = (
  prevState: number,
  nextState: number,
  classname: string,
  { overscanStartIndex: start, overscanStopIndex: stop }: { overscanStartIndex: number; overscanStopIndex: number }
) => {
  if (prevState !== null && start <= prevState && prevState <= stop)
    document
      .getElementById('hex-viewer')
      ?.querySelectorAll("[data-index='" + prevState + "']")
      ?.forEach(element => element.classList.remove('class', classname));
  if (nextState !== null && start <= nextState && nextState <= stop)
    document
      .getElementById('hex-viewer')
      ?.querySelectorAll("[data-index='" + nextState + "']")
      ?.forEach(element => element.classList.add('class', classname));
};

export const renderArrayClass = (
  prevState: number[],
  nextState: number[],
  classname: string,
  { overscanStartIndex: start, overscanStopIndex: stop }: { overscanStartIndex: number; overscanStopIndex: number }
) => {
  const prev = prevState.filter(index => !nextState.includes(index) && start <= index && index <= stop);
  const next = nextState.filter(index => !prevState.includes(index) && start <= index && index <= stop);
  document
    .getElementById('hex-viewer')
    ?.querySelectorAll('.cell')
    .forEach(el => {
      const index = parseInt(el.getAttribute('data-index'));
      if (prev.includes(index)) el.classList.remove('class', classname);
      if (next.includes(index)) el.classList.add('class', classname);
    });
};
