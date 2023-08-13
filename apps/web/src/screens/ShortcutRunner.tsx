import {
  Address,
  WalletClient,
  useAccount,
  useChainId,
  useNetwork,
  usePublicClient,
  useWalletClient,
} from 'wagmi';
import useSafes from '../hooks/useSafes';
import { ExternalLinkIcon, LinkIcon, PlusSquareIcon } from '@chakra-ui/icons';
import { Action, Inputs, Shortcut, Tenderly } from 'libs';
import {
  Button,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
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
  Spacer,
  Link,
} from '@chakra-ui/react';
import { useContext, useMemo, useState } from 'react';
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
import { useLoaderData, useNavigate } from 'react-router-dom';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
import { ensClient } from '../web3/wallets';
import useAssertNetwork from '../hooks/useAssertNetwork';
import { attestationUrl } from '../utils/shortcuts';
import { store } from 'libs/src/storage/local';
import { v4 as uuidv4 } from 'uuid';
import { BookmarksDispatchContext } from './BookmarksContext';

const tenderly = new Tenderly(import.meta.env.VITE_TENDERLY_ACCESS_KEY!);

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
  const txs: BaseTransaction[] = shortcut.actions.map(prepareTxData);
  // Returns a hash to identify the Safe transaction
  const { safeTxHash } = await sdk.txs.send({ txs });
  return safeTxHash;
}

async function resolveInputsForAction(action: Action, inputs: Inputs): Promise<Action> {
  const newAction = { ...action, inputs: { ...action.inputs } };
  for (const key in action.inputs) {
    const template = action.inputs[key].match(/^\{(\w+)\}$/);
    if (template) {
      newAction.inputs[key] = inputs[template[1]];
    }
    const ens = newAction.inputs[key].match(/^(\w+\.eth)$/);
    if (ens) {
      newAction.inputs[key] = (await ensClient.getEnsAddress({ name: ens[1] })) as Address;
    }
  }
  const template = action.value?.match(/^\{(\w+)\}$/);
  if (template) {
    newAction.value = inputs[template[1]] ?? inputs[`{${template[1]}}`];
  }
  const eth = newAction.value?.match(/^(\d+\.\d+)$/);
  if (eth) {
    newAction.value = parseEther(newAction.value!).toString();
  }
  return newAction;
}

async function resolveInputsForShortcut(shortcut: Shortcut, inputs: Inputs): Promise<Shortcut> {
  return {
    ...shortcut,
    actions: await Promise.all(
      shortcut.actions.map((action) => resolveInputsForAction(action, inputs)),
    ),
  };
}

function encodedInput(inputs: Inputs): string {
  const filtered = Object.entries(inputs).reduce((acc, [name, value]) => {
    if (value) {
      acc.set(name, value);
    }
    return acc;
  }, new Map<string, string>());
  const query = new URLSearchParams(Object.fromEntries(filtered));
  if (query.size > 0) {
    return `?${query.toString()}`;
  } else {
    return '';
  }
}

