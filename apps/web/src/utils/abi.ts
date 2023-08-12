import { ABIItem } from 'libs';

export function formatABIItem({
  item,
  inputs = {},
}: {
  item: ABIItem;
  inputs?: Record<string, any>;
}) {
  return `${item.name}(${item.inputs.map((input) => inputs[input.name] ?? input.type).join(', ')})`;
}
