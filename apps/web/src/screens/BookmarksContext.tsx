import { LocalTemplate } from 'libs/src/storage/local/types';
import { createContext } from 'react';

export const BookmarksContext = createContext<LocalTemplate[]>([]);
export const BookmarksDispatchContext = createContext<() => void>(() => {});