import { providers, ethers } from 'ethers';
import {
  EAS,
  SchemaEncoder,
  SchemaItem,
  compactOffchainAttestationPackage,
  CompactAttestationShareablePackageObject,
} from '@ethereum-attestation-service/eas-sdk';
import { GetAttestations } from './eas_gql';

export const EASContractAddress = '0xC2679fBD37d54388Ce493F1DB75320D236e1815e'; // Sepolia v0.26

const key = 'haha';
const offchainStorageUrl = 'https://sepolia.easscan.org/offchain/store';
const provider = new providers.JsonRpcProvider('https://sepolia.gateway.tenderly.co');
const wallet = new ethers.Wallet(key, provider);

class EASClient {
  private eas: EAS;

  constructor() {
    const eas = new EAS(EASContractAddress);
    eas.connect(wallet);
    this.eas = eas;
  }

  async createTempateAttestation(signer: ethers.Signer, params: SchemaItem[]): Promise<string> {
    return await this.createAttestation(signer, params, templateSchema);
  }

  async createTempateStatsAttestation(
    signer: ethers.Wallet,
    params: SchemaItem[],
  ): Promise<string> {
    return await this.createOffchainAttestation(signer, params, templateStatsSchema);
  }

  async getTemplates() {
    // TODO: graphql query to fetch template attestations by scheme
  }

  async getTemplateStats() {
    // TODO: graphql query to fetch usage stats per template
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
        recipient: '0xe98bA1B3801d105Ee7C8611E34D9048985b2EFA1',
        expirationTime: BigInt(0),
        revocable: false,
        data: encodedData,
      },
    });
    return await tx.wait();
  }

  private async createOffchainAttestation(
    signer: ethers.Wallet,
    params: SchemaItem[],
    schema: SchemaDefinition,
  ): Promise<string> {
    const offchain = await this.eas.getOffchain();
    const encodedData = schema.encodeData(params);
    const time = Math.floor(Date.now() / 1000);
    const offchainAttestation = await offchain.signOffchainAttestation(
      {
        recipient: '0xe98bA1B3801d105Ee7C8611E34D9048985b2EFA1',
        expirationTime: BigInt(0),
        time: time,
        revocable: false,
        version: 1,
        nonce: 0,
        schema: schema.uid,
        refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
        data: encodedData,
      },
      signer,
    );
    const pkg: CompactAttestationShareablePackageObject = compactOffchainAttestationPackage({
      sig: offchainAttestation,
      signer: signer.address,
    });
    const body = JSON.stringify({
      filename: `schema-378-attestation-${time}.eas.txt`,
      textJson: JSON.stringify(
        {
          sig: offchainAttestation,
          signer: signer.address,
        },
        (_, v) => (typeof v === 'bigint' ? v.toString() : v),
      ),
    });
    await fetch(offchainStorageUrl, {
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    return offchainAttestation.uid;
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

// TODO: update with actual data
const templateSchema = new SchemaDefinition(
  '0x4c365ddb28653faab690386a4930cb3a5d4a7759634f80977db900db53c95857',
  'bytes[] blob, uint8 version',
);
const templateStatsSchema = new SchemaDefinition(
  '0x4c365ddb28653faab690386a4930cb3a5d4a7759634f80977db900db53c95857',
  'bytes[] blob, uint8 version',
);

(async () => {
  // const uid = await client.createTempateStatsAttestation(wallet, [
  //   { name: 'blob', value: ['0x21', '0x30'], type: 'bytes[]' },
  //   { name: 'version', value: 100, type: 'uint8' },
  // ]);
  // console.log(uid);
  const data = GetAttestations(
    '0x4c365ddb28653faab690386a4930cb3a5d4a7759634f80977db900db53c95857',
  );
  console.log(data);
})();
