import { ShortcutInfo } from 'libs';
import { useCallback, useEffect, useState } from 'react';
import { retrieveAll } from '../utils/shortcuts';

const useShortcuts = () => {
  const [shortcuts, setShortcuts] = useState<ShortcutInfo[]>();

  const fetchShortcuts = useCallback(async () => {
    await retrieveAll().then(setShortcuts);
  }, [setShortcuts]);

  useEffect(() => {
    fetchShortcuts();
  }, [fetchShortcuts]);

  return { shortcuts, fetchShortcuts };
};

export default useShortcuts;