const ShortcutRunner = () => {
  const preset = useLoaderData() as { shortcut: Shortcut; inputs: Inputs } | undefined;
  const shortcut = preset?.shortcut;
  const navigate = useNavigate();
  const { openConnectModal } = useConnectModal();
  const assertNetwork = useAssertNetwork(shortcut?.chainId);
  const toast = useToast();
  const chainId = useChainId();
  const { address } = useAccount();
  const { safes } = useSafes({ chainId, owner: address });
  const [executor, setExecutor] = useState<Address | undefined>(address);
  const [inputs, setInputs] = useState<Inputs>(preset?.inputs ?? {});
  const { chains } = useNetwork();
  const [completedActions, setCompletedActions] = useState<number[]>([]);

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const ethAdapter = useEthersAdapter({ chainId });
  const safeService = useSafeService({ chainId });

  const [isRunning, setIsRunning] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const isEOA = useMemo(() => !executor || !safes || !safes.includes(executor), [safes, executor]);
  const signer = useEthersSigner({ chainId });
  const fetchBookmarks = useContext(BookmarksDispatchContext);

  const safeApp = useSafeAppsSDK();

  const isButtonEnabled = useMemo(
    () =>
      shortcut
        ? Object.entries(shortcut.inputs).reduce((acc, [name, type]) => {
            if (!acc) {
              return acc;
            }

            return validateInput(type, inputs[name]);
          }, true)
        : false,
    [shortcut, inputs],
  );

  const onShare = () => {
    if (!shortcut) {
      return;
    }

    const params = encodedInput(inputs);
    const data = {
      title: shortcut.name,
      url: `${window.location.origin}/${shortcut.easId}${params}`,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(data)) {
      navigator.share(data);
    } else {
      navigator.clipboard.writeText(data.url);
      toast({
        title: 'Copied to clipboard',
        status: 'info',
        duration: 2000,
      });
    }
  };

  const onSimulate = async () => {
    if (!signer) {
      toast({
        title: 'Cant create signer',
        status: 'error',
      });
      return;
    }

    if (!shortcut || chainId !== shortcut.chainId) {
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
    try {
      const finalised = await resolveInputsForShortcut(shortcut, inputs);
      const links = await tenderly.simulate(signer, finalised);
      links.forEach((link) => window.open(link, '_blank', 'noreferrer'));
    } catch (e: any) {
      toast({
        title: 'Simulation failed',
        description: e.message,
        status: 'error',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const onBookmark = async () => {
    if (!shortcut || chainId !== shortcut.chainId) {
      toast({
        title: 'TODO: handle multichain shortcuts',
        status: 'warning',
      });
      return;
    }

    store({
      id: uuidv4(),
      input: encodedInput(inputs),
      ...shortcut,
    });
    toast({
      title: 'Saved to bookmarks',
      status: 'info',
      duration: 2000,
    });
    fetchBookmarks();
  };

  const onExecute = async () => {
    if (!walletClient || !ethAdapter) {
      toast({
        title: 'No wallet connected',
        status: 'error',
      });
      return;
    }

    if (!shortcut || chainId !== shortcut.chainId) {
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

    setIsRunning(true);

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
          shortcut: await resolveInputsForShortcut(shortcut, inputs),
        });
        toast({
          title: 'Transaction proposed',
          description: safeTxHash,
          status: 'success',
        });
      } else if (safeApp.connected && safeApp.safe.safeAddress.length > 0) {
        const safeTxHash = await executeWithIndependedSafe({
          sdk: safeApp.sdk,
          shortcut: await resolveInputsForShortcut(shortcut, inputs),
        });
        toast({
          title: 'Transaction proposed',
          description: safeTxHash,
          status: 'success',
        });
      } else {
        const first = completedActions.length ? Math.max(...completedActions) : 0;
        for (let i = first; i < shortcut.actions.length; i += 1) {
          const action = shortcut.actions[i];
          const txData = prepareTxData(await resolveInputsForAction(action, inputs));
          const txHash = await walletClient.sendTransaction({
            ...txData,
            value: BigInt(txData.value),
          });
          await publicClient.waitForTransactionReceipt({
            hash: txHash,
            confirmations: 4,
          });
          setCompletedActions((prev) => [...prev, i]);
        }
        toast({
          title: 'Success!',
          status: 'success',
        });
      }
      navigate('/');
    } catch (e: any) {
      toast({
        title: 'Transaction failed',
        description: e.message,
        status: 'error',
      });
      setCompletedActions([]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <DrawerContent>
      {shortcut ? (
        <>
          <DrawerCloseButton />
          <DrawerHeader>
            <HStack alignItems="center">
              <Text>
                {shortcut.name.slice(0, 32)}
                {shortcut.name.length > 32 ? '...' : ''}
              </Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            <VStack alignItems="stretch" spacing="16px">
              {walletClient && chainId !== shortcut.chainId && (
                <Button alignSelf="flex-start" onClick={assertNetwork} colorScheme="red">
                  Switch to {chains.find((chain) => chain.id === shortcut.chainId)?.name}
                </Button>
              )}
              {walletClient ? (
                <FormControl>
                  <FormLabel>Executor</FormLabel>
                  <Select
                    placeholder="Wallet or Safe"
                    value={executor}
                    onChange={(e) => setExecutor(e.target.value as Address)}
                    isDisabled={isRunning}
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
              ) : (
                <Button alignSelf="flex-start" onClick={openConnectModal} colorScheme="cyan">
                  Connect wallet
                </Button>
              )}
              {Object.entries(shortcut.inputs).length && (
                <VStack alignItems="stretch">
                  <Text fontWeight="medium" fontSize="md">
                    Inputs
                  </Text>
                  <VStack>
                    {Object.entries(shortcut.inputs).map(([name, type], idx) => (
                      <FormControl
                        key={`${name}-${idx}`}
                        isInvalid={!validateInput(type, inputs[name])}
                      >
                        <InputGroup>
                          <InputLeftAddon children={name.replace(/[{}]/g, '')} />
                          <Input
                            isDisabled={isRunning || isSimulating}
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
              )}
              <VStack alignItems="stretch">
                <Text fontWeight="medium" fontSize="md">
                  Actions
                </Text>
                <ActionsList actions={shortcut.actions} completed={completedActions} />
              </VStack>
              <HStack>
                <Button
                  colorScheme="red"
                  onClick={onExecute}
                  isDisabled={!executor || !shortcut.actions.length || !isButtonEnabled}
                  alignSelf="flex-start"
                  px="32px"
                  isLoading={isRunning}
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
                <Spacer />
                <Button
                  variant="ghost"
                  onClick={onBookmark}
                  isDisabled={!shortcut.actions.length || !isButtonEnabled}
                  leftIcon={<PlusSquareIcon />}
                >
                  Save
                </Button>
                <Link href={attestationUrl(shortcut)} isExternal>
                  <Button leftIcon={<ExternalLinkIcon />} variant="ghost">
                    Inspect
                  </Button>
                </Link>
                <Button leftIcon={<LinkIcon />} variant="ghost" onClick={() => onShare()}>
                  Share
                </Button>
              </HStack>
            </VStack>
          </DrawerBody>
        </>
      ) : (
        <></>
      )}
    </DrawerContent>
  );
};

const WrappedRunner = () => (
  <SafeProvider>
    <ShortcutRunner />
  </SafeProvider>
);

export default WrappedRunner;
