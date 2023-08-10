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
import ShortcutRunner from './ShortcutRunner';
import { useChainId } from 'wagmi';
import { useEthersSigner } from '../web3/ethersViem';

const Shortcuts = () => {
  const toast = useToast();
  const [isCreateShortcutModalOpen, setIsCreateShortcutModalOpen] = useState(false);
  const [runningShortcut, setRunningShortcut] = useState<Shortcut>();
  const chainId = useChainId();
  const signer = useEthersSigner({ chainId });
  if (!signer) {
    return;
  }

  const bytesStringArray = (input: string) => {
    const bytes = new TextEncoder().encode(input);
    var bytesStringArray: string[] = []; // 🤡🤡🤡
    bytes.forEach((val, _, __) => bytesStringArray.push(`0x${val.toString(16)}`));
    return bytesStringArray;
  }

  const createPayloadAttestation = async (blob: string[]): Promise<string> => {
    const items = [
      { name: 'blob', type: 'bytes[]', value: blob },
      { name: 'version', type: 'uint8', value: 2 },
    ]
    try {
      return await eas.client.createShortcutActionsAttestation(signer, items);
    } catch (e: any) {
      toast({
        title: 'Failed to publish actions payload',
        description: e.message,
        status: 'error',
      });
      throw e;
    }
  }

  const createShortcutAttestation = async (blob: string[]): Promise<string> => {
    const items = [
      { name: 'blob', type: 'bytes[]', value: blob },
      { name: 'version', type: 'uint8', value: 2 },
    ]
    try {
      const txuid = await eas.client.createTemplateAttestation(signer,  items);
      toast({
        title: 'Published',
        description: `Verify at https://sepolia.easscan.org/attestation/view/${txuid}`,
        status: 'success',
      });
      return txuid;
    } catch (e: any) {
      toast({
        title: 'Failed to publish shortcut',
        description: e.message,
        status: 'error',
      });
      throw e;
    }
  }

  const onPublish = async (shortcut: Shortcut) => {
    // `len(shortcutBytesStringArray)` is too much for metamask:
    //    MetaMask - RPC Error: gas required exceeds allowance (30000000) {code: -32000, message: 'gas required exceeds allowance (30000000)'}
    // mitigation:
    //  1. Actions payload to offchain  
    //  2. Offchain uid to onchain
    const shortcutString = JSON.stringify(shortcut);
    const shortcutBytesStringArray = bytesStringArray(shortcutString);
    const payloadUid = await createPayloadAttestation(shortcutBytesStringArray);
    const templateString = JSON.stringify({ payload_uid: payloadUid }); 
    const templateBytesStringArray = bytesStringArray(templateString);
    await createShortcutAttestation(templateBytesStringArray);
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
