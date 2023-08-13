import { Card, CardBody, Code, Flex, VStack } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { Action } from 'libs';
import { formatABIItem } from '../utils/abi';

interface ActionsListProps {
  actions: Action[];
  completed?: number[];
}

const ActionsList = ({ actions, completed }: ActionsListProps) => {
  return (
    <VStack alignItems="stretch">
      {actions.map((action, idx) => (
        <Card key={`action-${idx}`} _hover={{ opacity: 0.8, cursor: 'pointer' }} variant="outline">
          <CardBody>
            <Flex alignItems="center">
              {completed?.includes(idx) && <CheckIcon mr="4" boxSize="3" />}
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
