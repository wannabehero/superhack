import { Address, encodeFunctionData } from 'viem';
import { Action } from 'libs';

export function prepareTxData({ contract, func, inputs }: Action): { to: Address; data: Address } {
  const data = encodeFunctionData({
    abi: [func],
    functionName: func.name,
    args: func.inputs.map((input) => inputs[input.name]),
  });
  return { to: contract, data };
}
