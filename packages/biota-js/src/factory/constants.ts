import { Builder, types } from '@biota/builder';
import packagejson from './../../package.json';

const build = new Builder({ lib: 'biota.constants', version: packagejson.version });

export const constants: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  strings: {
    name: 'strings',
    query() {
      return {
        SIMPLE_SEPARATOR: '_',
        DOUBLE_SEPARATOR: '__',
        FALSE_EXPR: 'BIOTA.FALSE',
      };
    },
  },
});
