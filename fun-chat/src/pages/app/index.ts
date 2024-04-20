import { createElement, generateID } from '../../core/functions';
import { ServerStatus, User, ValidationError } from '../../core/types';
import { ws, fetchMessages } from '../../core/api';

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
  if (sessionStorage.sergioUser) {
    navigate();
  } else {
    loginInput.type = 'text';
    loginInput.placeholder = 'Логин';
    loginInput.pattern = '^[A-Z][\\-a-zA-z]{2,}$';
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Пароль';
    passwordInput.pattern = '^[A-Z][\\-a-zA-z]{3,}$';
    loginButton.textContent = 'Войти';
    loginButton.disabled = true;
    infoButton.textContent = 'Инфо';

    form.appendChild(loginInput);
    form.appendChild(passwordInput);
    form.appendChild(loginButton);
    form.appendChild(infoButton);
    infoButton.href = '#about';
    infoButton.addEventListener('click', () => {
      deleteItems();
      aboutPage();
    });
    document.body.appendChild(form);
  }
}

function checkDisableButton(): void {
  if (loginInput.value === '' || passwordInput.value === '') {
    loginButton.disabled = true;
  } else loginButton.disabled = false;
}

function validateError(dest: HTMLInputElement, input: string): void {
  const nameError = new ValidationError(input);
  dest.insertAdjacentHTML('afterend', `<p class="error-message">${nameError.message}</p>`);
  setTimeout(() => {
    const deleteError = document.querySelector('.error-message');
    form?.removeChild(deleteError as Node);
  }, 3000);
  loginButton.disabled = true;
}

function checkName(): void {
  if (!loginInput.value) validateError(loginInput, `Please, enter ${loginInput.placeholder}`);
  if (loginInput.validity.tooShort) {
    const min = loginInput.getAttribute('minLength');
    validateError(loginInput, `The minimum length should be ${min}`);
  }
  if (!loginInput.value.match(/^[A-Z]/g))
    validateError(loginInput, `First letter should be capital`);
  if (!loginInput.value.match(/[a-zA-z]/g))
    validateError(loginInput, `Only latin letters and hyphen allowed`);
  checkDisableButton();
}

function checkSurname(): void {
  if (!passwordInput.value) validateError(passwordInput, `Please, enter ${loginInput.placeholder}`);
  if (passwordInput.validity.tooShort) {
    const min = passwordInput.getAttribute('minLength');
    validateError(passwordInput, `The minimum length should be ${min}`);
  }
  if (!passwordInput.value.match(/^[A-Z]/g))
    validateError(passwordInput, `First letter should be capital`);
  if (!passwordInput.value.match(/[a-zA-z]/g))
    validateError(passwordInput, `Only latin letters and hyphen allowed`);
  checkDisableButton();
}

form.addEventListener('keyup', checkDisableButton);
loginInput.addEventListener('focusout', checkName);
passwordInput.addEventListener('focusout', checkSurname);

function drawFooter(div: HTMLElement): void {
  const footer = createElement('footer', ['footer'], '', div);
  createElement('label', [], 'RSSchool', footer);
  createElement('label', [], 'sergiozeppo', footer);
  createElement('label', [], '2024', footer);
}

export function mainPage(): void {
  deleteItems();
  const main = createElement('main', ['main'], '', document.body);
  const header = createElement('header', ['header'], '', main);
  const headerInfo = createElement('article', ['header-info'], '', header);
  const userInfo = createElement('label', [], '', headerInfo);
  if (sessionStorage.sergioCurrentUser)
    userInfo.textContent = `User: ${JSON.parse(sessionStorage.sergioCurrentUser)}`;
  createElement('label', [], 'RSS FUN CHAT', headerInfo);
  const infoButton2 = createElement('a', [], 'Info', header) as HTMLLinkElement;
  const logoutButton = createElement('button', [], 'Logout', header);

  const content = createElement('section', ['main-content'], '', main);
  const userAsideBlock = createElement('aside', ['aside-section'], '', content);
  const filterInput = createElement('input', ['search'], '', userAsideBlock);
  const userList = createElement('ul', ['user-list'], '', userAsideBlock);

  const dialogBlock = createElement('article', ['dialog-container'], '', content);
  const dialogHeader = createElement('article', ['dialog-header'], '', dialogBlock);
  const opponent = createElement('label', [], '', dialogHeader);
  const userStatusText = createElement('label', ['user-text'], '', dialogHeader);
  const dialogBox = createElement('article', ['dialog-box'], '', dialogBlock);
  const dialogForm = createElement('form', ['dialog-input'], '', dialogBlock);
  const dialogInput = createElement('input', ['dialog-input-field'], '', dialogForm);
  const dialogButton = createElement('button', ['dialog-button'], 'Send', dialogForm);
  (dialogInput as HTMLInputElement).disabled = true;
  (dialogButton as HTMLButtonElement).disabled = true;
  console.log(userInfo, logoutButton, filterInput);
  console.log(dialogBox, userList, opponent, userStatusText);
  drawFooter(main);

  infoButton2.href = '#about';
  buttonListenersSetup(infoButton2, logoutButton, dialogButton);
}

