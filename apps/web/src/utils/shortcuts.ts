import { Signer } from 'ethers';
import { IPFSStorage, Shortcut, ShortcutInfo, eas, gql } from 'libs';

const ipfs = new IPFSStorage(import.meta.env.VITE_WEB3_STORAGE_TOKEN!);
const skip = parseInt(import.meta.env.VITE_SKIP_FIRST_N_SHORTCUTS ?? '0');

export async function publish(signer: Signer, shortcut: Shortcut): Promise<Shortcut> {
  const payload = JSON.stringify(shortcut);
  // store to ipfs
  const ipfsId = await ipfs.store(payload);
  const params = [
    { name: 'name', value: shortcut.name, type: 'string' },
    { name: 'chain_id', value: shortcut.chainId, type: 'uint32' },
    { name: 'ipfs_id', value: ipfsId, type: 'string' },
  ];
  // onchain attestation for new template
  const easId = await eas.client.publish(signer, params);
  return {
    ...shortcut,
    easId,
  };
}

export function attestationUrl(shortcut: Shortcut) {
  // positive about hardcoded prefix
  return `https://optimism.easscan.org/attestation/view/${shortcut.easId}`;
}

export async function upvote(signer: Signer, easId: string) {
  const params = [{ name: 'template_id', value: easId, type: 'string' }];
  await eas.client.upvote(signer, params, easId);
}

export async function retrieve(easId: string): Promise<Shortcut> {
  const templateData = await gql.GetTemplate(easId);
  if (!templateData) {
    throw Error(`oops, no template for 'easId' = ${easId} found`);
  }
  return await buildShortcut({ id: easId, data: templateData });
}

export async function retrieveAll(): Promise<ShortcutInfo[]> {
  const templatesData = await gql.GetAllTemplates(skip);
  return Promise.all(templatesData.map(buildShortcutInfo)).then((shortcuts) =>
    shortcuts.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)),
  );
}

export async function upvoteCount(easId: string): Promise<number> {
  const params = [{ name: 'template_id', value: easId, type: 'string' }];
  return await gql.CountUpvotes(params);
}

async function buildShortcutInfo(record: eas.TemplateRecord): Promise<ShortcutInfo> {
  const items = eas.templateSchema.decodeData(record.data);
  const template: Record<string, any> = {};
  items.forEach((item) => {
    template[item.name] = item.value;
  });
  return {
    easId: record.id,
    ipfsId: template.ipfs_id.value,
    name: template.name.value,
    chainId: template.chain_id.value,
    rating: await upvoteCount(record.id),
  };
}

async function buildShortcut(record: eas.TemplateRecord): Promise<Shortcut> {
  const info = await buildShortcutInfo(record);
  const payload = await ipfs.retrieve(info.ipfsId);
  return {
    ...info,
    ...JSON.parse(payload),
  };
}
