# Shortcuts

Shortcuts – The Public Good for onchain interactions.

Shortcuts allows users to combine onchain contract calls into a shortcut, which will be executed on the given chain with some constant, pre-set or variable parameters.

Examples include:
- using a bridge to send ETH to Base / Optimism
- calling a token swap contract (approve + swap)
- donate erc20 / eth
- using any investment strategy

## See it in action!

We've prepared some action for you to try

- [Donate us some ETH on Base](https://shortcuts.wtf/0x21ec6f3370cea37f77d8cb76e6a7232f0c448fd148f1425279a4fa9d69201aae?to=0xEbaA21B8fC22a88912938e971897F88f69493C47&amount=0.001)
- [Donate us some USDbC on Base](https://shortcuts.wtf/0x61ca42bed268c5add8533255a9fe129d2671e53e4b200b81fe586accad66d0f8?amount=1000000&to=0xEbaA21B8fC22a88912938e971897F88f69493C47)
- [Donate us some ETH on Optimism](https://shortcuts.wtf/0x876ff304a858cf79e292e7ba7a43eebcc8a88f77565db6c2500b88e15e75fc07?amount=0.001&to=0x78c7881eaa2dd9488dDB8321c78Fb373e6FAb265)
- [Donate us some OP on Optimism](https://shortcuts.wtf/0xa3d80dd1d54aec8caa19f9355aeda7fbb075f2d7cc05fdfea29b8a2c7f17a023?to=0x78c7881eaa2dd9488dDB8321c78Fb373e6FAb265&amount=1000000000000000000)

- [Bridge ETH to Base](https://shortcuts.wtf/0x57479e7e73317e7b38ccdbae2c201b381e5baddbdcbaacda584643a8543b740f)
- [Bridge ETH to Optimism](https://shortcuts.wtf/0x82c0521978c1a6c1dc699bf6846abb078558d4b1b6a91e477bbaa3f69dc1ae5f)

## Notes
The best experience is achieved when using the Safe as the shortcut is being run in a single transaction.

Users can also share shortcuts with pre-set values. Those links can be included on public pages (like bridge dApp or blog or github profile or twitter) to be quickly executed later via familiar interface.

- Each shortcut is published on EAS where it can later be inspected. Before executing a shortcut users can run a simulation (using Tenderly) to make sure that interaction is safe
- Users can make send upvotes (attestations) to recognize a specific shortcut onchain.
- Developers can build shortcuts for their existing dApps and publish them for the community to use.
- Generally the app works with any chain
- Shortcuts consist of list of actionsю Each action references a call of a specific contract with arbitrary parameters
- To run the shortcuts users can use connected EOA, owned safe, or use Shortcuts app via Safe app interface.
- Shortcuts support templating action values, ENS resolving
- There's no db used – only EAS + IPFS making Shortcuts basically the Public Good
- Created shortcuts can be shared to other users or used as a link to be used on a website. Linked shortcut can include some pre-set values

## Details

Contracts:
- foundry (+openzeppelin) to develop some demo contracts + [Donation contract](./packages/contracts/src/Donation.sol)
- deployed to Base/Optimism +testnets

Web:
- vite + react + @chakra-ui + react-router
- rainbowkit + wagmi + viem
- [safe sdk](./apps/web/src/web3/safe.ts)

Other:
- [eas-sdk](./packages/libs/src/eas/index.ts) to interact with EAS
- [web3.storage](./packages/libs/src/storage/ipfs/index.ts) for ipfs
- apollo to access [EAS GraphQL API](./packages/libs/src/eas/gql.ts)
- Tenderly for [simulation](./packages/libs/src/tenderly/index.ts)
- Etherscan APIs to [resolve ABIs](./packages/libs/src/etherscan/index.ts)

Further development will include:
- crosschain shortcuts and actions
- gasless execution

## Development

```sh
# setup env
cp .env.develop .env
# then configure all the values in .env

# install deps
yarn

# run dev
yarn dev
```

There are [constants](packages/libs/src/constant/index.ts) you can update to target either Sepolia or Optimism EAS.

## Superhack

The project has been created during the [Superhack](https://ethglobal.com/events/superhack)

[Showcase](https://ethglobal.com/showcase/shortcuts-bspkw)
