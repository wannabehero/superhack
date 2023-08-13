import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, mainnet } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { createPublicClient, http } from 'viem';
import { CHAINS } from './consts';

const WC_PROJECT_ID = import.meta.env.VITE_WC_PROJECT_ID;

export const { chains, publicClient } = configureChains(CHAINS, [publicProvider()]);

const { connectors } = getDefaultWallets({
  chains,
  appName: 'Shortcuts',
  projectId: WC_PROJECT_ID,
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export const ensClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});
