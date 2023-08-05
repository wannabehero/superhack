import { ethers } from 'ethers';
import { Address } from 'viem';
import { useMemo } from 'react';
import Safe, { EthersAdapter, SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit';
import { useEthersSigner } from './ethersViem';

const BASE_URLS: Record<number, string> = {
  10: 'https://safe-transaction-optimism.safe.global/api',
  8453: 'https://safe-transaction-base.safe.global/api',
  84531: 'https://safe-transaction-base-testnet.safe.global/api',
};

interface SafesByOwnerResponse {
  safes: string[];
}

export async function listSafes(chainId: number, owner: Address): Promise<string[]> {
  if (chainId in BASE_URLS === false) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  const data: SafesByOwnerResponse = await fetch(
    `${BASE_URLS[chainId]}/v1/owners/${owner}/safes/`,
  ).then((res) => res.json());
  return data.safes;
}

export const useEthersAdapter = ({ chainId }: { chainId?: number } = {}) => {
  const signer = useEthersSigner({ chainId });

  return useMemo(
    () => (signer ? new EthersAdapter({ ethers, signerOrProvider: signer }) : undefined),
    [signer],
  );
};

export async function deployNewSafe({
  config,
  ethAdapter,
}: {
  config: SafeAccountConfig;
  ethAdapter: EthersAdapter;
}): Promise<Safe> {
  const safeFactory = await SafeFactory.create({ ethAdapter });
  const safeSdk = await safeFactory.deploySafe({ safeAccountConfig: config });
  return safeSdk;
}
