import { SchemaItem } from "@ethereum-attestation-service/eas-sdk";

export interface Itemable {
  items(): SchemaItem[];
}

export interface Template extends Itemable {
  name: string;
  chain_id: number;
  ipfs_id: string;
}

export interface TemplateUpvote extends Itemable {
  template_id: string;
}