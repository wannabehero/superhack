import { LoaderFunctionArgs, RouterProvider, createBrowserRouter } from 'react-router-dom';
import ShortcutRunner from './ShortcutRunner';
import { retrieve } from '../utils/shortcuts';
import { Inputs, Shortcut } from 'libs';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import Shortcuts from './Shortcuts';
import Bookmarks from './Bookmarks';
import { BookmarksContext, BookmarksDispatchContext } from './BookmarksContext';
import useBookmarks from '../hooks/useBookmarks';

async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<{ shortcut: Shortcut; inputs: Inputs }> {
  const shortcut = await retrieve(params.id!);
  const url = new URL(request.url);
  const inputs = Object.fromEntries(url.searchParams.entries());
  return {
    shortcut,
    inputs,
  };
}

const router = () => {
  const { bookmarks, fetchBookmarks } = useBookmarks();
  return createBrowserRouter([
    {
      path: '/',
      element: (
        <BookmarksContext.Provider value={bookmarks ?? []}>
          <BookmarksDispatchContext.Provider value={fetchBookmarks}>
            <Tabs variant="soft-rounded" colorScheme="green">
              <TabList>
                <Tab>Community</Tab>
                <Tab>Bookmarks</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Shortcuts />
                </TabPanel>
                <TabPanel>
                  <Bookmarks />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </BookmarksDispatchContext.Provider>
        </BookmarksContext.Provider>
      ),
      children: [
        {
          path: '/:id',
          element: <ShortcutRunner />,
          loader: loader,
          errorElement: <></>,
        },
      ],
    },
  ])
};

const Main = () => {
  return <RouterProvider router={router()} />;
};

export default Main;
