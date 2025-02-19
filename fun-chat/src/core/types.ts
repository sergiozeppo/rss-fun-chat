export enum ServerStatus {
  USER_LOGIN = 'USER_LOGIN',
  ERROR = 'ERROR',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_EXTERNAL_LOGIN = 'USER_EXTERNAL_LOGIN',
  USER_EXTERNAL_LOGOUT = 'USER_EXTERNAL_LOGOUT',
  USER_ACTIVE = 'USER_ACTIVE',
  USER_INACTIVE = 'USER_INACTIVE',
  MSG_SEND = 'MSG_SEND',
  MSG_DELIVER = 'MSG_DELIVER',
  MSG_READ = 'MSG_READ',
  MSG_DELETE = 'MSG_DELETE',
  MSG_EDIT = 'MSG_EDIT',
  MSG_FROM_USER = 'MSG_FROM_USER',
}

export type User = {
  login: string;
  password: string;
};

export type UserIsLogined = {
  login: string;
  isLogined: boolean;
};

export type UserLogin = {
  id: string;
  type: ServerStatus.USER_LOGIN;
  payload: {
    user: User;
  };
};

export type UserLogout = {
  id: string;
  type: ServerStatus.USER_LOGOUT;
  payload: {
    user: User;
  };
};

export type UserExtLogin = {
  id: null;
  type: ServerStatus.USER_EXTERNAL_LOGIN;
  payload: {
    user: UserIsLogined;
  };
};

export type UserExtLogout = {
  id: null;
  type: ServerStatus.USER_EXTERNAL_LOGOUT;
  payload: {
    user: UserIsLogined;
  };
};

export type UserActive = {
  id: string;
  type: ServerStatus.USER_ACTIVE;
  payload: {
    users: UserIsLogined[];
  } | null;
};

export type UserInactive = {
  id: string;
  type: ServerStatus.USER_INACTIVE;
  payload: {
    users: UserIsLogined[];
  } | null;
};

export type Message = {
  id: string;
  from: string;
  to: string;
  text: string;
  datetime: number;
  status: {
    isDelivered: boolean;
    isReaded: boolean;
    isEdited: boolean;
  };
};

export type MessageDeliver = {
  id: string;
  status: {
    isDelivered: boolean;
  };
};

export type MessageRead = {
  id: string;
  type: 'MSG_READ';
  payload: {
    message: {
      id: string;
      status: {
        isReaded: boolean;
      };
    };
  };
};
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
