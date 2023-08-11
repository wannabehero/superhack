import { Signer } from "ethers";
import { eas } from "..";
import { ipfs } from "../storage";
import { local } from "../storage";
import { Shortcut } from "./types";
import { CountUpvotes, GetTemplate } from "../eas/gql";
import { templateSchema } from "../eas";

export async function publish(signer: Signer, shortcut: Shortcut): Promise<Shortcut> {
  const actions = JSON.stringify(shortcut.actions);
  // store to ipfs
  const ipfsId = await ipfs.store(actions);
  const params = [
    { name: 'name', value: shortcut.name, type: 'string' },
    { name: 'chain_id', value: shortcut.chainId, type: 'uint32' },
    { name: 'ipfs_id', value: ipfsId, type: 'string' },
  ]
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
    easId: easId,
    name: shortcut.name,
    chainId: shortcut.chainId,
    actions: shortcut.actions,
  };
}

export async function upvote(signer: Signer, shortcut: Shortcut) {
  if (!shortcut.easId) {
    throw Error('upvote requires `easId` to be nonnull');
  }
  const params = [
    { name: 'template_id', value: shortcut.easId, type: 'string' },
  ]
  await eas.client.upvote(signer, params);
}

export async function retrieve(easId: string): Promise<Shortcut> {
  const templateData = await GetTemplate(easId);
  if (!templateData) {
    throw Error(`oops, no template for 'easId' = ${easId} found`);
  }
  const items = templateSchema.decodeData(templateData);
  var template: Record<string, any> = {}; 
  items.forEach(item => {
    template[item.name] = item.value;
  });
  const payload = await ipfs.retrieve(template.ipfs_id.value);
  return {
    easId: easId,
    name: template.name.value, 
    chainId: template.chain_id.value,
    actions: JSON.parse(payload),
  }
}

export async function localShortcuts(): Promise<Shortcut[]> {
  const localTemplates = local.retrieve();
  return await Promise.all(
    localTemplates.map(async item => {
      const payload = await ipfs.retrieve(item.ipfs_id);
      return {
        easId: item.eas_id,
        name: item.name, 
        chainId: item.chain_id,
        actions: JSON.parse(payload),
      }
    })
  );
}

export async function upvoteCount(shortcut: Shortcut): Promise<number> {
  if (!shortcut.easId) {
    throw Error('upvoteCount requires `easId` to be nonnull');
  }
  const params = [
    { name: 'template_id', value: shortcut.easId, type: 'string' },
  ]
  return await CountUpvotes(params);
}

export async function simulate(shortcut: Shortcut): Promise<any> {
  // tenderly call 
}