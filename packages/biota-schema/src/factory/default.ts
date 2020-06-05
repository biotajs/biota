import packagejson from './../../package.json';
import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import { constructors } from './constructors';

const build = new Builder({
  lib: 'biota.schema',
  version: packagejson.version,
  path: 'default',
  defaults: { params: ['value', 'options', 'state'], defaults: [null, {}, {}] },
});
const before = (_, options, __) => ({
  options: q.Merge(constructors.FormatDefinition.response(options), { type: 'array' }),
});
export const default_: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Default: {
    name: 'Default',
    before,
    query(value, options, state) {
      return q.Let(
        {
          hasDefault: q.Contains('default', options),
          default: q.Select('default', options, null),
          // ↓
          // defaultPredicate: q.Select('defaultPredicate', options, null),
          // hasDefaultPredicate: q.IsLambda(q.Var('defaultPredicate')),
          // ↓
          isNullable: q.IsNull(value),
          // ↓
          updatedValue: q.If(q.And(q.Var('hasDefault'), q.Var('isNullable')), q.Var('default'), value),
        },
        {
          value: q.Var('updatedValue'),
          valid: true,
          sanitized: q.Var('isNullable'),
          errors: [],
        },
      );
    },
  },
});
