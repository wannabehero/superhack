import { ApolloClient, InMemoryCache } from '@apollo/client';
import { Constant } from '../constant/index';

import { gql } from '../__generated__/gql';
import { templateUpvoteSchema } from '.';
import { SchemaItem } from '@ethereum-attestation-service/eas-sdk';

const apolloClient = new ApolloClient({
  uri: Constant.apolloClientUri,
  cache: new InMemoryCache(),
});

const GET_TEMPLATE = gql(`
query GetTemplate($where: AttestationWhereUniqueInput!) {
  attestation(where: $where) {
    data
  }
}
`);

const COUNT_UPVOTES = gql(`
query CountUpvotes($where: AttestationWhereInput) {
  aggregateAttestation(where: $where) {
    _count {
      _all
    }
  }
}`);

export async function CountUpvotes(items: SchemaItem[]): Promise<number> {
  const response = await apolloClient.query({
    query: COUNT_UPVOTES,
    variables: { 
      where: { 
        schemaId: { equals: templateUpvoteSchema.uid },
        data: { equals: templateUpvoteSchema.encodeData(items) },
      } 
    },
  });
  return response.data.aggregateAttestation._count?._all ?? 0;
}

export async function GetTemplate(easId: string): Promise<string | undefined> {
  const response = await apolloClient.query({
    query: GET_TEMPLATE,
    variables: { where: { id: easId } },
  });
  return response.data.attestation?.data;
}
