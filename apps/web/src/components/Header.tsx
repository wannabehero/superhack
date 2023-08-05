import { Button, Flex, Spacer, Text, useColorMode } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex align="center">
      <Text as="b" fontSize="xl">
        Shortcuts
      </Text>
      <Spacer />
      <Button onClick={toggleColorMode} variant="ghost" size="md" borderRadius="xl" mr={2}>
        {colorMode === 'light' ? '🌚' : '🌝'}
      </Button>
      <ConnectButton chainStatus="icon" />
    </Flex>
  );
};

export default Header;
