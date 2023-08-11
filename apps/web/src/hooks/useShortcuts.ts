import { Shortcut, retrieveAll } from 'libs';
import { useCallback, useEffect, useState } from 'react';

const useShortcuts = () => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>();

  const fetchShortcuts = useCallback(() => {
    retrieveAll().then(setShortcuts);
  }, [setShortcuts]);

  useEffect(() => {
    fetchShortcuts();
  }, [fetchShortcuts]);

  return { shortcuts, fetchShortcuts };
};

export default useShortcuts;
