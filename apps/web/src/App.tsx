import { Container, VStack, useColorMode } from '@chakra-ui/react';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';

import { chains, wagmiConfig } from './web3/wallets';
import Header from './components/Header';
import Main from './screens/Main';

function App() {
  const { colorMode } = useColorMode();

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={colorMode === 'light' ? lightTheme() : darkTheme()}
        showRecentTransactions
      >
        <Container py="16px">
          <VStack align="stretch">
            <Header />
            <Main />
          </VStack>
        </Container>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
