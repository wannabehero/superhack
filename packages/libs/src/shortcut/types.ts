import { ABIItem } from '../etherscan';
import { Address } from 'viem';

// FIXME: inputs should be better typed
export type Inputs = Record<string, string>;
export type Action = { contract: Address; func: ABIItem; inputs: Inputs };
export type ShortcutInfo = {
  easId: string;
  name: string;
  chainId: number;
  rating: number;
  ipfsId: Address;
};

export type Shortcut = Pick<ShortcutInfo, 'name' | 'chainId'> & {
  easId?: string;
  actions: Action[];
  inputs: Inputs;
  rating?: number;
};
