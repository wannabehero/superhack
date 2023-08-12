import { Card, CardBody, Code, Flex, VStack } from '@chakra-ui/react';
import { Action } from 'libs';
import { formatABIItem } from '../utils/abi';

interface ActionsListProps {
  actions: Action[];
}

const ActionsList = ({ actions }: ActionsListProps) => {
  return (
    <VStack alignItems="stretch">
      {actions.map((action, idx) => (
        <Card key={`action-${idx}`} _hover={{ opacity: 0.8, cursor: 'pointer' }} variant="outline">
          <CardBody>
            <Flex align="center">
              <Code>
                {formatABIItem({ item: action.func, inputs: action.inputs, value: action.value })}
              </Code>
            </Flex>
          </CardBody>
        </Card>
      ))}
    </VStack>
  );
};

export default ActionsList;
