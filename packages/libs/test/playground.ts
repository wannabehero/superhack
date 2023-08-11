import { providers, ethers } from 'ethers';
import { Constant, TestConstant } from '../src/constant/index';
import { localShortcuts, publish, retrieve, retrieveAll, simulate, upvote, upvoteCount } from '../src/shortcut';
import { ABIItem } from '../src/etherscan';

const provider = new providers.JsonRpcProvider(
  Constant.easProvider
);

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

  const shortcut = await publish(wallet, {
    name: 'test',
    chainId: 321,
    actions: [
      { contract: '0x123456', func: contractABI, inputs: {} }
    ]
  });
  console.log(shortcut);
  // console.log(await localShortcuts())

  // console.log(await upvoteCount({
  //   easId: '0xe1e9099a2cae72dd6aa84dc5213c0b29ad408e942b703ce6e1cbb8a2f7d78303',
  //   name: 'test',
  //   chainId: 123,
  //   actions: [
  //     { contract: '0x1234', func: contractABI, inputs: {} }
  //   ]
  // }));

  
  // const uid = await client.createTempateStatsAttestation(wallet, [
  //   { name: 'blob', value: ['0x21', '0x30'], type: 'bytes[]' },
  //   { name: 'version', value: 100, type: 'uint8' },
  // ]);
  // console.log(uid);

  // const data = await GetAttestations(
  //   '0x4c365ddb28653faab690386a4930cb3a5d4a7759634f80977db900db53c95857',
  // );
  // console.log(data);

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
  
  // const id = await store(contractABI);
  // console.log(await retrieve(toHex('bafybeiajff5yrw46jf2ot7i5yvfzixzhw3w2bmfuvrjcwylceyzsjejd4a')));

  // const shortcut = await retrieve('0xd9303087990f4c65a0d5fd569e87aa13d5c888a0e8c2754b2f6038357af975e4');
  // console.log(shortcut.actions[0]);
  // const res = await simulate(wallet, shortcut.actions[0], shortcut.chainId);
  // console.log(res);

  // const shortcuts = await retrieveAll();
  // console.log(shortcuts);
})();
