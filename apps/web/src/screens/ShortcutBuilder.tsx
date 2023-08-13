import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useMemo, useState } from 'react';

import ActionBuilder from './ActionBuilder';
import { CHAINS } from '../web3/consts';
import { Action, Shortcut } from 'libs';
import ActionsList from '../components/ActionsList';
import { InputType } from '../utils/consts';
import InputBuilder from '../components/InputBuilder';

interface ShortcutBuilderProps {
  isLoading: boolean;
  onPublish: (shortcut: Shortcut) => void;
}

const ShortcutBuilder = ({ onPublish, isLoading }: ShortcutBuilderProps) => {
  const [name, setName] = useState<string>('');
  const [chainId, setChainId] = useState<number>(CHAINS[0].id);
  const [actions, setActions] = useState<Action[]>([]);
  const [inputs, setInputs] = useState<[string, InputType][]>([]);
  const [isAddActionModalOpen, setIsAddActionModalOpen] = useState(false);

  const isPublishButtonEnabled = useMemo(
    () => name.length && chainId && actions.length,
    [name, chainId, actions],
  );

  return (
    <>
      <VStack alignItems="stretch" pb="12px">
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <FormHelperText>Some clever shortcut name. Go wild</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Chain</FormLabel>
          <Select
            placeholder="Select chain"
            value={chainId}
            onChange={(e) => setChainId(parseInt(e.target.value))}
          >
            {CHAINS.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </Select>
        </FormControl>
        {!!chainId && (
          <>
            <VStack alignItems="stretch" py="8px">
              <Text fontSize="l" fontWeight="medium">
                Inputs
              </Text>
              {inputs.map(([name, type], idx) => (
                <InputBuilder
                  key={`input-${idx}`}
                  name={name}
                  type={type}
                  isDisabled={isLoading}
                  onRemove={() => setInputs((prev) => prev.filter((_, xdi) => xdi !== idx))}
                  onChange={(name, type) =>
                    setInputs((prev) => {
                      const newInputs = [...prev];
                      newInputs[idx] = [name, type];
                      return newInputs;
                    })
                  }
                />
              ))}
              <Button
                isDisabled={isLoading}
                leftIcon={<AddIcon />}
                onClick={() => setInputs((prev) => [...prev, ['', 'string']])}
                variant="ghost"
                minHeight="50px"
              >
                Add Input
              </Button>
            </VStack>
            <VStack alignItems="stretch" py="8px">
              <Text fontSize="l" fontWeight="medium">
                Actions
              </Text>
              <ActionsList actions={actions} />
              <Button
                isDisabled={isLoading}
                leftIcon={<AddIcon />}
                onClick={() => setIsAddActionModalOpen(true)}
                variant="ghost"
                minHeight="50px"
              >
                Add Action
              </Button>
            </VStack>
          </>
        )}
        <Button
          isLoading={isLoading}
          colorScheme="blue"
          isDisabled={!isPublishButtonEnabled}
          onClick={() => onPublish({ name, chainId, actions, inputs: Object.fromEntries(inputs) })}
        >
          Publish
        </Button>
      </VStack>
      <Modal isOpen={isAddActionModalOpen} size="xl" onClose={() => setIsAddActionModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Shortcut Action</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ActionBuilder
              chainId={chainId}
              onDone={(action) => {
                setActions([...actions, action]);
                setIsAddActionModalOpen(false);
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ShortcutBuilder;
