import { Flex, IconButton, Input, Select } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { ALL_INPUT_TYPES, InputType } from '../utils/consts';

interface NewInputBuilderProps {
  name: string;
  type: InputType;
  onChange: (name: string, type: InputType) => void;
  onRemove: (name: string) => void;
}

const InputBuilder = ({ name, type, onChange, onRemove }: NewInputBuilderProps) => {
  return (
    <Flex>
      <Input
        value={name}
        placeholder="input_name"
        onChange={(e) => onChange(e.target.value, type)}
        flexGrow={1}
      />
      <Select
        placeholder="Type"
        value={type}
        onChange={(e) => onChange(name, e.target.value as InputType)}
        flexGrow={1}
        mx={4}
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
      />
    </Flex>
  );
};

export default InputBuilder;
