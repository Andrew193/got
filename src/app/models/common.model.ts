export interface IdEntity {
  id?: string;

  [key: string]: any;
}

export interface LastLogin {
  lastLogin: string;
}

export interface DepositDay {
  depositDay: number;
}

export interface GetConfig extends Partial<LastLogin>, Partial<DepositDay> {}
