export function createElement(
  tag: string,
  classes?: string[],
  text?: string,
  parent?: HTMLElement
): HTMLElement {
  const element = document.createElement(tag);
  if (text) {
    element.textContent = text;
  }

  if (classes) {
    if (classes.length > 0) {
      element.classList.add(...classes);
    }
  }
  if (parent) {
    parent.appendChild(element);
  }
  return element;
}

export function classListHandle(
  element: HTMLElement,
  classesAdd?: string[],
  classesRemove?: string[],
  text?: string
): HTMLElement {
  const el = element;
  if (classesAdd) {
    if (classesAdd.length > 0) {
      el.classList.add(...classesAdd);
    }
  }

  if (classesRemove) {
    if (classesRemove.length > 0) {
      el.classList?.remove(...classesRemove);
    }
  }

  if (text) {
    el.textContent = text;
  }
  return el;
}

export function generateID(): string {
  const radix = 36;
  const min = 2;
  const max = 9;
  return Math.random().toString(radix).substring(min, max);
}
