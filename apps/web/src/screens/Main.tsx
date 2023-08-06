import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import Safes from './Safes';
import Shortcuts from './Shortcuts';

const Main = () => {
  return (
    <Tabs variant="soft-rounded" colorScheme="green">
      <TabList>
        <Tab>Shortcuts</Tab>
        <Tab>Safes</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Shortcuts />
        </TabPanel>
        <TabPanel>
          <Safes />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default Main;
