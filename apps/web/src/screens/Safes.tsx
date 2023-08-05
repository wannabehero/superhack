import { useAccount, useChainId } from 'wagmi';
import { HStack, VStack, Text, Spacer, IconButton, Button, useToast } from '@chakra-ui/react';

import useSafes from '../hooks/useSafes';
import { RepeatIcon } from '@chakra-ui/icons';
import { useCallback } from 'react';
import { deployNewSafe, useEthersAdapter } from '../web3/safe';

const Safes = () => {
  const toast = useToast();
  const chainId = useChainId();
  const { address } = useAccount();
  const { safes, fetchSafes } = useSafes({ chainId, owner: address });
  const ethAdapter = useEthersAdapter({ chainId });

  const onDeploy = useCallback(async () => {
    if (!ethAdapter || !address) {
      return;
    }
    try {
      const safe = await deployNewSafe({ ethAdapter, config: { owners: [address], threshold: 1 } });
      const safeAddress = await safe.getAddress();
      toast({
        title: 'Safe deployed',
        description: `Safe deployed at ${safeAddress}`,
        status: 'success',
      });
    } catch (e: any) {
      toast({
        title: 'Error deploying safe',
        description: e.message,
        status: 'error',
      });
    }
  }, [ethAdapter, address, toast]);

  return (
    <>
      <VStack align="stretch">
        <HStack pt="12px">
          <Text as="b" fontSize="xl">
            My Safes
          </Text>
          <Spacer />
          {address && (
            <IconButton
              aria-label="Reload safes"
              icon={<RepeatIcon />}
              variant="ghost"
              rounded="full"
              onClick={() => address && fetchSafes()}
            />
          )}
          <Button rounded="xl" colorScheme="green" onClick={() => onDeploy()}>
            Deploy new
          </Button>
        </HStack>
        <VStack>{!!safes && safes.map((safe) => <Text key={safe}>{safe}</Text>)}</VStack>
      </VStack>
    </>
  );
};

export default Safes;
