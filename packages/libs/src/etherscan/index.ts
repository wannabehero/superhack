import { ABI, GetSourceCodeResponse } from './types';

const BASE_URL: Record<number, string> = {
  1: 'https://api.etherscan.io/api',
  10: 'https://api-optimistic.etherscan.io/api',
  137: 'https://api.polygonscan.com/api',
  8453: 'https://api.basescan.org/api',
  84531: 'https://api-goerli.basescan.org/api',
  11155111: 'https://api-sepolia.etherscan.io/api',
};

export class Etherscan {
  private apiKeys: Record<number, string>;

  constructor(apiKeys: Record<number, string>) {
    this.apiKeys = apiKeys;
  }

  async getContractABI({ address, chainId }: { address: string; chainId: number }): Promise<ABI> {
    if (chainId in BASE_URL === false) {
      throw new Error(`Unsupported chainId: ${chainId}`);
    }

    const query = new URLSearchParams({
      address,
      module: 'contract',
      action: 'getsourcecode',
      apikey: this.apiKeys[chainId],
    });

    const url = `${BASE_URL[chainId]}?${query.toString()}`;

    const response: GetSourceCodeResponse = await fetch(url).then((res) => res.json());
    if (response.result.length === 0) {
      throw new Error(`No contract found at address: ${address}`);
    }

    const contract = response.result[0];
    if (contract.ABI === 'Contract source code not verified') {
      throw new Error(`Contract source code not verified: ${address}`);
    }

    if (contract.Proxy === '1' && !!contract.Implementation) {
      return this.getContractABI({ address: contract.Implementation, chainId });
    }

    return JSON.parse(contract.ABI);
  }
}

export * from './types';
