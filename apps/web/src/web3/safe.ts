import { ethers } from 'ethers';
import { Address } from 'viem';
import { useMemo } from 'react';
import SafeApiKit from '@safe-global/api-kit';
import Safe, { EthersAdapter, SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit';
import { useEthersSigner } from './ethersViem';

const BASE_URLS: Record<number, string> = {
  10: 'https://safe-transaction-optimism.safe.global',
  8453: 'https://safe-transaction-base.safe.global',
  84531: 'https://safe-transaction-base-testnet.safe.global',
};

interface SafesByOwnerResponse {
  safes: string[];
}

export async function listSafes(chainId: number, owner: Address): Promise<Address[]> {
  if (chainId in BASE_URLS === false) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  const data: SafesByOwnerResponse = await fetch(
    `${BASE_URLS[chainId]}/api/v1/owners/${owner}/safes/`,
  ).then((res) => res.json());
  return data.safes as Address[];
}

export const useEthersAdapter = ({ chainId }: { chainId: number }) => {
  const signer = useEthersSigner({ chainId });

  return useMemo(
    () => (signer ? new EthersAdapter({ ethers, signerOrProvider: signer }) : undefined),
    [signer],
  );
};

export const useSafeService = ({ chainId }: { chainId: number }) => {
  const ethAdapter = useEthersAdapter({ chainId });

  return useMemo(
    () =>
      ethAdapter ? new SafeApiKit({ txServiceUrl: BASE_URLS[chainId], ethAdapter }) : undefined,
    [chainId, ethAdapter],
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
  return safeFactory.deploySafe({ safeAccountConfig: config });
}

export async function loadSafe({
  safeAddress,
  ethAdapter,
}: {
  safeAddress: Address;
  ethAdapter: EthersAdapter;
}): Promise<Safe> {
  return Safe.create({ ethAdapter, safeAddress });
}
