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
      return isAddress(value) || !!value.match(/^\w+\.eth$/);
    case type.startsWith('uint') ? type : '':
      try {
        return BigInt(value) >= 0;
      } catch {
        return !!value.match(/^\d+\.\d+$/);
      }
    default:
      return true;
  }
}