function buttonListenersSetup(
  link: HTMLLinkElement,
  button: HTMLElement,
  submit: HTMLElement
): void {
  link.addEventListener('click', () => {
    deleteItems();
    aboutPage();
  });
  button.addEventListener('click', () => {
    logout();
    deleteItems();
    window.location.hash = '#login';
    navigate();
  });
  submit.addEventListener('click', () => {
    sendText();
  });
}

function sendText(): void {
  const dialogInpitToText = document.querySelector('.dialog-input-field') as HTMLInputElement;
  if (dialogInpitToText.value !== '') {
    const dialogHeaderToText = document.querySelector('.dialog-header') as HTMLElement;
    const dialogUserToText = dialogHeaderToText.querySelector('label') as HTMLElement;
    if (dialogUserToText.textContent) {
      const sendID = generateID();
      const sendMessage = {
        id: sendID,
        type: ServerStatus.MSG_SEND,
        payload: {
          message: {
            to: dialogUserToText.textContent,
            text: dialogInpitToText.value,
          },
        },
      };
      console.log(sendMessage);
      ws.send(JSON.stringify(sendMessage));
      sessionStorage.setItem('inputSended', JSON.stringify(true));
      dialogInpitToText.value = '';
      fetchMessages(dialogUserToText.textContent);
    }
  }
}

function aboutPage(): void {
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
  if (sessionStorage.sergioUser) {
    back.href = '#main';
  } else {
    back.href = '#login';
  }
  back.addEventListener('click', () => {
    deleteItems();
  });
  document.body.appendChild(div);
}

const usersActive = {
  id: null,
  type: ServerStatus.USER_ACTIVE,
  payload: null,
};

const usersInActive = {
  id: null,
  type: ServerStatus.USER_INACTIVE,
  payload: null,
};

form.addEventListener('submit', (e): void => {
  e.preventDefault();
  const user = {
    login: loginInput.value,
    password: passwordInput.value,
  };
  sessionStorage.setItem('sergioUser', JSON.stringify(user));
  sessionStorage.setItem('sergioCurrentUser', JSON.stringify(loginInput.value));
  const reqID = generateID();
  const msg = {
    id: reqID,
    type: ServerStatus.USER_LOGIN,
    payload: {
      user: {
        login: user.login,
        password: user.password,
      },
    },
  };
  ws.send(JSON.stringify(msg));
  ws.send(JSON.stringify(usersActive));
  ws.send(JSON.stringify(usersInActive));
  console.log(ws.readyState);

  window.location.hash = '#main';
  mainPage();
});

function logout(): void {
  if (sessionStorage.sergioUser) {
    const delUser: User = JSON.parse(sessionStorage.sergioUser);
    console.log(delUser);
    const delMessage = {
      id: 'allls',
      type: ServerStatus.USER_LOGOUT,
      payload: {
        user: {
          login: `${delUser.password}`,
          password: `${delUser.password}`,
        },
      },
    };
    console.log(delMessage);
    ws.send(JSON.stringify(delMessage));
  }
  delete sessionStorage.sergioUser;
}
export function navigate(): void {
  if (window.location.hash === '#login') {
    if (sessionStorage.sergioUser) {
      window.location.hash = '#main';
      mainPage();
    } else loginPage();
  } else if (window.location.hash === '#about') {
    aboutPage();
  } else if (window.location.hash === '#main') {
    if (!sessionStorage.sergioUser) {
      window.location.hash = '#login';
      loginPage();
    } else mainPage();
  }
}

if (!window.location.hash) {
  window.location.hash = '#login';
}

window.addEventListener('hashchange', navigate);
