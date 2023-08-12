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
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useToast,
  Card,
  CardBody,
  Flex,
} from '@chakra-ui/react';
import { ArrowUpIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import ShortcutBuilder from './ShortcutBuilder';

import { Shortcut } from 'libs';
import ShortcutRunner from './ShortcutRunner';
import { useChainId } from 'wagmi';
import { useEthersSigner } from '../web3/ethersViem';
import useShortcuts from '../hooks/useShortcuts';
import { publish, upvote } from '../utils/shortcuts';

const Shortcuts = () => {
  const toast = useToast();
  const [isCreateShortcutModalOpen, setIsCreateShortcutModalOpen] = useState(false);
  const [runningShortcut, setRunningShortcut] = useState<Shortcut>();
  const chainId = useChainId();
  const signer = useEthersSigner({ chainId });
  const { shortcuts, fetchShortcuts } = useShortcuts();
  const [isLoading, setIsLoading] = useState(false);

  const onPublish = async (shortcut: Shortcut) => {
    if (!signer) {
      toast({
        title: 'No wallet connected',
        status: 'error',
      });
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

  const onRun = (shortcut: Shortcut) => {
    setRunningShortcut(shortcut);
  };

  const onUpvote = async (shortcut: Shortcut) => {
    if (!signer) {
      toast({
        title: 'No wallet connected',
        status: 'error',
      });
      return;
    }

    await upvote(signer, shortcut);
    await fetchShortcuts();
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
        <VStack alignItems="stretch">
          {!!shortcuts &&
            shortcuts.map((shortcut) => (
              <Card key={`shortcut-${shortcut.easId}`} variant="outline">
                <CardBody>
                  <Flex align="center">
                    <Text>{shortcut.name}</Text>
                    <Spacer />
                    {shortcut.rating !== undefined && (
                      <Button
                        leftIcon={<ArrowUpIcon />}
                        onClick={() => onUpvote(shortcut)}
                        variant="ghost"
                        size="sm"
                        rounded="full"
                        mr={4}
                      >
                        {shortcut.rating === 0
                          ? 'upvote'
                          : `${shortcut.rating} ${shortcut.rating === 1 ? 'vote' : 'votes'}`}
                      </Button>
                    )}
                    <Button colorScheme="red" onClick={() => onRun(shortcut)} rounded="full">
                      Run
                    </Button>
                  </Flex>
                </CardBody>
              </Card>
            ))}
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
      <Drawer onClose={() => setRunningShortcut(undefined)} isOpen={!!runningShortcut} size="lg">
        <DrawerOverlay />
        {!!runningShortcut && (
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>{runningShortcut.name}</DrawerHeader>
            <DrawerBody>
              <ShortcutRunner
                shortcut={runningShortcut}
                onDone={() => setRunningShortcut(undefined)}
              />
            </DrawerBody>
          </DrawerContent>
        )}
      </Drawer>
    </>
  );
};

export default Shortcuts;
