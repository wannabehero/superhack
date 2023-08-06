import { providers, ethers } from 'ethers';
import { client } from '../src/eas/index';
import { GetAttestations } from '../src/eas/gql';
import { Constant, TestConstant } from '../src/constant/index';

const provider = new providers.JsonRpcProvider(Constant.easProviderUri);

(async () => {
    const key = TestConstant.privateKey;
    const wallet = new ethers.Wallet(key, provider);
  
    const uid = await client.createTempateStatsAttestation(wallet, [
      { name: 'blob', value: ['0x21', '0x30'], type: 'bytes[]' },
      { name: 'version', value: 100, type: 'uint8' },
    ]);
    console.log(uid);
  
    const data = await GetAttestations(
      '0x4c365ddb28653faab690386a4930cb3a5d4a7759634f80977db900db53c95857',
    );
    console.log(data);
  })();
  