export function setupCounter(element: HTMLButtonElement): void {
  let counter = 0;
  const setCounter = (count: number): void => {
    counter = count;
    const element1 = element;
    element1.innerHTML = `count is ${counter}`;
  };
  element.addEventListener("click", () => setCounter(counter + 1));
  setCounter(0);
}
