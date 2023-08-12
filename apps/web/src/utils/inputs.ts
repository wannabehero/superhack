import { isAddress } from 'viem';

export function validateInput(type: string, value: string | undefined): boolean {
  if (value === undefined) {
    return false;
  }

  if (value.match(/^\{\w+\}$/)) {
    return true;
  }

  switch (type) {
    case 'address':
      return isAddress(value);
    case type.startsWith('uint') ? type : '':
      try {
        return BigInt(value) >= 0;
      } catch {
        return false;
      }
    default:
      return true;
  }
}
