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
} from '@chakra-ui/react';
import { useState } from 'react';
import ShortcutBuilder from './ShortcutBuilder';
import { Shortcut } from '../types/shortcut';

import { localShortcuts, publish } from 'libs/src/shortcut';
import ShortcutRunner from './ShortcutRunner';
import { useChainId } from 'wagmi';
import { useEthersSigner } from '../web3/ethersViem';

const Shortcuts = () => {
  const [isCreateShortcutModalOpen, setIsCreateShortcutModalOpen] = useState(false);
  const [runningShortcut, setRunningShortcut] = useState<Shortcut>();
  const chainId = useChainId();
  const signer = useEthersSigner({ chainId });
  if (!signer) {
    return;
  }

  const onLocal = async () => {
    console.log(await localShortcuts());
  };

  const onPublish = async (shortcut: Shortcut) => {
    return await publish(signer, shortcut);
  };

  const onRun = (shortcut: Shortcut) => {
    setRunningShortcut(shortcut);
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
          <Button
            rounded="xl"
            colorScheme="green"
            onClick={() => onLocal()}
          >
            Log Local shortcuts
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
      <Drawer onClose={() => setRunningShortcut(undefined)} isOpen={!!runningShortcut} size="lg">
        <DrawerOverlay />
        {!!runningShortcut && (
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>{runningShortcut.name}</DrawerHeader>
            <DrawerBody>
              <ShortcutRunner shortcut={runningShortcut} />
            </DrawerBody>
          </DrawerContent>
        )}
      </Drawer>
    </>
  );
};

export default Shortcuts;
