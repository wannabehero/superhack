import { Address, fromHex, toHex } from 'viem';
import { File } from '@web-std/file';
import { Web3Storage } from 'web3.storage';

const WEB3_STORAGE_TOKEN = process.env.WEB3_STORAGE_TOKEN as string;

const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });

function makeFile(contents: string, filename: string) {
  const blob = new Blob([contents], { type: 'application/json' });
  return new File([blob], filename);
}

export async function store(object: unknown): Promise<Address> {
  const cid = await client.put([makeFile(JSON.stringify(object), 'metadata.json')]);
  return toHex(cid);
}

export async function retrieve(cidHex: Address) {
  const cid = fromHex(cidHex, 'string');
  const res = await client.get(cid);
  console.log(`Got a response! [${res?.status}] ${res?.statusText}`);
  if (!res || !res.ok) {
    throw new Error(`failed to get ${cid}`);
  }

  // unpack File objects from the response
  const files = await res.files();
  return JSON.parse(Buffer.from(await files[0].arrayBuffer()).toString('utf-8'));
}
