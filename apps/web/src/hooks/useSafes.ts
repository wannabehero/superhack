import { useCallback, useEffect, useState } from 'react';
import { Address } from 'viem';

import { listSafes } from '../web3/safe';

const useSafes = ({
  chainId,
  owner,
}: {
  chainId: number | undefined;
  owner: Address | undefined;
}) => {
  const [safes, setSafes] = useState<string[]>();

  const fetchSafes = useCallback(() => {
    if (!chainId || !owner) {
      setSafes(undefined);
      return;
    }

    listSafes(chainId, owner).then(setSafes);
  }, [setSafes, chainId, owner]);

  useEffect(() => {
    fetchSafes();
  }, [chainId, owner, fetchSafes]);

  return { safes, fetchSafes };
};

export default useSafes;
