import { useToast } from '@chakra-ui/react';
import { useChainModal } from '@rainbow-me/rainbowkit';
import { useCallback } from 'react';
import { useChainId, useNetwork, useSwitchNetwork } from 'wagmi';

const useAssertNetwork = (desiredChainId?: number) => {
  const toast = useToast();
  const { switchNetwork } = useSwitchNetwork();
  const { openChainModal } = useChainModal();
  const currentChainId = useChainId();
  const { chains } = useNetwork();

  const assertNetwork = useCallback(() => {
    if (desiredChainId === undefined || currentChainId === desiredChainId) {
      return true;
    }

    const chain = chains.find((c) => c.id === desiredChainId)!;

    if (switchNetwork) {
      switchNetwork(desiredChainId);
      toast({
        title: `Network switched to ${chain.name}. Please proceed`,
        status: 'info',
      });
    } else if (openChainModal) {
      openChainModal();
      toast({
        title: `Please switch to ${chain.name}`,
        status: 'warning',
      });
    } else {
      toast({
        title: `Only available on ${chain.name}`,
        status: 'error',
      });
    }
    return false;
  }, [currentChainId, desiredChainId, openChainModal, switchNetwork, toast, chains]);

  return assertNetwork;
};

export default useAssertNetwork;
