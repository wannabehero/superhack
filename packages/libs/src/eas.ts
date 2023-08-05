import { EAS, SchemaEncoder, SchemaItem, SchemaItemWithSignature } from "@ethereum-attestation-service/eas-sdk";
import { SignerOrProvider } from "@ethereum-attestation-service/eas-sdk/dist/transaction";
import { ethers } from 'ethers';

export const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26

class EASClient {
    private eas: EAS

    constructor() {
        const eas = new EAS(EASContractAddress);
        const provider = ethers.providers.getDefaultProvider(
            "sepolia"
        );
        // @ts-expect-error
        eas.connect(provider);
        this.eas = eas;
    }

    async createTempateAttestation(signer: SignerOrProvider): Promise<string> {
        return await this.createAttestation(
            signer, 
            [
                { name: "eventId", value: 1, type: "uint256" },
                { name: "voteIndex", value: 1, type: "uint8" },
            ],
            templateSchema
        );
    }

    async createTempateStatsAttestation(signer: SignerOrProvider): Promise<string> {
        return await this.createAttestation(
            signer, 
            [
                { name: "eventId", value: 1, type: "uint256" },
                { name: "voteIndex", value: 1, type: "uint8" },
            ],
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
                recipient: "0xFD50b031E778fAb33DfD2Fc3Ca66a1EeF0652165",
                expirationTime: BigInt(0),
                revocable: true,
                data: encodedData,
            },
        });
        return await tx.wait();
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
    "0xb16fa048b0d597f5a821747eba64efa4762ee5143e9a80600d0005386edfc995",
    "uint256 eventId, uint8 voteIndex",
);
const templateStatsSchema = new SchemaDefinition(
    "0xb16fa048b0d597f5a821747eba64efa4762ee5143e9a80600d0005386edfc995",
    "uint256 eventId, uint8 voteIndex",
);