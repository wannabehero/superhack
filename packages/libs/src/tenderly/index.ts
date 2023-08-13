import { Signer, ethers } from 'ethers';
import { TenderlyParams } from './types';
import { Action, Shortcut } from '../shortcut/types';

const simulateURL = `https://api.tenderly.co/api/v1/account/yabalaban/project/superhack/simulate`;
const shareURL = `https://api.tenderly.co/api/v1/account/yabalaban/project/superhack/simulations`;

export class Tenderly {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async simulateTx(p: TenderlyParams): Promise<string> {
    const contract = new ethers.Contract(
      p.contract.contractAddress,
      p.contract.abi,
      p.contract.provider,
    );
    const unsignedTx = await contract.populateTransaction[p.contract.funcName](...p.contract.args);
    const body = JSON.stringify({
      save: true,
      save_if_fails: true,
      type: p.type,
      network_id: p.network_id,
      from: p.sender,
      to: contract.address,
      input: unsignedTx.data,
      gas: 100000000,
      gas_price: '0',
      value: p.value,
    });
    const headers = {
      'content-type': 'application/JSON',
      'X-Access-Key': this.apiKey,
    };
    const resp = await fetch(simulateURL, {
      method: 'POST',
      body: body,
      headers: headers,
    });

    const parsedResponse = await resp.json();
    const id = parsedResponse?.simulation?.id;

    // Make the simulation publicly accessible
    if (id) {
      await fetch(`${shareURL}/${id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': this.apiKey as string,
        },
      });
    }

    return `https://dashboard.tenderly.co/shared/simulation/${id}`;
  }

  async simulate(signer: Signer, shortcut: Shortcut): Promise<string[]> {
    // TODO: batch simulation
    return Promise.all(
      shortcut.actions.map((action) => this.simulateAction(signer, action, shortcut.chainId)),
    );
  }

  async simulateAction(signer: Signer, action: Action, chainId: number): Promise<string> {
    return this.simulateTx({
      contract: {
        abi: [action.func],
        contractAddress: action.contract,
        provider: signer,
        funcName: action.func.name!,
        args: action.func.inputs
          .map((input) => action.inputs[input.name])
          .map((value) => (value === '0x0' ? [] : value)),
      },
      type: 'full',
      sender: await signer.getAddress(),
      network_id: chainId.toString(),
      value: action.value ?? '0',
    });
  }
}

export * from './types';
