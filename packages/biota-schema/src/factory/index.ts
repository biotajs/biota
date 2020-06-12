import { Builder, types } from '@biota/builder';
import { factory as helpers } from '@biota/helpers';
import { query as q } from 'faunadb';
import packagejson from './../../package.json';
import { constructors } from './constructors';
import { default_ } from './default';

const build = new Builder({
  lib: 'biota.schema',
  version: packagejson.version,
  path: 'index',
  defaults: { params: ['value', 'options', 'state'], defaults: [null, {}, {}] },
});
const before = (_, options, __) => ({
  options: q.Merge(constructors.FormatDefinition.response(options), { type: 'index' }),
});
export const index: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
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
              notEnum: ['events', 'sets', 'self', 'documents', '__'],
            },
            source: {
              anyOf: [
                'reference',
                {
                  type: 'array',
                  properties: {
                    description: 'source_object',
                    type: 'object',
                    properties: {
                      collection: 'collection',
                      fields: 'object|allowAdditionals',
                    },
                  },
                },
              ],
              default: null,
              optional: true,
            },
            terms: {
              type: 'array',
              properties: {
                description: 'term',
                type: 'object',
                properties: {
                  field: {
                    type: 'array',
                    properties: 'string',
                  },
                  binding: 'string', // validate if exists!
                },
              },
            },
            values: {
              optional: true,
              type: 'array',
              properties: {
                description: 'term',
                type: 'object',
                properties: {
                  field: {
                    type: 'array',
                    properties: 'string',
                  },
                  binding: 'string', // validate if exists!
                  reverse: {
                    type: 'boolean',
                    default: false,
                  },
                },
              },
            },
            unique: 'boolean|optional',
            serialized: 'boolean|optional',
            data: {
              optional: true,
              type: 'object',
              allowAdditionals: true,
              default: {},
            },
            permissions: {
              optional: true,
              type: 'object',
              default: null,
            },
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
          type: index.Type.udfName(),
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
          isIndex: q.IsIndex(value),
        },
        {
          value: value,
          valid: q.Var('isIndex'),
          sanitized: false,
          stop: q.Not(q.Var('isIndex')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('isIndex')),
              type: 'index',
              actual: helpers.TypeOf.response(value),
              expected: 'index',
            },
          ]),
        },
      );
    },
  },
});
