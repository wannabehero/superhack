import { useCallback, useEffect, useState } from 'react';
import { local } from 'libs';

const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<local.LocalTemplate[]>();

  const fetchBookmarks = useCallback(() => {
    setBookmarks(local.retrieve());
  }, [setBookmarks]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return { bookmarks, fetchBookmarks };
};

export default useBookmarks;
