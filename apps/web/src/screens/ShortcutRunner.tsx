import {
  Address,
  WalletClient,
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient,
} from 'wagmi';
import useSafes from '../hooks/useSafes';
import { Action, Inputs, Shortcut, Tenderly } from 'libs';
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Select,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { loadSafe, useEthersAdapter, useSafeService } from '../web3/safe';
import Safe from '@safe-global/protocol-kit';
import { MetaTransactionData, OperationType } from '@safe-global/safe-core-sdk-types';
import { prepareTxData } from '../utils/actionTx';
import ActionsList from '../components/ActionsList';
import SafeProvider, { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import SafeApiKit from '@safe-global/api-kit';
import SafeAppsSDK, { BaseTransaction } from '@safe-global/safe-apps-sdk';
import { validateInput } from '../utils/inputs';
import { useEthersSigner } from '../web3/ethersViem';

const tenderly = new Tenderly(import.meta.env.VITE_TENDERLY_ACCESS_KEY!);
interface ShortcutRunnerProps {
  shortcut: Shortcut;
  onDone: () => void;
}

async function executeWithControllerSafe({
  shortcut,
  selectedSafe,
  walletClient,
  safeService,
}: {
  shortcut: Shortcut;
  selectedSafe: Safe;
  walletClient: WalletClient;
  safeService: SafeApiKit;
}): Promise<string> {
  const data: MetaTransactionData[] = shortcut.actions.map((action) => ({
    value: '0',
    operation: OperationType.Call,
    ...prepareTxData(action),
  }));
  const safeTx = await selectedSafe.createTransaction({ safeTransactionData: data });
  const safeTxHash = await selectedSafe.getTransactionHash(safeTx);
  const { data: senderSignature } = await selectedSafe.signTransactionHash(safeTxHash);

  await safeService.proposeTransaction({
    safeTxHash,
    senderSignature,
    safeAddress: await selectedSafe.getAddress(),
    safeTransactionData: safeTx.data,
    senderAddress: walletClient.account.address,
  });

  return safeTxHash;
}

async function executeWithIndependedSafe({
  shortcut,
  sdk,
}: {
  shortcut: Shortcut;
  sdk: SafeAppsSDK;
}) {
  // we are inside a Safe App
  const txs: BaseTransaction[] = shortcut.actions.map((action) => ({
    value: '0',
    ...prepareTxData(action),
  }));
  // Returns a hash to identify the Safe transaction
  const { safeTxHash } = await sdk.txs.send({ txs });
  return safeTxHash;
}

function substituteInputsForAction(action: Action, inputs: Inputs): Action {
  const newAction = { ...action };
  for (const key in action.inputs) {
    const match = action.inputs[key].match(/^\{(\w+)\}$/);
    if (match) {
      newAction.inputs[key] = inputs[match[1]];
    }
  }
  return newAction;
}

function substituteInputsForShortcut(shortcut: Shortcut, inputs: Inputs): Shortcut {
  return {
    ...shortcut,
    actions: shortcut.actions.map((action) => substituteInputsForAction(action, inputs)),
  };
}

const ShortcutRunner = ({ shortcut, onDone }: ShortcutRunnerProps) => {
  const toast = useToast();
  const chainId = useChainId();
  const { address } = useAccount();
  const { safes } = useSafes({ chainId, owner: address });
  const [executor, setExecutor] = useState<Address>();
  const [inputs, setInputs] = useState<Inputs>({});

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const ethAdapter = useEthersAdapter({ chainId });
  const safeService = useSafeService({ chainId });

  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const isEOA = useMemo(() => !executor || !safes || !safes.includes(executor), [safes, executor]);
  const signer = useEthersSigner({ chainId });

  const safeApp = useSafeAppsSDK();

  const isButtonEnabled = useMemo(
    () =>
      Object.entries(shortcut.inputs).reduce((acc, [name, type]) => {
        if (!acc) {
          return acc;
        }

        return validateInput(type, inputs[name]);
      }, true),
    [shortcut, inputs],
  );

  const onSimulate = async () => {
    if (!signer) {
      toast({
        title: 'Cant create signer',
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

    if (!executor) {
      toast({
        title: 'No executor selected',
        status: 'error',
      });
      return;
    }

    setIsSimulating(true);
    const finalised = substituteInputsForShortcut(shortcut, inputs);
    const links = await tenderly.simulate(signer, finalised);
    window.open(links[0], '_blank', 'noreferrer');
    setIsSimulating(false);
  };

  const onExecute = async () => {
    if (!walletClient || !ethAdapter) {
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

    if (!executor) {
      toast({
        title: 'No executor selected',
        status: 'error',
      });
      return;
    }

    setIsLoading(true);

    try {
      let selectedSafe: Safe | null = null;
      if (!!safes && safes.includes(executor)) {
        selectedSafe = await loadSafe({
          ethAdapter,
          safeAddress: executor,
        });
      }

      if (selectedSafe) {
        if (!safeService) {
          throw new Error('No Safe service');
        }

        const safeTxHash = await executeWithControllerSafe({
          selectedSafe,
          walletClient,
          safeService,
          shortcut: substituteInputsForShortcut(shortcut, inputs),
        });
        toast({
          title: 'Transaction proposed',
          description: safeTxHash,
          status: 'success',
        });
      } else if (safeApp.connected && safeApp.safe.safeAddress.length > 0) {
        const safeTxHash = await executeWithIndependedSafe({
          sdk: safeApp.sdk,
          shortcut: substituteInputsForShortcut(shortcut, inputs),
        });
        toast({
          title: 'Transaction proposed',
          description: safeTxHash,
          status: 'success',
        });
      } else {
        // TODO: handle multiple actions flow
        // probably create a Runner component that handles this
        // for now, just run the first action
        const [action] = shortcut.actions;

        // TODO: extract this
        const txHash = await walletClient.sendTransaction({
          ...prepareTxData(substituteInputsForAction(action, inputs)),
          value: 0n,
        });
        await publicClient.waitForTransactionReceipt({
          hash: txHash,
          confirmations: 2,
        });
        toast({
          title: 'Success!',
          status: 'success',
        });
      }
      onDone();
    } catch (e: any) {
      toast({
        title: 'Transaction failed',
        description: e.message,
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack alignItems="stretch" spacing="16px">
      <FormControl>
        <FormLabel>Executor</FormLabel>
        <Select
          placeholder="Wallet or Safe"
          value={executor}
          onChange={(e) => setExecutor(e.target.value as Address)}
        >
          <option value={address}>Current: {address}</option>
          {!!safes &&
            safes.map((safe) => (
              <option key={safe} value={safe}>
                Safe: {safe}
              </option>
            ))}
        </Select>
      </FormControl>
      <VStack alignItems="stretch">
        <Text fontWeight="medium" fontSize="md">
          Inputs
        </Text>
        <VStack>
          {Object.entries(shortcut.inputs).map(([name, type], idx) => (
            <FormControl key={`${name}-${idx}`} isInvalid={!validateInput(type, inputs[name])}>
              <InputGroup>
                <InputLeftAddon children={name} />
                <Input
                  placeholder={name}
                  onChange={(e) => setInputs({ ...inputs, [name]: e.target.value })}
                  value={inputs[name] ?? ''}
                />
                <InputRightAddon children={type} />
              </InputGroup>
            </FormControl>
          ))}
        </VStack>
      </VStack>
      <VStack alignItems="stretch">
        <Text fontWeight="medium" fontSize="md">
          Actions
        </Text>
        <ActionsList actions={shortcut.actions} />
      </VStack>
      <HStack>
        <Button
          colorScheme="red"
          onClick={onExecute}
          isDisabled={!executor || !shortcut.actions.length || !isButtonEnabled}
          alignSelf="flex-start"
          px="32px"
          isLoading={isLoading}
        >
          {isEOA ? 'Execute' : 'Propose'}
        </Button>
        <Button
          colorScheme="green"
          onClick={onSimulate}
          isDisabled={!executor || !shortcut.actions.length || !isButtonEnabled}
          alignSelf="flex-start"
          px="32px"
          isLoading={isSimulating}
        >
          Simulate
        </Button>
      </HStack>
    </VStack>
  );
};

const WrappedRunner = (props: ShortcutRunnerProps) => (
  <SafeProvider>
    <ShortcutRunner {...props} />
  </SafeProvider>
);

export default WrappedRunner;
