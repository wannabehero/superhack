import { HStack, VStack, Text, Spacer, Button, Card, CardBody, Flex } from '@chakra-ui/react';

import useBookmarks from '../hooks/useBookmarks';
import { LocalTemplate } from 'libs/src/storage/local/types';
import { useNavigate } from 'react-router-dom';

const Bookmarks = () => {
  const { bookmarks } = useBookmarks();
  const navigate = useNavigate();

  const onClick = (bookmark: LocalTemplate) => {
    console.log(`/${bookmark.easId}${bookmark.input}`);
    navigate(`${bookmark.easId}${bookmark.input}`);
  };

  const inputEntries = (bookmark: LocalTemplate) => {
    const query = new URLSearchParams(bookmark.input);
    const inputs = [];
    for (const [key, value] of query.entries()) {
      inputs.push(`${key}: ${value}`);
    }
    return inputs;
  };

  return (
    <>
      <VStack align="stretch">
        <HStack pt="12px">
          <Text as="b" fontSize="xl">
            Bookmarks
          </Text>
          <Spacer />
        </HStack>
        <VStack alignItems="stretch">
          {!!bookmarks &&
            bookmarks.map((bookmark) => (
              <Card key={`bookmark-${bookmark.id}`} variant="outline">
                <CardBody>
                  <Flex align="center">
                    <VStack align="left">
                      <Text>{bookmark.name}</Text>
                      <VStack spacing={0} align="left">
                        {inputEntries(bookmark).map((input) => (
                          <Text key={input} fontSize="xs">
                            {input}
                          </Text>
                        ))}
                      </VStack>
                    </VStack>
                    <Spacer />
                    <Button colorScheme="red" onClick={() => onClick(bookmark)} rounded="full">
                      Run
                    </Button>
                  </Flex>
                </CardBody>
              </Card>
            ))}
        </VStack>
      </VStack>
    </>
  );
};

export default Bookmarks;
