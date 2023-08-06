import { Address } from 'viem';
import { RelayBalanceResponse } from './types';

export async function getRelayBalance(account: Address): Promise<RelayBalanceResponse> {
  const response = await fetch(
    `https://api.gelato.digital/1balance/networks/mainnets/sponsors/${account}`,
  ).then((res) => res.json());
  return response as RelayBalanceResponse;
}
