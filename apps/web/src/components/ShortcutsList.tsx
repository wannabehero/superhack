import { ArrowUpIcon } from '@chakra-ui/icons';
import { Button, Card, CardBody, Flex, Spacer, Text, VStack } from '@chakra-ui/react';
import { ShortcutInfo } from 'libs';

interface ShortcutsListProps {
  shortcuts: ShortcutInfo[];
  onUpvote: (easId: string) => void;
  onRun: (easId: string) => void;
}

const ShortcutsList = ({ shortcuts, onUpvote, onRun }: ShortcutsListProps) => {
  return (
    <VStack alignItems="stretch">
      {shortcuts.map((shortcut) => (
        <Card key={`shortcut-${shortcut.easId}`} variant="outline">
          <CardBody>
            <Flex align="center">
              <Text>{shortcut.name}</Text>
              <Spacer />
              <Button
                leftIcon={<ArrowUpIcon />}
                onClick={() => onUpvote(shortcut.easId)}
                variant="ghost"
                size="sm"
                rounded="full"
                mr={4}
              >
                {shortcut.rating === 0
                  ? 'upvote'
                  : `${shortcut.rating} ${shortcut.rating === 1 ? 'vote' : 'votes'}`}
              </Button>
              <Button colorScheme="red" onClick={() => onRun(shortcut.easId)} rounded="full">
                Run
              </Button>
            </Flex>
          </CardBody>
        </Card>
      ))}
    </VStack>
  );
};

export default ShortcutsList;
