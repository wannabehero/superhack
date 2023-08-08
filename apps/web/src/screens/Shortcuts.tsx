import {
  HStack,
  VStack,
  Text,
  Spacer,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import ShortcutBuilder from './ShortcutBuilder';
import { Shortcut } from '../types/shortcut';
import { useChainId, usePublicClient, useWalletClient } from 'wagmi';
import Safe from '@safe-global/protocol-kit';
import { loadSafe, useEthersAdapter, useSafeService } from '../web3/safe';
import { prepareTxData } from '../utils/actionTx';
import { MetaTransactionData, OperationType } from '@safe-global/safe-core-sdk-types';

import { eas } from 'libs';
import { toHex } from 'viem';

const Shortcuts = () => {
  const toast = useToast();
  const [isCreateShortcutModalOpen, setIsCreateShortcutModalOpen] = useState(false);

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useChainId();

  // TODO: useSelectedSafe or something
  const ethAdapter = useEthersAdapter({ chainId });
  const safeService = useSafeService({ chainId });

  const [selectedSafe, setSelectedSafe] = useState<Safe>();
  // FIXME: this is just for testing
  // useEffect(() => {
  //   if (!ethAdapter) {
  //     return;
  //   }

  //   loadSafe({
  //     ethAdapter,
  //     safeAddress: '0xaFdB0E3A67993A4456721f9b5252795C9b44Ea70',
  //   }).then(setSelectedSafe);
  // }, [ethAdapter, setSelectedSafe]);

  const onRun = async (shortcut: Shortcut) => {
    if (!walletClient) {
      toast({
        title: 'No wallet connected',
        status: 'error',
      });
      return;
    }

    if (chainId !== shortcut.chainId) {
      toast({
        title: 'TODO: handle multichain shortcuts',
        status: 'warning',
      });
      return;
    }

    if (selectedSafe) {
      if (!safeService) {
        toast({
          title: 'No safe service',
          status: 'error',
        });
        return;
      }

      const data: MetaTransactionData[] = shortcut.actions.map((action) => ({
        value: '0',
        operation: OperationType.Call,
        ...prepareTxData(action),
      }));
      const safeTx = await selectedSafe.createTransaction({ safeTransactionData: data });
      const safeTxHash = await selectedSafe.getTransactionHash(safeTx);
      const { data: senderSignature } = await selectedSafe.signTransactionHash(safeTxHash);

      try {
        await safeService.proposeTransaction({
          safeTxHash,
          senderSignature,
          safeAddress: await selectedSafe.getAddress(),
          safeTransactionData: safeTx.data,
          senderAddress: walletClient.account.address,
        });
        toast({
          title: 'Transaction proposed',
          description: safeTxHash,
          status: 'success',
        });
      } catch (e: any) {
        toast({
          title: 'Transaction failed',
          description: e.message,
          status: 'error',
        });
      }
    } else {
      // TODO: handle multiple actions flow
      // probably create a Runner component that handles this
      // for now, just run the first action
      const [action] = shortcut.actions;

      // TODO: extract this
      try {
        const txHash = await walletClient.sendTransaction({
          ...prepareTxData(action),
        });
        await publicClient.waitForTransactionReceipt({
          hash: txHash,
          confirmations: 2,
        });
        toast({
          title: 'Transaction confirmed',
          status: 'success',
        });
      } catch (e: any) {
        toast({
          title: 'Transaction failed',
          description: e.message,
          status: 'error',
        });
      }
    }
  };

  const onPublish = async (shortcut: Shortcut) => {
    const formattedShortcut = {
      name: shortcut.name,
      chainId: shortcut.chainId,
      actions: toHex(JSON.stringify(shortcut.actions)),
    };

    // FIXME: remove this
    alert(JSON.stringify(formattedShortcut));

    // FIXME: uncomment this
    // try {
    //   await eas.client.createTempateAttestation(???)
    // } catch (e: any) {
    //   toast({
    //     title: 'Failed to publish shortcut',
    //     description: e.message,
    //     status: 'error',
    //   });
    // }
  };

  return (
    <>
      <VStack align="stretch">
        <HStack pt="12px">
          <Text as="b" fontSize="xl">
            Shortcuts
          </Text>
          <Spacer />
          <Button
            rounded="xl"
            colorScheme="green"
            onClick={() => setIsCreateShortcutModalOpen(true)}
          >
            Create new
          </Button>
        </HStack>
        <VStack></VStack>
      </VStack>
      <Modal
        isOpen={isCreateShortcutModalOpen}
        size="xl"
        onClose={() => setIsCreateShortcutModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Shortcut</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ShortcutBuilder onPublish={onPublish} onRun={onRun} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Shortcuts;
