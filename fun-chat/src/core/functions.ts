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

export function generateID(): string {
  const radix = 36;
  const min = 2;
  const max = 9;
  return Math.random().toString(radix).substring(min, max);
}

export function getMessageDate(date: Date): string {
  return `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}
