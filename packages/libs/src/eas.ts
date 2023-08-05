import { EAS, SchemaEncoder, SchemaItem, SchemaItemWithSignature } from "@ethereum-attestation-service/eas-sdk";
import { SignerOrProvider } from "@ethereum-attestation-service/eas-sdk/dist/transaction";
import { ethers } from 'ethers';

export const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26

const key = "haha"
const provider = ethers.providers.getDefaultProvider(
    "sepolia"
);
const wallet = new ethers.Wallet(key, provider);

class EASClient {
    private eas: EAS

    constructor() {
        const eas = new EAS(EASContractAddress);
        // @ts-expect-error
        eas.connect(provider);
        this.eas = eas;
    }

    async createTempateAttestation(signer: SignerOrProvider, params: SchemaItem[]): Promise<string> {
        return await this.createAttestation(
            signer, 
            params,
            templateSchema
        );
    }

    async createTempateStatsAttestation(signer: ethers.Wallet, params: SchemaItem[]): Promise<string> {
        return await this.createOffchainAttestation(
            signer, 
            params,
            templateStatsSchema,
        );
    }

    async getTemplates() { 
        // TODO: graphql query to fetch template attestations by scheme
    }

    async getTemplateStats() { 
        // TODO: graphql query to fetch usage stats per template
    }

    private async createAttestation(signer: SignerOrProvider, params: SchemaItem[], schema: SchemaDefinition): Promise<string> {
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

    private async createOffchainAttestation(signer: ethers.Wallet, params: SchemaItem[], schema: SchemaDefinition): Promise<string> {
        const offchain = await this.eas.getOffchain();
        const encodedData = schema.encodeData(params);
        const offchainAttestation = await offchain.signOffchainAttestation(
            {
                recipient: '0xe98bA1B3801d105Ee7C8611E34D9048985b2EFA1',
                expirationTime: BigInt(0),
                time: BigInt(Date.now() / 1000),
                revocable: true,
                version: 1,
                nonce: BigInt(0),
                schema: schema.uid,
                refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
                data: encodedData,
            }, 
            // @ts-expect-error
            signer,
        );
        return offchainAttestation.uid;
    }
}

export const client = new EASClient(); 

class SchemaDefinition extends SchemaEncoder{
    constructor(readonly uid: string, schema: string) {
        super(schema)
        this.uid = uid
    }
}

// TODO: update with actual data
const templateSchema = new SchemaDefinition(
    "0xe3e791f637267181ffdb97384cac54376f479ae373fe3e709e8bc04e2f67b58a",
    "bytes[] blob, uint8 version",
);
const templateStatsSchema = new SchemaDefinition(
    "0xe3e791f637267181ffdb97384cac54376f479ae373fe3e709e8bc04e2f67b58a",
    "bytes[] blob, uint8 version",
);

client.createTempateStatsAttestation(wallet as any, [
    { name: "blob", value: ["0x12"], type: "bytes[]" },
    { name: "version", value: 13, type: "uint8" },
])