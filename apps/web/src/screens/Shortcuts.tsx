import {
  HStack,
  VStack,
  Text,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Drawer,
  DrawerOverlay,
  useToast,
  IconButton,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import ShortcutBuilder from './ShortcutBuilder';

import { Shortcut } from 'libs';
import { useChainId } from 'wagmi';
import { useEthersSigner } from '../web3/ethersViem';
import useShortcuts from '../hooks/useShortcuts';
import { publish, upvote } from '../utils/shortcuts';
import { useNavigate, useOutlet } from 'react-router-dom';
import ShortcutsList from '../components/ShortcutsList';
import { optimism } from 'wagmi/chains';
import useAssertNetwork from '../hooks/useAssertNetwork';

const Shortcuts = () => {
  const navigate = useNavigate();
  const ShortcutRunner = useOutlet();
  const toast = useToast();
  const [isCreateShortcutModalOpen, setIsCreateShortcutModalOpen] = useState(false);
  const chainId = useChainId();
  const signer = useEthersSigner({ chainId });
  const { shortcuts, fetchShortcuts } = useShortcuts();
  const [isLoading, setIsLoading] = useState(false);
  const assertNetwork = useAssertNetwork(optimism.id);

  const onPublish = async (shortcut: Shortcut) => {
    if (!signer) {
      toast({
        title: 'No wallet connected',
        status: 'error',
      });
      return;
    }
    if (!assertNetwork()) {
      return;
    }
    setIsLoading(true);
    try {
      await publish(signer, shortcut);
      await fetchShortcuts();
      setIsCreateShortcutModalOpen(false);
      toast({
        title: 'Shortcut published',
        status: 'success',
      });
    } catch (e: any) {
      toast({
        title: 'Failed to publish shortcut',
        description: e.message,
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRun = (easId: string) => {
    navigate(`/${easId}`);
  };

  const onUpvote = async (easId: string) => {
    if (!signer) {
      toast({
        title: 'No wallet connected',
        status: 'error',
      });
      return;
    }
    if (!assertNetwork()) {
      return;
    }

    await upvote(signer, easId);
    await fetchShortcuts();
  };

  return (
    <>
      <VStack align="stretch">
        <HStack pt="12px">
          <Text as="b" fontSize="xl">
            Community
          </Text>
          <Spacer />
          <IconButton
            aria-label="Create shortcut"
            icon={<AddIcon />}
            colorScheme="green"
            rounded="full"
            size="md"
            onClick={() => setIsCreateShortcutModalOpen(true)}
            flexShrink={1}
          />
        </HStack>
        <VStack alignItems="stretch">
          {!!shortcuts && ShortcutsList({ shortcuts, onUpvote, onRun })}
        </VStack>
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
            <ShortcutBuilder onPublish={onPublish} isLoading={isLoading} />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Drawer onClose={() => navigate('/')} isOpen={!!ShortcutRunner} size="lg">
        <DrawerOverlay />
        {ShortcutRunner}
      </Drawer>
    </>
  );
};

export default Shortcuts;
