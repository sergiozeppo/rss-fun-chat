import { createElement, classListHandle, generateID } from './functions';
import { ServerStatus, UserIsLogined } from './types';

const URLstr: string = 'ws://127.0.0.1:4000/';
export const ws = new WebSocket(URLstr);

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

function autoLogin(): void {
  if (sessionStorage.sergioUser) {
    const userAct = JSON.parse(sessionStorage.sergioUser);
    const activeUser = {
      login: userAct.login,
      password: userAct.password,
    };
    const reqID = generateID();
    const msg = {
      id: reqID,
      type: ServerStatus.USER_LOGIN,
      payload: {
        user: {
          login: activeUser.login,
          password: activeUser.password,
        },
      },
    };

    ws.send(JSON.stringify(msg));
  }
}

window.onload = (): void => {
  ws.onopen = (): void => {
    autoLogin();
    console.log('Соединение установлено');
    ws.send(JSON.stringify(usersActive));
    ws.send(JSON.stringify(usersInActive));
  };

  ws.onmessage = (event): void => {
    const gdata = JSON.parse(event.data);
    const { payload, type } = gdata;
    console.log(payload);
    console.log(type);
    if (type === ServerStatus.USER_ACTIVE) {
      retrieveActiveUsers(payload);
    }
    if (type === ServerStatus.USER_INACTIVE) {
      retrieveActiveUsers(payload);
    }
    if (type === ServerStatus.USER_EXTERNAL_LOGIN) {
      retrieveActiveUsers(payload);
    }
    if (type === ServerStatus.USER_EXTERNAL_LOGOUT) {
      retrieveActiveUsers(payload);
    }
  };

  ws.onerror = (error): void => {
    if (error instanceof Error) console.log(error.message);
  };

  ws.onclose = (event): void => {
    if (event.wasClean) {
      console.log('Соединение закрыто чисто');
    } else {
      console.log('Обрыв соединения'); // например, "убит" процесс сервера
    }
    console.log(event.code + event.reason);
  };
};

function retrieveActiveUsers(payload: { users: UserIsLogined[] }): void {
  if (sessionStorage.sergioUser) {
    if (payload?.users) {
      const userlist = payload.users;
      const user = JSON.parse(sessionStorage.sergioUser);
      const filterUserlist = userlist.filter((someUser) => someUser.login !== user.login);
      const ul = document.querySelector('.user-list') as HTMLElement;

      filterUserlist.forEach((flUser) => {
        const li = createElement('li', ['user-list-item'], '');
        const liStat = createElement('div', ['user-status'], '', li);
        const liLogin = createElement('label', ['user-login'], '', li);
        li.setAttribute('data-login', flUser.login);
        if (flUser.isLogined) classListHandle(liStat, ['active']);
        liLogin.textContent = flUser.login;
        ul.append(li);
      });
    }
  }
}
