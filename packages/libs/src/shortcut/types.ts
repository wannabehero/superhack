import { etherscan } from 'libs';
import { Address } from 'viem';

// FIXME: inputs should be better typed
export type Action = { contract: Address; func: etherscan.ABIItem; inputs: Record<string, string> };
export type Shortcut = { easId?: string, name: string; chainId: number; actions: Action[]; rating?: number };