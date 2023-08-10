import { providers, ethers } from 'ethers';
import { Constant } from '../constant/index';
import {
  EAS,
  SchemaEncoder,
  SchemaItem,
} from '@ethereum-attestation-service/eas-sdk';
import { Template, TemplateUpvote } from './types';

export const EASContractAddress = '0xC2679fBD37d54388Ce493F1DB75320D236e1815e'; // Sepolia v0.26
const provider = new providers.JsonRpcProvider(Constant.easProviderUri);

class EASClient {
  private eas: EAS;

  constructor() {
    const eas = new EAS(EASContractAddress);
    eas.connect(provider);
    this.eas = eas;
  }

  async publish(signer: ethers.Signer, template: Template): Promise<string> {
    return await this.createAttestation(signer, template.items(), templateSchema);
  }

  async upvote(signer: ethers.Signer, templateUpvote: TemplateUpvote): Promise<string> {
    return await this.createAttestation(signer, templateUpvote.items(), templateUpvoteSchema);
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
        recipient: '0x9799c803E4D9e278603872922A24846FbB9B924D',
        expirationTime: BigInt(0),
        revocable: false,
        data: encodedData,
      }
    }, {
      gasLimit: 1000000000,
    }
    );
    return await tx.wait();
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

const templateSchema = new SchemaDefinition(
  '0x3241293e9d8ffba33b19091ee6235b62949848348ec423856cbb59a93ef8a438',
  'string name, uint32 chain_id, string ipfs_id',
);
const templateUpvoteSchema = new SchemaDefinition(
  '0x6407330affce7ce561a90b2bd380911c1e64becd8fa3ebeccd84aaee01fc292a',
  'string template_id',
);
