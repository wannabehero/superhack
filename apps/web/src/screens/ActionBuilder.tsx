import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Select,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';

import { Action, etherscan } from 'libs';
import { formatABIItem } from '../utils/abi';
import { Address } from 'viem';
import { validateInput } from '../utils/inputs';

interface ActionBuilderProps {
  chainId: number;
  onDone: (action: Action) => void;
}

const ActionBuilder = ({ chainId, onDone }: ActionBuilderProps) => {
  const [contractAddress, setContractAddress] = useState('');
  const [contractError, setContractError] = useState<string | null>(null);
  const [abi, setABI] = useState<etherscan.ABI>();
  const [func, setFunc] = useState<etherscan.ABIItem | null>(null);
  const [inputs, setInputs] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!contractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return;
    }

    etherscan
      .getContractABI({ chainId, address: contractAddress })
      .then((abi) => {
        setABI(abi);
        setContractError(null);
      })
      .catch((err) => setContractError(err.message));
  }, [contractAddress, setContractError, chainId]);

  const functions = useMemo(() => {
    if (!abi) {
      return undefined;
    }

    return abi.filter((item) => item.type === 'function' && item.stateMutability === 'nonpayable');
  }, [abi]);

  const isButtonEnabled = useMemo(() => {
    if (!func) {
      return false;
    }

    return func.inputs.reduce((acc, input) => {
      if (!acc) {
        return acc;
      }

      return validateInput(input.type, inputs[input.name]);
    }, true);
  }, [func, inputs]);

  return (
    <>
      <VStack alignItems="stretch">
        <FormControl isRequired isInvalid={!!contractError}>
          <FormLabel>Contract</FormLabel>
          <Input
            value={contractAddress}
            placeholder="0xdead1337deed"
            onChange={(e) => setContractAddress(e.target.value)}
          />
          {!!contractError && <FormHelperText>{contractError}</FormHelperText>}
        </FormControl>
        {!!functions && (
          <Select
            placeholder="Select function"
            onChange={(e) => {
              setInputs({});
              setFunc(functions[parseInt(e.target.value)]);
            }}
          >
            {functions.map((func, idx) => (
              <option key={`${func.name}-${idx}`} value={idx}>
                {formatABIItem({ item: func })}
              </option>
            ))}
          </Select>
        )}
        {!!func && (
          <VStack>
            {func.inputs.map((input, idx) => (
              <FormControl
                key={`${input.name}-${idx}`}
                isInvalid={!validateInput(input.type, inputs[input.name])}
              >
                <InputGroup key={`${func.name}-${idx}`}>
                  {input.name.length && <InputLeftAddon children={input.name} />}
                  <Input
                    placeholder={input.name}
                    onChange={(e) => setInputs({ ...inputs, [input.name]: e.target.value })}
                    value={inputs[input.name] ?? ''}
                  />
                  <InputRightAddon children={input.type} />
                </InputGroup>
              </FormControl>
            ))}
          </VStack>
        )}
        <Button
          my="8px"
          alignSelf="flex-start"
          colorScheme="blue"
          isDisabled={!isButtonEnabled}
          onClick={() => !!func && onDone({ func, inputs, contract: contractAddress as Address })}
        >
          Done
        </Button>
      </VStack>
    </>
  );
};

export default ActionBuilder;
