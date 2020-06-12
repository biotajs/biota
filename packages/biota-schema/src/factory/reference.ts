import { Builder, types } from '@biota/builder';
import { factory as helpers } from '@biota/helpers';
import { query as q } from 'faunadb';
import packagejson from './../../package.json';
import { constructors } from './constructors';
import { default_ } from './default';

const build = new Builder({
  lib: 'biota.schema',
  version: packagejson.version,
  path: 'reference',
  defaults: { params: ['value', 'options', 'state'], defaults: [null, {}, {}] },
});
const before = (_, options, __) => ({
  options: q.Merge(constructors.FormatDefinition.response(options), { type: 'reference' }),
});
export const reference: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
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
          type: reference.Type.udfName(),
          exists: reference.exists.udfName(),
          notExists: reference.notExists.udfName(),
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
          isReference: q.IsRef(value),
        },
        {
          value: value,
          valid: q.Var('isReference'),
          sanitized: false,
          stop: q.Not(q.Var('isReference')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('isReference')),
              type: 'reference',
              actual: helpers.TypeOf.response(value),
              expected: 'reference',
            },
          ]),
        },
      );
    },
  },
  exists: {
    name: 'exists',
    before,
    query(value, _, state) {
      return q.Let(
        {
          exists: q.Exists(value),
        },
        {
          value: value,
          valid: q.Var('exists'),
          sanitized: false,
          stop: q.Not(q.Var('exists')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('exists')),
              type: 'reference_exists',
            },
          ]),
        },
      );
    },
  },
  notExists: {
    name: 'notExists',
    before,
    query(value, _, state) {
      return q.Let(
        {
          notExists: q.Not(q.Exists(value)),
        },
        {
          value: value,
          valid: q.Var('notExists'),
          sanitized: false,
          stop: q.Not(q.Var('notExists')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('notExists')),
              type: 'reference_not_exists',
            },
          ]),
        },
      );
    },
  },
});
