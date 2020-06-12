import { Builder, types } from '@biota/builder';
import { factory as helpers } from '@biota/helpers';
import { query as q } from 'faunadb';
import packagejson from './../../package.json';
import { constructors } from './constructors';
import { default_ } from './default';

const build = new Builder({
  lib: 'biota.schema',
  version: packagejson.version,
  path: 'key',
  defaults: { params: ['value', 'options', 'state'], defaults: [null, {}, {}] },
});
const before = (_, options, __) => ({
  options: q.Merge(constructors.FormatDefinition.response(options), { type: 'key' }),
});
export const key: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Schema: {
    name: '',
    extension: '.schema',
    params: ['value', 'options'],
    defaults: [null, {}],
    query(_, options) {
      return {
        definition: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            role: {
              anyOf: [
                'role',
                {
                  type: 'string',
                  enum: ['admin', 'server', 'server-readonly', 'client'],
                },
              ],
            },
            data: {
              optional: true,
              type: 'object',
              allowAdditionals: true,
              default: {},
            },
            database: 'database|optional',
            // priority: 'number|integer|positive|min:1|max:500|optional', // deprecated
          },
          allowAdditionals: q.Select('allowAdditionals', options, false),
          optionals: q.Select('optionals', options, false),
        },
      };
    },
  },
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
          type: key.Type.udfName(),
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
          isKey: q.IsKey(value),
        },
        {
          value: value,
          valid: q.Var('isKey'),
          sanitized: false,
          stop: q.Not(q.Var('isKey')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('isKey')),
              type: 'key',
              actual: helpers.TypeOf.response(value),
              expected: 'key',
            },
          ]),
        },
      );
    },
  },
});
