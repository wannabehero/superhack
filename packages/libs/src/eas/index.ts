import { providers, ethers } from 'ethers';
import { Constant } from '../constant/index';
import { EAS, SchemaEncoder, SchemaItem } from '@ethereum-attestation-service/eas-sdk';

const provider = new providers.JsonRpcProvider(Constant.easProvider);

class EASClient {
  private eas: EAS;

  constructor() {
    const eas = new EAS(Constant.easContractAddress);
    eas.connect(provider);
    this.eas = eas;
  }

  async publish(signer: ethers.Signer, params: SchemaItem[]): Promise<string> {
    return await this.createAttestation(signer, params, templateSchema);
  }

  async upvote(signer: ethers.Signer, params: SchemaItem[]): Promise<string> {
    return await this.createAttestation(signer, params, templateUpvoteSchema);
  }

  private async createAttestation(
    signer: ethers.Signer,
    params: SchemaItem[],
    schema: SchemaDefinition,
  ): Promise<string> {
    this.eas.connect(signer);
    const encodedData = schema.encodeData(params);
    const tx = await this.eas.attest({
      schema: schema.uid,
      data: {
        recipient: '0x0000000000000000000000000000000000000000',
        expirationTime: BigInt(0),
        revocable: false,
        data: encodedData,
      },
    });
    return await tx.wait(2);
  }
}

export const client = new EASClient();

class SchemaDefinition extends SchemaEncoder {
  constructor(
    readonly uid: string,
    schema: string,
  ) {
    super(schema);
    this.uid = uid;
  }
}

export const templateSchema = new SchemaDefinition(
  '0x3241293e9d8ffba33b19091ee6235b62949848348ec423856cbb59a93ef8a438',
  'string name, uint32 chain_id, string ipfs_id',
);
export const templateUpvoteSchema = new SchemaDefinition(
  '0x6407330affce7ce561a90b2bd380911c1e64becd8fa3ebeccd84aaee01fc292a',
  'string template_id',
);

export * from './types';
