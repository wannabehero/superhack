import { Address } from 'viem';
import { RelayBalance } from '../web3/relay/types';
import { useCallback, useEffect, useState } from 'react';
import { getRelayBalance } from '../web3/relay';

const useRelayBalance = ({ account }: { account?: Address }) => {
  const [relayBalance, setRelayBalance] = useState<RelayBalance>();

  const fetchRelayBalance = useCallback(async () => {
    if (!account) {
      setRelayBalance(undefined);
      return;
    }

    const response = await getRelayBalance(account);
    setRelayBalance(response.sponsor.mainBalance);
  }, [account, setRelayBalance]);

  useEffect(() => {
    fetchRelayBalance();
  }, [account, fetchRelayBalance]);

  return { relayBalance, fetchRelayBalance };
};

export default useRelayBalance;
