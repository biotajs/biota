import { Builder, types } from '@biota/builder';
import { factory as helpers } from '@biota/helpers';
import { query as q } from 'faunadb';
import packagejson from './../../package.json';
import { constructors } from './constructors';
import { default_ } from './default';

const build = new Builder({
  lib: 'biota.schema',
  version: packagejson.version,
  path: 'token',
  defaults: { params: ['value', 'options', 'state'], defaults: [null, {}, {}] },
});
const before = (_, options, __) => ({
  options: q.Merge(constructors.FormatDefinition.response(options), { type: 'token' }),
});
export const token: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
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
          type: token.Type.udfName(),
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
          isToken: q.IsToken(value),
        },
        {
          value: value,
          valid: q.Var('isToken'),
          sanitized: false,
          stop: q.Not(q.Var('isToken')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('isToken')),
              type: 'token',
              actual: helpers.TypeOf.response(value),
              expected: 'token',
            },
          ]),
        },
      );
    },
  },
});
