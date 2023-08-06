import { etherscan } from 'libs';

export function formatABIItem({
  item,
  inputs = {},
}: {
  item: etherscan.ABIItem;
  inputs?: Record<string, any>;
}) {
  return `${item.name}(${item.inputs.map((input) => inputs[input.name] ?? input.type).join(', ')})`;
}
