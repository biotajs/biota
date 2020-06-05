import { Builder, types } from '@biota/builder';
import { factory as constants } from '@biota/constants';
import { factory as helpers } from '@biota/helpers';
import { query as q } from 'faunadb';
import packagejson from './../../package.json';
import { constructors } from './constructors';
import { default_ } from './default';

const build = new Builder({
  lib: 'biota.schema',
  version: packagejson.version,
  path: 'date',
  defaults: { params: ['value', 'options', 'state'], defaults: [null, {}, {}] },
});
const before = (_, options, __) => ({
  options: q.Merge(constructors.FormatDefinition.response(options), { type: 'date' }),
});
export const date: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Validate: {
    name: 'Validate',
    before,
    query(value, options, state) {
      return constructors.ComposeResolver.response(
        value,
        constructors.FormatDefinition.response(options),
        state,
        {
          convert: date.Convert.udfName(),
          default: default_.Default.udfName(),
          type: date.Type.udfName(),
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
          isDate: q.IsDate(value),
        },
        {
          value: value,
          valid: q.Var('isDate'),
          sanitized: false,
          stop: q.Not(q.Var('isDate')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('isDate')),
              type: 'date',
              actual: helpers.TypeOf.response(value),
              expected: 'date',
            },
          ]),
        },
      );
    },
  },
  Convert: {
    name: 'Convert',
    before,
    query(value, options, state) {
      return q.Let(
        {
          DATE_PATTERN: q.Select('DATE', constants.constants.Patterns.response(), null),
          hasConvert: q.Select('convert', constructors.FormatDefinition.response(options), false),
          // ↓
          canBeConvertedToDate: q.If(
            q.IsString(value),
            q.IsNonEmpty(q.FindStrRegex(value, q.Var('DATE_PATTERN'))),
            false,
          ),
          // ↓
          updatedValue: q.If(q.And(q.Var('hasConvert'), q.Var('canBeConvertedToDate')), q.ToDate(value), value),
          valid: q.If(q.Var('hasConvert'), q.Var('canBeConvertedToDate'), true),
        },
        {
          value: q.Var('updatedValue'),
          valid: q.Var('valid'),
          sanitized: q.Var('hasConvert'),
          stop: q.Not(q.Var('valid')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'dateConvert',
              actual: value,
              expected: 'string/dateformat',
            },
          ]),
        },
      );
    },
  },
});
