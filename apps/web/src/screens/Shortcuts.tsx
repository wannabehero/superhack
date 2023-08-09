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

import { eas } from 'libs';
import { toHex } from 'viem';
import ShortcutRunner from './ShortcutRunner';

const Shortcuts = () => {
  const toast = useToast();
  const [isCreateShortcutModalOpen, setIsCreateShortcutModalOpen] = useState(false);
  const [runningShortcut, setRunningShortcut] = useState<Shortcut>();

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
