import { Signer } from 'ethers';
import { eas } from '..';
import { ipfs } from '../storage';
import { local } from '../storage';
import { Action, Shortcut } from './types';
import { CountUpvotes, GetAllTemplates, GetTemplate } from '../eas/gql';
import { templateSchema } from '../eas';
import { simulateTx } from '../tenderly';
import { TemplateRecord } from '../eas/types';

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
  const templateData = await GetTemplate(easId);
  if (!templateData) {
    throw Error(`oops, no template for 'easId' = ${easId} found`);
  }
  return await buildShortcut({ id: easId, data: templateData });
}

export async function retrieveAll(): Promise<Shortcut[]> {
  const templatesData = await GetAllTemplates();
  return Promise.all(templatesData.map(buildShortcut));
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
      };
    }),
  );
}

export async function upvoteCount(shortcut: Shortcut): Promise<number> {
  if (!shortcut.easId) {
    throw Error('upvoteCount requires `easId` to be nonnull');
  }
  const params = [{ name: 'template_id', value: shortcut.easId, type: 'string' }];
  return await CountUpvotes(params);
}

export async function simulate(signer: Signer, action: Action, chainId: number): Promise<any> {
  return await simulateTx({
    contract: {
      abi: [action.func],
      contractAddress: action.contract,
      provider: signer,
      funcName: action.func.name!,
      args: Object.values(action.inputs),
    },
    type: 'quick',
    sender: await signer.getAddress(),
    network_id: chainId.toString(),
    value: 0.0,
  });
}

async function buildShortcut(record: TemplateRecord): Promise<Shortcut> {
  const items = templateSchema.decodeData(record.data);
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
  };
}

export * from './types';
