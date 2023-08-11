// POST /api/v2/project/{project_slug}/simulations

import { SignerOrProvider } from '@ethereum-attestation-service/eas-sdk/dist/transaction';

// source: https://docs-api.tenderly.co/simulator/simulation
export interface TenderlyParams {
  contract: {
    abi: any;
    contractAddress: string;
    provider: SignerOrProvider;
    funcName: string;
    args: any[];
  };
  type: 'full' | 'quick' | 'abi';
  sender: string;
  network_id: string;
  value: number;
}
