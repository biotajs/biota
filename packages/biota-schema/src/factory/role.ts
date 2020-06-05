import { Builder, types } from '@biota/builder';
import { factory as helpers } from '@biota/helpers';
import { query as q } from 'faunadb';
import packagejson from './../../package.json';
import { constructors } from './constructors';
import { default_ } from './default';

const build = new Builder({
  lib: 'biota.schema',
  version: packagejson.version,
  path: 'role',
  defaults: { params: ['value', 'options', 'state'], defaults: [null, {}, {}] },
});
const before = (_, options, __) => ({
  options: q.Merge(constructors.FormatDefinition.response(options), { type: 'role' }),
});
export const role: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Validate: {
    name: 'Validate',
    before,
    query(value, options, state) {
      return constructors.ComposeResolver.response(
        value,
        constructors.FormatDefinition.response(options),
        state,
        {
          default: default_.Default.udfName(),
          type: role.Type.udfName(),
        },
        ['default', 'type'],
      );
    },
  },
  Type: {
    name: 'Type',
    before,
    query(value, _, state) {
      return q.Let(
        {
          isRole: q.IsRole(value),
        },
        {
          value: value,
          valid: q.Var('isRole'),
          sanitized: false,
          stop: q.Not(q.Var('isRole')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('isRole')),
              type: 'role',
              actual: helpers.TypeOf.response(value),
              expected: 'role',
            },
          ]),
        },
      );
    },
  },
});
