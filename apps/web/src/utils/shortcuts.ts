import { Signer } from 'ethers';
import { IPFSStorage, Shortcut, eas, local, gql } from 'libs';

const ipfs = new IPFSStorage(import.meta.env.VITE_WEB3_STORAGE_TOKEN!);

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
  // store attested template locally
  local.store({
    eas_id: easId,
    name: shortcut.name,
    chain_id: shortcut.chainId,
    ipfs_id: ipfsId,
  });
  return {
    ...shortcut,
    easId,
  };
}

export async function upvote(signer: Signer, shortcut: Shortcut) {
  if (!shortcut.easId) {
    throw Error('upvote requires `easId` to be nonnull');
  }
  const params = [{ name: 'template_id', value: shortcut.easId, type: 'string' }];
  await eas.client.upvote(signer, params);
}

export async function retrieve(easId: string): Promise<Shortcut> {
  const templateData = await gql.GetTemplate(easId);
  if (!templateData) {
    throw Error(`oops, no template for 'easId' = ${easId} found`);
  }
  return await buildShortcut({ id: easId, data: templateData });
}

export async function retrieveAll(): Promise<Shortcut[]> {
  const templatesData = await gql.GetAllTemplates();
  return Promise.all(templatesData.map(buildShortcut)).then((shortcuts) =>
    shortcuts.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)),
  );
}

export async function loadLocalShortcuts(): Promise<Shortcut[]> {
  const localTemplates = local.retrieve();
  return Promise.all(
    localTemplates.map(async (item) => {
      const payload = await ipfs.retrieve(item.ipfs_id);
      return {
        ...JSON.parse(payload),
        easId: item.eas_id,
        name: item.name,
        chainId: item.chain_id,
        rating: await upvoteCount(item.eas_id),
      };
    }),
  );
}

export async function upvoteCount(easId: string): Promise<number> {
  const params = [{ name: 'template_id', value: easId, type: 'string' }];
  return await gql.CountUpvotes(params);
}

async function buildShortcut(record: eas.TemplateRecord): Promise<Shortcut> {
  const items = eas.templateSchema.decodeData(record.data);
  const template: Record<string, any> = {};
  items.forEach((item) => {
    template[item.name] = item.value;
  });
  const payload = await ipfs.retrieve(template.ipfs_id.value);
  return {
    ...JSON.parse(payload),
    easId: record.id,
    name: template.name.value,
    chainId: template.chain_id.value,
    rating: await upvoteCount(record.id),
  };
}
