import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
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
