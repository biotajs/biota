import { Builder, types } from '@biota/builder';
import { factory as helpers } from '@biota/helpers';
import { query as q } from 'faunadb';
import packagejson from './../../package.json';
import { constructors } from './constructors';
import { default_ } from './default';

const build = new Builder({
  lib: 'biota.schema',
  version: packagejson.version,
  path: 'null',
  defaults: { params: ['value', 'options', 'state'], defaults: [null, {}, {}] },
});
const before = (_, options, __) => ({
  options: q.Merge(constructors.FormatDefinition.response(options), { type: 'null' }),
});
export const null_: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Validate: {
    name: 'Validate',
    before,
    query(value, options, state) {
      return constructors.ComposeResolver.response(
        value,
        constructors.FormatDefinition.response(options),
        state,
        {
          type: null_.Type.udfName(),
        },
        ['type'],
      );
    },
  },
  Type: {
    name: 'Type',
    before,
    query(value, _, state) {
      return q.Let(
        {
          isNull: q.IsNull(value),
        },
        {
          value: value,
          valid: q.Var('isNull'),
          sanitized: false,
          stop: q.Not(q.Var('isNull')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('isNull')),
              type: 'null',
              actual: helpers.TypeOf.response(value),
              expected: 'null',
            },
          ]),
        },
      );
    },
  },
});
