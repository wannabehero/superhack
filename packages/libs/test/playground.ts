import { providers, ethers } from 'ethers';
import { client } from '../src/eas/index';
import { GetAttestations } from '../src/eas/gql';
import { Constant } from '../src/constant/index';
import { simulateTx } from '../src/tenderly/index';

const provider = new providers.JsonRpcProvider(Constant.easProviderUri);

(async () => {
  // const key = TestConstant.privateKey;
  // const wallet = new ethers.Wallet(key, provider);

  // const uid = await client.createTempateStatsAttestation(wallet, [
  //   { name: 'blob', value: ['0x21', '0x30'], type: 'bytes[]' },
  //   { name: 'version', value: 100, type: 'uint8' },
  // ]);
  // console.log(uid);

  // const data = await GetAttestations(
  //   '0x4c365ddb28653faab690386a4930cb3a5d4a7759634f80977db900db53c95857',
  // );
  // console.log(data);

  const contractABI = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "num",
          "type": "uint256"
        }
      ],
      "name": "store",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "retrieve",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]

  const tx = await simulateTx({
    contract: {
      abi: contractABI,
      contractAddress: "0xf35101b37928bb044ff5339bc6ff816b68bd5c43",
      provider: provider,
      funcName: "store",
      args: [123],
    },
    type: 'quick',
    sender: '0xe98bA1B3801d105Ee7C8611E34D9048985b2EFA1',
    network_id: '1',
    value: 0,
  });
  console.log(tx);
})();
