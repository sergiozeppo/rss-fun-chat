import { createElement } from '../../core/functions';
import { ServerStatus } from '../../core/types';

export function deleteItems(): void {
  const delMain = document.querySelector('.main');
  if (delMain) delMain.remove();
  const delForm = document.querySelector('form');
  if (delForm) delForm.remove();
  const delAbout = document.querySelector('.about');
  if (delAbout) delAbout.remove();
}

const form = document.createElement('form');
const loginInput = document.createElement('input');
const passwordInput = document.createElement('input');
const loginButton = document.createElement('button');
const infoButton = document.createElement('a');

export function loginPage(): void {
  deleteItems();

  loginInput.type = 'text';
  loginInput.placeholder = 'Логин';
  passwordInput.type = 'password';
  passwordInput.placeholder = 'Пароль';
  loginButton.textContent = 'Войти';
  infoButton.textContent = 'Инфо';

  form.appendChild(loginInput);
  form.appendChild(passwordInput);
  form.appendChild(loginButton);
  form.appendChild(infoButton);
  infoButton.href = '#about';
  infoButton.addEventListener('click', () => {
    deleteItems();
    about();
  });
  document.body.appendChild(form);
}

export function drawMain(): void {
  deleteItems();
  const main = createElement('main', ['main'], '', document.body);
  const header = createElement('header', ['header'], '', main);
  const headerInfo = createElement('article', ['header-info'], '', header);
  const userInfo = createElement('label', [], 'User: ', headerInfo);
  createElement('label', [], 'RSS FUN CHAT', headerInfo);
  const infoButton2 = createElement('a', [], 'Info', header) as HTMLLinkElement;
  const logoutButton = createElement('button', [], 'Logout', header);

  const content = createElement('section', ['main-content'], '', main);
  const userAsideBlock = createElement('aside', ['aside-section'], '', content);
  const filterInput = createElement('input', ['search'], '', userAsideBlock);
  const userList = createElement('ul', ['user-list'], '', userAsideBlock);
  const userItem = createElement('li', ['user-list-item'], '', userList);
  const userStatus = createElement('div', ['user-status'], '', userItem);
  const userLogin = createElement('label', ['user-login'], '', userItem);

  const dialogBlock = createElement('article', ['dialog-container'], '', content);
  const dialogHeader = createElement('article', ['dialog-header'], '', dialogBlock);
  const opponent = createElement('label', [], 'User: ', dialogHeader);
  const userStatusText = createElement('label', ['user-active-text'], 'В', dialogHeader);
  const dialogBox = createElement('article', ['dialog-box'], '', dialogBlock);
  const dialogForm = createElement('form', ['dialog-input'], '', dialogBlock);
  const dialogInput = createElement('input', ['dialog-input-field'], '', dialogForm);
  const dialogButton = createElement('button', ['dialog-button'], 'Send', dialogForm);
  console.log(userInfo, logoutButton, filterInput);
  console.log(dialogBox, dialogInput, dialogButton);
  console.log(userStatus, userLogin, opponent, userStatusText);
  const footer = createElement('footer', ['footer'], '', main);
  createElement('label', [], 'RSSchool', footer);
  createElement('label', [], 'sergiozeppo', footer);
  createElement('label', [], '2024', footer);

  infoButton2.href = '#about';
  infoButton2.addEventListener('click', () => {
    deleteItems();
    about();
  });
}

function about(): void {
  deleteItems();
  const div = createElement('main', ['about']);
  createElement('h3', ['about-title'], 'Fun chat', div);
  createElement(
    'label',
    ['desc'],
    'Приложение разработано для демонстрации задания Fun Chat в рамках курса RSSchool JS/FE 2023Q3',
    div
  );
  createElement(
    'label',
    ['desc'],
    'Удаление пользователей и сообщений происходит один раз в сутки',
    div
  );
  const link = createElement('a', ['ass'], 'Автор sergiozeppo', div) as HTMLLinkElement;
  link.href = 'https://github.com/sergiozeppo';
  const back = createElement('a', ['ass'], 'Вернуться назад', div) as HTMLLinkElement;
  back.href = '#login';
  back.addEventListener('click', () => {
    deleteItems();
  });
  document.body.appendChild(div);
}

const URL: string = 'ws://127.0.0.1:4000/';
const ws = new WebSocket(URL);
ws.onopen = (): void => {
  console.log('Hello WS!');
  form.addEventListener('submit', (e): void => {
    e.preventDefault();
    window.location.hash = '#main';
    drawMain();
  });
  const msg = {
    id: 'allls',
    type: ServerStatus.USER_LOGIN,
    payload: {
      user: {
        login: 'balbes',
        password: 'balbes',
      },
    },
  };

  ws.send(JSON.stringify(msg));
  console.log(ws.readyState);
};

ws.onmessage = (data): void => {
  console.log(data);
};

export function navigate(): void {
  if (window.location.hash === '#login') {
    loginPage();
  } else if (window.location.hash === '#about') {
    about();
  } else if (window.location.hash === '#main') {
    drawMain();
  }
}

if (!window.location.hash) {
  window.location.hash = '#login';
}

window.addEventListener('hashchange', navigate);
