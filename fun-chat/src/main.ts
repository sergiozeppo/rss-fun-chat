import "./style.css";
import typescriptLogo from "./typescript.svg";
import { setupCounter } from "./counter";

const elem = document.querySelector<HTMLDivElement>("#app");
if (elem)
  elem.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`;

const btn = document.querySelector<HTMLButtonElement>("#counter");

if (btn) setupCounter(btn);
