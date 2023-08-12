import { Address, encodeFunctionData } from 'viem';
import { Action } from 'libs';

export function prepareTxData({ contract, func, inputs, value }: Action): {
  to: Address;
  value: string;
  data: Address;
} {
  const data = encodeFunctionData({
    abi: [func],
    functionName: func.name,
    args: func.inputs.map((input) => inputs[input.name]),
  });
  return { to: contract, data, value: value ?? '0' };
}
