export interface GetSourceCodeResponse {
  status: string;
  message: string;
  result: {
    SourceCode: string;
    ABI: string;
    ContractName: string;
    CompilerVersion: string;
    OptimizationUsed: string;
    Runs: string;
    ConstructorArguments: string;
    EVMVersion: string;
    Library: string;
    LicenseType: string;
    Proxy: string;
    Implementation: string;
    SwarmSource: string;
  }[];
}

export interface ABIItem {
  inputs: {
    internalType: string;
    name: string;
    type: string;
    indexed?: boolean;
  }[];
  outputs: {
    internalType: string;
    name: string;
    type: string;
  }[];
  name?: string;
  anonymous?: boolean;
  type: 'function' | 'constructor' | 'event' | 'fallback' | 'error';
  stateMutability?: 'nonpayable' | 'payable' | 'view' | 'pure';
}

export type ABI = ABIItem[];
