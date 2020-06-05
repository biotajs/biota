import { Builder, types } from '@biota/builder';
import { factory } from '@biota/helpers';
import { query as q } from 'faunadb';
import { constructors } from './constructors';
import packagejson from './../../package.json';
import { default_ } from './default';

const build = new Builder({
  lib: 'biota.schema',
  version: packagejson.version,
  path: 'boolean',
  defaults: { params: ['value', 'options', 'state'], defaults: [null, {}, {}] } ,
});
const before = (_, options, __) => ({
  options: q.Merge(constructors.FormatDefinition.response(options), { type: 'boolean' }),
});
export const boolean: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Validate: {
    name: 'Validate',
    before,
    query(value, options, state) {
      return constructors.ComposeResolver.response(
        value,
        constructors.FormatDefinition.response(options),
        state,
        {
          convert: boolean.Convert.udfName(),
          default: default_.Default.udfName(),
          type: boolean.Type.udfName(),
        },
        ['convert', 'default', 'type'],
      );
    },
  },
  Type: {
    name: 'Type',
    before,
    query(value, _, state) {
      return q.Let(
        {
          isBoolean: q.IsBoolean(value),
        },
        {
          value: value,
          valid: q.Var('isBoolean'),
          sanitized: false,
          stop: q.Not(q.Var('isBoolean')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('isBoolean')),
              type: 'boolean',
              actual: factory.TypeOf.response(value),
              expected: 'boolean',
            },
          ]),
        },
      );
    },
  },
  Convert: {
    name: 'Convert',
    before,
    query(value, options, _) {
      return q.Let(
        {
          hasConvert: q.Select('convert', constructors.FormatDefinition.response(options), false),
          // ↓
          convertedToBoolean: factory.ConvertToBoolean.response(value),
          canBeConvertedToBoolean: q.Not(q.IsNull(q.Var('convertedToBoolean'))),
          // ↓
          updatedValue: q.If(
            q.And(q.Var('hasConvert'), q.Var('canBeConvertedToBoolean')),
            q.Var('convertedToBoolean'),
            value,
          ),
          valid: q.If(q.Var('hasConvert'), q.Var('canBeConvertedToBoolean'), true),
        },
        {
          value: q.Var('updatedValue'),
          valid: q.Var('valid'),
          sanitized: q.Var('hasConvert'),
          stop: q.Not(q.Var('valid')),
          errors: constructors.FormatErrors.response(q.Var('state'), [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'booleanConvert',
              actual: value,
              expected: ['0', '1', 'on', 'off', 'true', 'false'],
            },
          ]),
        },
      );
    },
  },
});
