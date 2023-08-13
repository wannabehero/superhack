import { local } from 'libs';
import { createContext } from 'react';

export const BookmarksContext = createContext<local.LocalTemplate[]>([]);
export const BookmarksDispatchContext = createContext<() => void>(() => {});
