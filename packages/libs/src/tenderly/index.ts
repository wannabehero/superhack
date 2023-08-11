import { ethers } from "ethers";
import { TenderlyParams } from "./types";

const TENDERLY_ACCESS_KEY = process.env.TENDERLY_ACCESS_KEY!
const apiURL = `https://api.tenderly.co/api/v1/account/yabalaban/project/superhack/simulate`

export async function simulateTx(p: TenderlyParams): Promise<any> {
  const contract = new ethers.Contract(p.contract.contractAddress, p.contract.abi, p.contract.provider);
  const unsignedTx = await contract.populateTransaction[p.contract.funcName](...p.contract.args);
  const body = JSON.stringify({
    save: true,
    "save_if_fails": true,
    type: p.type,
    "network_id": p.network_id,
    "from": p.sender,
    "to": contract.address,
    "input": unsignedTx.data,
    "gas": 100000,
    "gas_price": "0",
    "value": p.value,
  });
  const headers = {
    'content-type': 'application/JSON',
    'X-Access-Key': TENDERLY_ACCESS_KEY as string,
  }
  const resp = await fetch(apiURL, {
    method: 'POST',
    body: body,
    headers: headers,
  });

  return await resp.json();
}

export * from './types';