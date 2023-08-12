import { ABIItem } from '../etherscan';
import { Address } from 'viem';

// FIXME: inputs should be better typed
export type Inputs = Record<string, string>;
export type Action = { contract: Address; func: ABIItem; inputs: Inputs };
export type Shortcut = {
  easId?: string;
  name: string;
  chainId: number;
  actions: Action[];
  inputs: Inputs;
  rating?: number;
};
