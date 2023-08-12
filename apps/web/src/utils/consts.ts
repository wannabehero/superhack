export type InputType =
  | 'string'
  | 'address'
  | 'bytes32'
  | 'uint256'
  | 'uint8'
  | 'uint16'
  | 'uint32'
  | 'uint64'
  | 'uint128';

export const ALL_INPUT_TYPES = [
  'string',
  'address',
  'bytes32',
  'uint256',
  'uint8',
  'uint16',
  'uint32',
  'uint64',
  'uint128',
] as const;
