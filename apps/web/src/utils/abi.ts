import { ABIItem } from 'libs';

export function formatABIItem({
  item,
  value,
  inputs = {},
}: {
  item: ABIItem;
  value?: string;
  inputs?: Record<string, any>;
}) {
  const valueStr = value ? `{value: ${value}}` : '';
  const inputsStr = item.inputs.map((input) => inputs[input.name] ?? input.type).join(', ');
  return `${item.name}${valueStr}(${inputsStr})`;
}
