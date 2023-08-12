import { Address, fromHex, toHex } from 'viem';
import { File } from '@web-std/file';
import { Web3Storage } from 'web3.storage';

export class IPFSStorage {
  private client: Web3Storage;

  constructor(token: string) {
    this.client = new Web3Storage({ token });
  }

  private makeFile(contents: string, filename: string) {
    const blob = new Blob([contents], { type: 'application/json' });
    return new File([blob], filename);
  }

  async store(object: unknown): Promise<Address> {
    const cid = await this.client.put([this.makeFile(JSON.stringify(object), 'metadata.json')]);
    return toHex(cid);
  }

  async retrieve(cidHex: Address) {
    const cid = fromHex(cidHex, 'string');
    const res = await this.client.get(cid);

    if (!res || !res.ok) {
      throw new Error(`failed to get ${cid}`);
    }

    // unpack File objects from the response
    const files = await res.files();
    return JSON.parse(Buffer.from(await files[0].arrayBuffer()).toString('utf-8'));
  }
}
