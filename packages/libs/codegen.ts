import { CodegenConfig } from '@graphql-codegen/cli';
import { Constant } from './src/constant';

const config: CodegenConfig = {
  schema: Constant.apolloClientUri,
  documents: ['src/**/*.ts'],
  generates: {
    './src/__generated__/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      }
    }
  },
  ignoreNoDocuments: true,
};

export default config;