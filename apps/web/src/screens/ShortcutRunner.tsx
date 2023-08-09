import { Address, useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import useSafes from '../hooks/useSafes';
import { Shortcut } from '../types/shortcut';
import { Button, FormControl, FormLabel, Select, Text, VStack, useToast } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { loadSafe, useEthersAdapter, useSafeService } from '../web3/safe';
import Safe from '@safe-global/protocol-kit';
import { MetaTransactionData, OperationType } from '@safe-global/safe-core-sdk-types';
import { prepareTxData } from '../utils/actionTx';
import ActionsList from '../components/ActionsList';

interface ShortcutRunnerProps {
  shortcut: Shortcut;
}

const ShortcutRunner = ({ shortcut }: ShortcutRunnerProps) => {
  const toast = useToast();
  const chainId = useChainId();
  const { address } = useAccount();
  const { safes } = useSafes({ chainId, owner: address });
  const [executor, setExecutor] = useState<Address>();

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const ethAdapter = useEthersAdapter({ chainId });
  const safeService = useSafeService({ chainId });

  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const isEOA = useMemo(() => !executor || !safes || !safes.includes(executor), [safes, executor]);

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
      }
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
          placeholder="EOA or Safe"
          value={executor}
          onChange={(e) => setExecutor(e.target.value as Address)}
        >
          <option value={address}>Wallet: {address}</option>
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
          Actions
        </Text>
        <ActionsList actions={shortcut.actions} />
      </VStack>
      <Button
        colorScheme="red"
        onClick={onExecute}
        isDisabled={!executor || !shortcut.actions.length}
        alignSelf="flex-start"
        px="32px"
        isLoading={isLoading}
      >
        {isEOA ? 'Execute' : 'Propose'}
      </Button>
    </VStack>
  );
};

export default ShortcutRunner;
