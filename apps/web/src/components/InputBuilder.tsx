import { Flex, IconButton, Input, Select } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { ALL_INPUT_TYPES, InputType } from '../utils/consts';

interface NewInputBuilderProps {
  name: string;
  type: InputType;
  isDisabled?: boolean;
  onChange: (name: string, type: InputType) => void;
  onRemove: (name: string) => void;
}

const InputBuilder = ({ name, type, onChange, onRemove, isDisabled }: NewInputBuilderProps) => {
  return (
    <Flex>
      <Input
        value={name}
        placeholder="input_name"
        onChange={(e) => onChange(e.target.value, type)}
        flexGrow={1}
        isDisabled={isDisabled}
      />
      <Select
        placeholder="Type"
        value={type}
        onChange={(e) => onChange(name, e.target.value as InputType)}
        flexGrow={1}
        mx={4}
        isDisabled={isDisabled}
      >
        {ALL_INPUT_TYPES.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </Select>
      <IconButton
        aria-label="Remove input"
        icon={<DeleteIcon />}
        variant="ghost"
        onClick={() => onRemove(name)}
        flexShrink={1}
        isDisabled={isDisabled}
      />
    </Flex>
  );
};

export default InputBuilder;
