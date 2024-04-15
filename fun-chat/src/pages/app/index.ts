import { createElement } from '../../core/functions';

export function deleteItems(div: HTMLDivElement, tag: string): void {
  const cards = div.querySelectorAll(tag);
  for (let i = 0; i < cards.length; i += 1) {
    cards[i].remove();
  }
}

export function loginPage(): void {
  deleteItems(document.body as HTMLDivElement, 'form');

  const form = document.createElement('form');
  const loginInput = document.createElement('input');
  const passwordInput = document.createElement('input');
  const loginButton = document.createElement('button');
  const infoButton = document.createElement('a');

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
    deleteItems(document.body as HTMLDivElement, 'form');
    about();
  });
  document.body.appendChild(form);
}

function about(): void {
  const prev = document.querySelector('.about');
  if (prev) deleteItems(document.body as HTMLDivElement, '.about');
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
    deleteItems(document.body as HTMLDivElement, 'main');
  });
  document.body.appendChild(div);
}

const ws = new WebSocket('ws://127.0.0.1:4000/');
ws.onopen = (): void => {
  console.log('Hello WS!');
  const msg = {
    id: 'allls',
    type: 'USER_LOGIN',
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
ws.onmessage = (e): void => {
  console.log(e.data);
};

export function navigate(): void {
  if (window.location.hash === '#login') {
    loginPage();
  } else if (window.location.hash === '#about') {
    about();
  }
}

if (!window.location.hash) {
  window.location.hash = '#login';
}

window.addEventListener('hashchange', navigate);
