import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import Safes from './Safes';
import Shortcuts from './Shortcuts';
import { LoaderFunctionArgs, RouterProvider, createBrowserRouter } from 'react-router-dom';
import ShortcutRunner from './ShortcutRunner';
import { retrieve } from '../utils/shortcuts';
import { Inputs, Shortcut } from 'libs';

async function loader({ request, params }: LoaderFunctionArgs): Promise<[Shortcut, Inputs]> {
  const shortcut = await retrieve(params.id!);
  const url = new URL(request.url);
  for (const [key, value] of url.searchParams.entries()) {
    console.log(key, value);
    shortcut.inputs[key] = value;
  }
  const inputs = Object.fromEntries(url.searchParams.entries())
  return [shortcut, inputs];
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Shortcuts />,
    children: [
      {
        path: '/:id',
        element: <ShortcutRunner />,
        loader: loader,
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
