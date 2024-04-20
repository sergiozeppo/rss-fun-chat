import { createElement, generateID, getMessageDate } from './functions';
import { ServerStatus, UserIsLogined, Message, MessageDeliver } from './types';

const URLstr: string = 'ws://127.0.0.1:4000/';
export const ws = new WebSocket(URLstr);
let CURRENT_USER: string;

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

export function autoLogin(): void {
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

function wsMessageHadler(): void {
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
      appendExternalUsers(payload);
    }
    if (type === ServerStatus.USER_EXTERNAL_LOGOUT) {
      appendExternalUsers(payload);
    }
    if (type === ServerStatus.MSG_FROM_USER) {
      drawMessages(payload);
    }
    if (type === ServerStatus.MSG_DELIVER) {
      messageDeliver(payload);
    }
  };
}

window.onload = (): void => {
  ws.onopen = (): void => {
    autoLogin();
    console.log('Connection established');
    ws.send(JSON.stringify(usersActive));
    ws.send(JSON.stringify(usersInActive));
  };
  wsMessageHadler();
  ws.onerror = (error): void => {
    if (error instanceof Error) console.log(error.message);
  };
  ws.onclose = (event): void => {
    if (event.wasClean) {
      console.log('Connection closed cleanly');
    } else {
      console.log('Connection died');
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
        if (flUser.isLogined) liStat.classList.add('active');
        else liStat.classList?.remove('active');
        liLogin.textContent = flUser.login;
        ul.append(li);
        li.addEventListener('click', chooseUser);
      });
    }
  }
}

function appendExternalUsers(payload: { user: UserIsLogined }): void {
  if (sessionStorage.sergioUser) {
    if (payload?.user) {
      const userItem = payload.user;
      const ul = document.querySelector('.user-list') as HTMLElement;
      const oldUserAppend = ul.querySelector(`li[data-login=${userItem.login}]`) as HTMLElement;
      console.log(oldUserAppend);
      oldUserAppend?.remove();
      const ifOpp = document.querySelector(`article[data-opp=${userItem.login}]`);
      console.log(ifOpp);

      const li = createElement('li', ['user-list-item'], '');
      const liStat = createElement('div', ['user-status'], '', li);
      const liLogin = createElement('label', ['user-login'], '', li);
      li.setAttribute('data-login', userItem.login);
      if (userItem.isLogined) liStat.classList.add('active');
      else liStat.classList?.remove('active');
      liLogin.textContent = userItem.login;
      if (userItem.isLogined) {
        ul.prepend(li);
        li.addEventListener('click', chooseUser);
        if (ifOpp) {
          const toggle = ifOpp.querySelector('.user-text') as HTMLElement;
          toggle.classList?.add('active');
        }
      } else {
        ul.append(li);
        li.addEventListener('click', chooseUser);
        if (ifOpp) {
          const toggle = ifOpp.querySelector('.user-text') as HTMLElement;
          toggle.classList?.remove('active');
        }
      }
    }
  }
}

function clearOldMessages(box: HTMLElement): void {
  const removeOldMsgs = box.querySelectorAll('.message-container');
  removeOldMsgs.forEach((old) => {
    old.remove();
  });
}

function createFirstGreeting(box: HTMLElement): void {
  createElement(
    'div',
    ['dialog-first'],
    'Write first to start your unforgettable communication...',
    box
  );
}

function deleteFirstGreeting(): void {
  const delFirst = document.querySelector('.dialog-first');
  if (delFirst) delFirst.remove();
}

function drawDelivery(textObj: Message): string {
  let result: string;
  if (textObj.status.isReaded) {
    result = `read`;
  } else if (textObj.status.isDelivered) {
    result = `delivered`;
  } else result = `sent`;
  return result;
}

function drawMessageFooter(footer: HTMLElement, textObj: Message): void {
  createElement('label', ['message-edit'], `${textObj.status.isEdited ? `edited` : ''}`, footer);
  createElement('label', ['message-read'], `${drawDelivery(textObj)}`, footer);
}

function drawMessages(payload: { messages: Message[] }): void {
  if (sessionStorage.sergioCurrentUser) {
    CURRENT_USER = JSON.parse(sessionStorage.sergioCurrentUser);
  }
  const box = document.querySelector('.dialog-box') as HTMLElement;
  clearOldMessages(box);
  if (payload.messages.length === 0) {
    deleteFirstGreeting();
    createFirstGreeting(box);
  } else {
    deleteFirstGreeting();
    payload.messages.forEach((textObj, index) => {
      const messageDiv = createElement(
        'div',
        ['message-container', `${textObj.from === CURRENT_USER ? `current` : `opponent`}`],
        '',
        box
      );
      messageDiv.setAttribute('data-messageid', textObj.id);
      const messageInDiv = createElement('div', ['message'], '', messageDiv);
      const messageHeader = createElement('div', ['message-header'], '', messageInDiv);
      createElement(
        'label',
        [],
        `${textObj.from === CURRENT_USER ? `${CURRENT_USER} (You)` : `${textObj.from}`}`,
        messageHeader
      );
      createElement('label', [], `${getMessageDate(new Date(textObj.datetime))}`, messageHeader);
      createElement('div', ['message-text'], `${textObj.text}`, messageInDiv);
      const messageFooter = createElement('div', ['message-footer'], '', messageInDiv);
      drawMessageFooter(messageFooter, textObj);
      if (index === payload.messages.length - 1 && sessionStorage.inputSended) {
        messageDiv.scrollIntoView();
        delete sessionStorage.inputSended;
      }
    });
  }
}

function messageDeliver(payload: { message: MessageDeliver }): void {
  const messagesArr = document.querySelectorAll('.message-container');
  if (messagesArr) {
    messagesArr.forEach((m) => {
      const v = m as HTMLElement;
      if (v.dataset.messageid === payload.message.id) {
        const status = v.querySelector('.message-read') as HTMLElement;
        status.textContent = 'delivered';
      }
    });
  }
}

function chooseUser(e: Event): void {
  if (e) {
    const currentUser = (e.target as HTMLElement).closest('.user-list-item') as HTMLElement;
    const currentUserStatus = currentUser.querySelector('.active');
    const currentUserLogin = currentUser.querySelector('.user-login') as HTMLElement;

    const dialogHeader = document.querySelector('.dialog-header') as HTMLElement;
    const dialogUser = dialogHeader.querySelector('label') as HTMLElement;

    const dialogUserStatus = dialogHeader.querySelector('.user-text') as HTMLElement;

    console.log(dialogUserStatus);
    if (!currentUserStatus) {
      dialogUserStatus.classList?.remove('active');
      dialogUserStatus.textContent = 'Offline';
    } else {
      dialogUserStatus.classList.add('active');
      dialogUserStatus.textContent = 'Online';
    }
    dialogUser.textContent = currentUserLogin.textContent;
    dialogHeader.setAttribute('data-opp', currentUserLogin.textContent as string);

    const dialogInput = document.querySelector('.dialog-input-field') as HTMLInputElement;
    const dialogButton = document.querySelector('.dialog-button') as HTMLButtonElement;
    dialogInput.disabled = false;
    dialogButton.disabled = false;
    if (dialogUser.textContent) fetchMessages(dialogUser.textContent);
  }
}

export function fetchMessages(userToFetch: string): void {
  const fetchID = generateID();
  const fetchMessage = {
    id: fetchID,
    type: ServerStatus.MSG_FROM_USER,
    payload: {
      user: {
        login: userToFetch,
      },
    },
  };
  console.log(fetchMessage);
  ws.send(JSON.stringify(fetchMessage));
}
