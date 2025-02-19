import { createElement, generateID, getMessageDate } from './functions';
import { ServerStatus, UserIsLogined, Message, MessageDeliver, MessageRead } from './types';

const URLstr: string = 'ws://127.0.0.1:4000/';
export const ws = new WebSocket(URLstr);
let CURRENT_USER: string;
let aside: string = '';

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
    ws.send(JSON.stringify(usersActive));
    ws.send(JSON.stringify(usersInActive));
  }
}

function errorHandler(payload: { error: string }): void {
  if (
    sessionStorage.sergioLoginState &&
    (payload.error === 'a user with this login is already authorized' ||
      payload.error === 'incorrect password')
  ) {
    const modal = createElement('div', ['modal', 'visible'], '');
    const resultCreate = createElement('div', ['result'], '', modal);
    const greetCreate = createElement('h3', ['greeting'], ` Error: ${payload.error}!`);
    resultCreate.appendChild(greetCreate);
    document.body.appendChild(modal);
    window.addEventListener('click', () => {
      modal.classList?.remove('visible');
      modal.remove();
      delete sessionStorage.sergioLoginState;
    });
  }
}

function removeDeletedMessage(payload: {
  message: {
    id: string;
    status: {
      isDeleted: boolean;
    };
  };
}): void {
  const delArray = document.querySelectorAll('.message-container');
  delArray.forEach((msg) => {
    if (msg instanceof HTMLElement) {
      if (msg.dataset.messageid === payload.message.id) {
        msg.remove();
      }
    }
  });
}

function editMessage(payload: {
  message: {
    id: string;
    text: string;
    status: {
      isEdited: boolean;
    };
  };
}): void {
  const delArray = document.querySelectorAll('.message-container');
  delArray.forEach((msg) => {
    if (msg instanceof HTMLElement) {
      if (msg.dataset.messageid === payload.message.id) {
        const text = msg.querySelector('.message-text') as HTMLElement;
        text.textContent = payload.message.text;
        const labelToChange = msg.querySelector('.message-edit') as HTMLElement;
        labelToChange.textContent = 'edited';
      }
    }
  });
}

function loginHandler(): void {
  const user = {
    login: JSON.parse(sessionStorage.sergioCurrentUser),
    password: JSON.parse(sessionStorage.sergioPassword),
  };
  sessionStorage.setItem('sergioUser', JSON.stringify(user));
  window.location.hash = '#main';
}

function wsMessageHadler(): void {
  ws.onmessage = (event): void => {
    const gdata = JSON.parse(event.data);
    const { payload, type } = gdata;
    if (type === ServerStatus.USER_LOGIN) loginHandler();
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
      checkForReadMessages(payload, sessionStorage.sergioAside);
    }
    if (type === ServerStatus.MSG_SEND) {
      appendMessage(payload);
    }
    if (type === ServerStatus.MSG_DELIVER) {
      messageDeliver(payload);
    }
    if (type === ServerStatus.MSG_READ) messageRead(payload);
    if (type === ServerStatus.MSG_DELETE) removeDeletedMessage(payload);
    if (type === ServerStatus.MSG_EDIT) {
      editMessage(payload);
    }
    if (type === ServerStatus.ERROR) {
      errorHandler(payload);
    }
  };
}

window.onload = (): void => {
  connect();
};

function connect(): void {
  ws.onopen = (): void => {
    autoLogin();
  };
  wsMessageHadler();
  ws.onerror = (error): void => {
    if (error instanceof Error) {
      console.warn(error);
    }
  };
  ws.onclose = (): void => {
    setInterval(() => {
      connect();
      autoLogin();
    }, 3000);
  };
}

function createFirstUserChoose(box: HTMLElement): void {
  createElement(
    'div',
    ['dialog-first'],
    'Choose your friend to start your unforgettable communication...',
    box
  );
}

export function retrieveActiveUsers(payload: { users: UserIsLogined[] }): void {
  if (sessionStorage.sergioUser && window.location.hash === '#main') {
    if (payload?.users) {
      const userlist = payload.users;
      const user = JSON.parse(sessionStorage.sergioUser);
      const filterUserlist = userlist.filter((someUser) => someUser.login !== user.login);
      const ul = document.querySelector('.user-list') as HTMLElement;
      const box = document.querySelector('.dialog-box') as HTMLElement;
      clearOldMessages(box);
      deleteFirstGreeting();
      createFirstUserChoose(box);

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
        aside = flUser.login;
        fetchMessages(aside);
      });
    }
  }
}

