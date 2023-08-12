import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import Safes from './Safes';
import Shortcuts from './Shortcuts';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import ShortcutRunner from './ShortcutRunner';
import { retrieve } from '../utils/shortcuts';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Shortcuts />,
    children: [
      {
        path: '/:id',
        element: <ShortcutRunner />,
        loader: async ({ params }) => retrieve(params.id!),
        errorElement: <></>,
      },
    ],
  },
]);

const Main = () => {
  return (
    <Tabs variant="soft-rounded" colorScheme="green">
      <TabList>
        <Tab>Shortcuts</Tab>
        <Tab>Safes</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <RouterProvider router={router} />
        </TabPanel>
        <TabPanel>
          <Safes />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default Main;
