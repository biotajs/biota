import { Builder, types } from '@biota/builder';
import { factory as helpers } from '@biota/helpers';
import { query as q } from 'faunadb';
import { constructors } from './constructors';
import packagejson from './../../package.json';
import { default_ } from './default';

const build = new Builder({
  lib: 'biota.schema',
  version: packagejson.version,
  path: 'bytes',
  defaults: { params: ['value', 'options', 'state'], defaults: [null, {}, {}] },
});
const before = (_, options, __) => ({
  options: q.Merge(constructors.FormatDefinition.response(options), { type: 'bytes' }),
});
export const bytes: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
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
          type: bytes.Type.udfName(),
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
          isBytes: q.IsBytes(value),
        },
        {
          value: value,
          valid: q.Var('isBytes'),
          sanitized: false,
          stop: q.Not(q.Var('isBytes')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('isBytes')),
              type: 'bytes',
              actual: helpers.TypeOf.response(value),
              expected: 'bytes',
            },
          ]),
        },
      );
    },
  },
});