export function appendExternalUsers(payload: { user: UserIsLogined }): void {
  if (sessionStorage.sergioUser) {
    if (payload?.user) {
      const userItem = payload.user;
      const ul = document.querySelector('.user-list') as HTMLElement;
      const oldUserAppend = ul.querySelector(`li[data-login=${userItem.login}]`) as HTMLElement;
      oldUserAppend?.remove();
      const ifOpp = document.querySelector(`article[data-opp=${userItem.login}]`);

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
  clearHistoryLine();
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

function cancelEdit(editField: HTMLInputElement, button: HTMLElement): void {
  // gave those weird namings just to not violate ESlint rules - no params assign and redeclare vars
  const a = editField;
  const b = button;
  a.value = '';
  b.style.display = 'none';
}

function deletePrevMenu(): void {
  const prevMenu = document.querySelector('.context-menu');
  if (prevMenu) prevMenu.remove();
}

function deleteMessage(textObj: Message): void {
  const delMessage = {
    id: textObj.id,
    type: 'MSG_DELETE',
    payload: {
      message: {
        id: textObj.id,
      },
    },
  };
  ws.send(JSON.stringify(delMessage));
}

function editMessageSend(textObj: Message, input: HTMLInputElement): void {
  const editMsg = {
    id: textObj.id,
    type: 'MSG_EDIT',
    payload: {
      message: {
        id: textObj.id,
        text: input.value,
      },
    },
  };
  ws.send(JSON.stringify(editMsg));
}

function contextMenuHandler(textObj: Message, box: HTMLElement): void {
  deletePrevMenu();
  if (textObj.from === JSON.parse(sessionStorage.sergioCurrentUser)) {
    const contextMenu = createElement('ul', ['context-menu'], '', box);
    const editButton = createElement('li', ['context-menu-item', 'edit'], 'Edit', contextMenu);
    const deleteButton = createElement(
      'li',
      ['context-menu-item', 'delete'],
      'Delete',
      contextMenu
    );
    editButton.addEventListener('click', () => {
      const editFieldInput = document.querySelector('.dialog-input-field') as HTMLInputElement;
      const editField = document.querySelector('.dialog-input') as HTMLElement;
      const sendButton = document.querySelector('.dialog-button') as HTMLButtonElement;
      sendButton.style.display = 'none';
      const sendEditText = createElement('button', ['dialog-button'], 'Edit', editField);
      editFieldInput.value = textObj.text;
      const cancelButton = document.querySelector('.dialog-cancel') as HTMLElement;
      cancelButton.style.display = 'flex';
      cancelButton.addEventListener('click', () => {
        cancelEdit(editFieldInput, cancelButton);
        sendButton.style.display = 'block';
        sendEditText.style.display = 'none';
      });
      sendEditText.addEventListener('click', () => {
        editMessageSend(textObj, editFieldInput);
        cancelEdit(editFieldInput, cancelButton);
        sendButton.style.display = 'block';
        sendEditText.remove();
      });
      contextMenu.remove();
    });
    deleteButton.addEventListener('click', () => {
      deleteMessage(textObj);
      contextMenu.remove();
    });
  }
}

function drawMessageFooter(footer: HTMLElement, textObj: Message, currentU: string): void {
  createElement('label', ['message-edit'], `${textObj.status.isEdited ? `edited` : ''}`, footer);
  if (textObj.from === currentU) {
    createElement('label', ['message-read'], `${drawDelivery(textObj)}`, footer);
  } else createElement('label', ['message-read'], ``, footer);
}

function checkForReadMessages(payload: { messages: Message[] }, userToDraw: string): void {
  let sumOfMessages: number = 0;
  const user = document.querySelector(`li[data-login=${userToDraw}`) as HTMLElement;
  const duplicateIndicator = user.querySelector('.user-messages');
  if (duplicateIndicator) duplicateIndicator.remove();
  payload.messages.forEach((value) => {
    if (value.from !== CURRENT_USER) {
      if (!value.status.isReaded) sumOfMessages += 1;
    }
  });
  if (sumOfMessages !== 0) {
    const liRead = createElement('label', ['user-messages'], `${sumOfMessages}`);
    user.append(liRead);
  }
  sumOfMessages = 0;
}

function drawBody(textObj: Message, messageDiv: HTMLElement): void {
  messageDiv.setAttribute('data-messageid', textObj.id);
  messageDiv.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    contextMenuHandler(textObj, messageDiv);
  });
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
  drawMessageFooter(messageFooter, textObj, CURRENT_USER);
}

function clearHistoryLine(): void {
  const prevLine = document.querySelector('.history-line');
  if (prevLine) prevLine.remove();
}

function readMessages(): void {
  const prevLine = document.querySelector('.history-line');
  if (prevLine) {
    clearHistoryLine();
    const array = document.querySelectorAll('.message-container.opponent');
    array.forEach((msg) => {
      const readID = (msg as HTMLElement).dataset.messageid as string;
      const readMsg = {
        id: readID,
        type: 'MSG_READ',
        payload: {
          message: {
            id: readID,
          },
        },
      };
      ws.send(JSON.stringify(readMsg));
    });
  }
}

export function drawMessages(payload: { messages: Message[] }): void {
  if (sessionStorage.sergioCurrentUser) {
    CURRENT_USER = JSON.parse(sessionStorage.sergioCurrentUser);
  }
  if (sessionStorage.sergioOpponent) {
    const box = document.querySelector('.dialog-box') as HTMLElement;
    clearOldMessages(box);
    if (payload.messages.length === 0) {
      deleteFirstGreeting();
      createFirstGreeting(box);
    } else {
      deleteFirstGreeting();
      let unreadFlag: boolean = false;
      let changeFlag: boolean = false;
      const dialFirst = document.querySelector('.dialog-first');
      payload.messages.forEach((textObj, index) => {
        if (!unreadFlag && !changeFlag && !dialFirst) {
          if (!textObj.status.isReaded) unreadFlag = true;
        }
        if (unreadFlag && !changeFlag && !dialFirst) {
          clearHistoryLine();
          const line = createElement('div', ['history-line'], '', box);
          createElement('label', ['history-line-text'], 'Unread messages', line);
          changeFlag = true;
        }
        const side = textObj.from === CURRENT_USER ? `current` : `opponent`;
        const messageDiv = createElement('div', ['message-container', `${side}`], '', box);
        drawBody(textObj, messageDiv);

        if (index === payload.messages.length - 1 && sessionStorage.inputSended) {
          messageDiv.scrollIntoView();
          delete sessionStorage.inputSended;
        }
      });
      box.addEventListener('scroll', readMessages);
      box.addEventListener('click', readMessages);
    }
  }
}

export function appendMessage(payload: { message: Message }): void {
  if (sessionStorage.sergioCurrentUser) {
    CURRENT_USER = JSON.parse(sessionStorage.sergioCurrentUser);
  }
  const opponent = document.querySelector('.opponent-login');
  if (payload.message.from === opponent?.textContent) {
    const box = document.querySelector('.dialog-box') as HTMLElement;
    const messageDiv = createElement(
      'div',
      ['message-container', `${payload.message.from === CURRENT_USER ? `current` : `opponent`}`],
      '',
      box
    );
    messageDiv.setAttribute('data-messageid', payload.message.id);
    const messageInDiv = createElement('div', ['message'], '', messageDiv);
    const messageHeader = createElement('div', ['message-header'], '', messageInDiv);
    createElement(
      'label',
      [],
      `${payload.message.from === CURRENT_USER ? `${CURRENT_USER} (You)` : `${payload.message.from}`}`,
      messageHeader
    );
    createElement(
      'label',
      [],
      `${getMessageDate(new Date(payload.message.datetime))}`,
      messageHeader
    );
    createElement('div', ['message-text'], `${payload.message.text}`, messageInDiv);
    const messageFooter = createElement('div', ['message-footer'], '', messageInDiv);
    drawMessageFooter(messageFooter, payload.message, CURRENT_USER);

    messageDiv.scrollIntoView();
    delete sessionStorage.inputSended;
  }
}

export function messageDeliver(payload: { message: MessageDeliver }): void {
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
export function messageRead(payload: { message: MessageRead }): void {
  const messagesArr = document.querySelectorAll('.message-container');
  if (messagesArr) {
    messagesArr.forEach((m) => {
      const v = m as HTMLElement;
      if (v.dataset.messageid === payload.message.id) {
        const status = v.querySelector('.message-read') as HTMLElement;
        status.textContent = 'read';
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
    if (!currentUserStatus) {
      dialogUserStatus.classList?.remove('active');
      dialogUserStatus.textContent = 'Offline';
    } else {
      dialogUserStatus.classList.add('active');
      dialogUserStatus.textContent = 'Online';
    }
    dialogUser.textContent = currentUserLogin.textContent;
    if (sessionStorage.sergioOpponent) delete sessionStorage.sergioOpponent;
    sessionStorage.setItem('sergioOpponent', JSON.stringify(dialogUser.textContent));
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
  sessionStorage.setItem('sergioAside', JSON.stringify(userToFetch));
  ws.send(JSON.stringify(fetchMessage));
}

// function disablecontext() {
//   return false;
// }
// function disableRMB() {
//   const box = document.querySelector('.dialog-box') as HTMLElement;
//   box.oncontextmenu = disablecontext;
// }
// disableRMB();
