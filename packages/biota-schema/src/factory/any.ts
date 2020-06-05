import packagejson from './../../package.json';
import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import { constructors } from './constructors';

import { default_ } from './default';

const build = new Builder({
  lib: 'biota.schema',
  version: packagejson.version,
  path: 'any',
  defaults: { params: ['value', 'options', 'state'], defaults: [null, {}, {}] },
});
const before = (_, options, __) => ({
  options: q.Merge(constructors.FormatDefinition.response(options), { type: 'array' }),
});
export const any: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Validate: {
    name: 'Validate',
    before,
    query(value, options, state) {
      return constructors.ComposeResolver.response(
        value,
        options,
        state,
        {
          default: default_.Default.udfName(),
          type: any.Type.udfName(),
        },
        ['default', 'type'],
      );
    },
  },
  Type: {
    name: 'Type',
    query(value) {
      return {
        value,
        valid: true,
        sanitized: false,
      };
    },
  },
});
