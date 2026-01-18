
import { CardData, CardStatus } from '../types';

export const luhnCheck = (num: string): boolean => {
  let arr = (num + '')
    .split('')
    .reverse()
    .map((x) => parseInt(x));
  let lastDigit = arr.splice(0, 1)[0];
  let sum = arr.reduce((acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9 || (val * 2 === 9 ? 9 : 0))), 0);
  sum += lastDigit;
  return sum % 10 === 0;
};

export const generateCard = (bin: string, length: number = 16): string => {
  let cc = bin.replace(/[^0-9x]/gi, '');
  
  // Replace 'x' or 'X' with random digits
  while (cc.length < length - 1) {
    cc += Math.floor(Math.random() * 10).toString();
  }

  // Handle 'x' in BIN
  let result = '';
  for(let char of cc) {
    if (char.toLowerCase() === 'x') {
      result += Math.floor(Math.random() * 10).toString();
    } else {
      result += char;
    }
  }

  // Calculate check digit
  for (let i = 0; i <= 9; i++) {
    if (luhnCheck(result + i)) {
      return result + i;
    }
  }
  return result + '0';
};

export const getCardType = (number: string): string => {
  const re = {
    electron: /^(4026|417500|4405|4508|4844|4913|4917)\d+$/,
    maestro: /^(5018|5020|5038|5612|5893|6304|6759|6761|6762|6763|0604|6390)\d+$/,
    dankort: /^(5019)\d+$/,
    interpayment: /^(636)\d+$/,
    unionpay: /^(62|88)\d+$/,
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/,
    amex: /^3[47][0-9]{13}$/,
    diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
    discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    jcb: /^(?:2131|1800|35\d{3})\d{11}$/
  };

  for (const [key, val] of Object.entries(re)) {
    if (val.test(number)) return key.toUpperCase();
  }
  return 'UNKNOWN';
};

export const parsePipeFormat = (line: string): CardData | null => {
  const parts = line.split('|').map(p => p.trim());
  if (parts.length < 4) return null;
  return {
    number: parts[0],
    month: parts[1],
    year: parts[2],
    cvv: parts[3],
    type: getCardType(parts[0])
  };
};

export const formatToPipe = (card: CardData): string => {
  return `${card.number}|${card.month}|${card.year}|${card.cvv}`;
};
