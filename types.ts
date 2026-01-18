
export interface CardData {
  number: string;
  month: string;
  year: string;
  cvv: string;
  type: string;
}

export enum CardStatus {
  LIVE = 'LIVE',
  DIE = 'DIE',
  UNKNOWN = 'UNKNOWN',
  INVALID = 'INVALID'
}

export interface CheckedCard extends CardData {
  status: CardStatus;
  message: string;
  bank?: string;
  country?: string;
}

export interface Identity {
  firstName: string;
  lastName: string;
  gender: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  birthday: string;
  ssn: string;
}
