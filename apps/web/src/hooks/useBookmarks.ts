import { useCallback, useEffect, useState } from 'react';
import { LocalTemplate } from 'libs/src/storage/local/types';
import { retrieve } from 'libs/src/storage/local';

const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<LocalTemplate[]>();

  const fetchBookmarks = useCallback(() => {
    setBookmarks(retrieve());
  }, [setBookmarks]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return { bookmarks, fetchBookmarks };
};

export default useBookmarks;
