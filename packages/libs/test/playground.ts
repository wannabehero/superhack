import { Address, fromHex, toHex } from 'viem';
import { providers, ethers } from 'ethers';
import { client } from '../src/eas/index';
import { Constant, TestConstant } from '../src/constant/index';
import { simulateTx } from '../src/tenderly/index';
import { localShortcuts, publish, retrieve, upvote, upvoteCount } from '../src/shortcut';
import { ABIItem } from '../src/etherscan';

const provider = new providers.JsonRpcProvider(Constant.easProviderUri);

(async () => {
  const key = TestConstant.privateKey;
  const wallet = new ethers.Wallet(key, provider);

  const contractABI: ABIItem = {
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
  };

  // const shortcut = await publish(wallet, {
  //   name: 'test',
  //   chainId: 123,
  //   actions: [
  //     { contract: '0x1234', func: contractABI, inputs: {} }
  //   ]
  // });
  // console.log(shortcut);
  // console.log(await localShortcuts())

  // console.log(await upvoteCount({
  //   eas_id: '0x0a1419d62c96a4abb4eedd5db6e7dddc75287c8513f37db2d5e39f24fa75c913',
  //   name: 'test',
  //   chainId: 123,
  //   actions: [
  //     { contract: '0x1234', func: contractABI, inputs: {} }
  //   ]
  // }));

  console.log(await retrieve('0x0a1419d62c96a4abb4eedd5db6e7dddc75287c8513f37db2d5e39f24fa75c913'));

  // const uid = await client.createTempateStatsAttestation(wallet, [
  //   { name: 'blob', value: ['0x21', '0x30'], type: 'bytes[]' },
  //   { name: 'version', value: 100, type: 'uint8' },
  // ]);
  // console.log(uid);

  // const data = await GetAttestations(
  //   '0x4c365ddb28653faab690386a4930cb3a5d4a7759634f80977db900db53c95857',
  // );
  // console.log(data);

  // const id = await store(contractABI);
  // console.log(await retrieve(toHex('bafybeiajff5yrw46jf2ot7i5yvfzixzhw3w2bmfuvrjcwylceyzsjejd4a')));
// 
  // const tx = await simulateTx({
  //   contract: {
  //     abi: contractABI,
  //     contractAddress: "0xf35101b37928bb044ff5339bc6ff816b68bd5c43",
  //     provider: provider,
  //     funcName: "store",
  //     args: [123],
  //   },
  //   type: 'quick',
  //   sender: '0xe98bA1B3801d105Ee7C8611E34D9048985b2EFA1',
  //   network_id: '1',
  //   value: 0,
  // });
  // console.log(tx);
})();
