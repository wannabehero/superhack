import { ApolloClient, InMemoryCache } from '@apollo/client';

import { gql } from '../__generated__/gql';

const apolloClient = new ApolloClient({
  uri: 'https://sepolia.easscan.org/graphql',
  cache: new InMemoryCache(),
});

const GET_ALL_ATTESTATIONS = gql(`
    query Attestation($where: AttestationWhereInput) {
        attestations(where: $where) {
            id
            isOffchain
        }
    }
`);

export async function GetAttestations(schemaId: string) {
  return await apolloClient.query({
    query: GET_ALL_ATTESTATIONS,
    variables: { where: { schemaId: { equals: schemaId } } },
  });
}
