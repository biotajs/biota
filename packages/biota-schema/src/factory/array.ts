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
  path: 'array',
  defaults: { params: ['value', 'options', 'state'], defaults: [null, {}, {}] },
});
const before = (_, options, __) => ({
  options: q.Merge(constructors.FormatDefinition.response(options), { type: 'array' }),
});
export const array: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Validate: {
    name: 'Validate',
    before,
    query(value, options, state) {
      return constructors.ComposeResolver.response(
        value,
        options,
        state,
        {
          convert: array.Convert.udfName(),
          default: default_.Default.udfName(),
          type: array.Type.udfName(),
          empty: array.Empty.udfName(),
          min: array.Min.udfName(),
          max: array.Max.udfName(),
          count: array.Count.udfName(),
          includes: array.Includes.udfName(),
          unique: array.Unique.udfName(),
          enum: array.Enum.udfName(),
          items: array.Items.udfName(),
          distinct: array.Distinct.udfName(),
        },
        ['convert', 'default', 'type'],
        ['delimiter'],
      );
    },
  },
  Type: {
    name: 'Type',
    before,
    query(value, options, state) {
      return q.Let(
        {
          isArray: q.IsArray(value),
        },
        {
          value: value,
          valid: q.Var('isArray'),
          sanitized: false,
          stop: q.Not(q.Var('isArray')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('isArray')),
              type: 'array',
              actual: helpers.TypeOf.response(value),
              expected: 'array',
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
          hasConvert: q.Select('convert', options, false),
          delimiter: q.Select('delimiter', options, ';'),
          // ↓
          canConvertToArray: helpers.CanConvertToArray.response(value),
          // ↓
          convertedIntoArray: helpers.ConvertToArray.response(value, q.Var('delimiter')),
          hasBeenConvertedIntoArray: q.Not(q.IsNull(q.Var('convertedIntoArray'))),
          // ↓
          updatedValue: q.If(
            q.And(q.Var('hasConvert'), q.Var('canConvertToArray')),
            q.Var('convertedIntoArray'),
            value,
          ),
          valid: q.If(q.Var('hasConvert'), q.Var('hasBeenConvertedIntoArray'), true),
        },
        {
          value: q.Var('updatedValue'),
          valid: q.Var('valid'),
          sanitized: q.Var('hasConvert'),
          stop: q.Not(q.Var('valid')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'arrayConvert',
            },
          ]),
        },
      );
    },
  },
  Empty: {
    name: 'Empty',
    before,
    query(value, options, state) {
      return q.Let(
        {
          hasNoItems: q.Contains('empty', options),
          empty: q.Select('empty', options, false),
          // ↓
          valid: q.If(q.Var('hasNoItems'), q.If(q.Var('empty'), q.IsEmpty(value), q.IsNonEmpty(value)), true),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: q.If(q.Var('empty'), 'arrayNoItems', 'arrayNonNoItems'),
            },
          ]),
        },
      );
    },
  },
  Min: {
    name: 'Min',
    before,
    query(value, options, state) {
      return q.Let(
        {
          hasMinItems: q.Contains('min', options),
          min: q.Select('min', options, null),
          isValidMinItems: q.IsNumber(q.Var('min')),
          // ↓
          valid: q.If(q.And(q.Var('hasMinItems'), q.Var('isValidMinItems')), q.GTE(q.Count(value), q.Var('min')), true),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'array_min',
            },
          ]),
        },
      );
    },
  },
  Max: {
    name: 'Max',
    before,
    query(value, options, state) {
      return q.Let(
        {
          hasMaxItems: q.Contains('max', options),
          max: q.Select('max', options, null),
          isValidMaxItems: q.IsNumber(q.Var('max')),
          // ↓
          valid: q.If(q.And(q.Var('hasMaxItems'), q.Var('isValidMaxItems')), q.LTE(q.Count(value), q.Var('max')), true),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'array_max',
            },
          ]),
        },
      );
    },
  },
  Count: {
    name: 'Count',
    before,
    query(value, options, state) {
      return q.Let(
        {
          hasNbItems: q.Contains('count', options),
          count: q.Select('count', options, null),
          isValidNbItems: q.IsNumber(q.Var('count')),
          // ↓
          valid: q.If(
            q.And(q.Var('hasNbItems'), q.Var('isValidNbItems')),
            q.Equals(q.Count(value), q.Var('count')),
            true,
          ),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'array_count',
              expected: q.Var('count'),
              actual: q.Count(value),
            },
          ]),
        },
      );
    },
  },
  Includes: {
    name: 'Includes',
    before,
    query(value, options, state) {
      return q.Let(
        {
          FALSE_EXPR: q.Select('FALSE_EXPR', constants.constants.Strings.response(), null),
          hasMatchItems: q.Contains('includes', options),
          includes: q.Select('includes', options, q.Var('FALSE_EXPR')),
          isValidMatchItems: q.Not(q.Equals(q.Var('includes'), q.Var('FALSE_EXPR'))),
          // ↓
          valid: q.If(
            q.And(q.Var('hasMatchItems'), q.Var('isValidMatchItems')),
            q.IsEmpty(q.Difference(q.Distinct(q.Var('includes')), value)),
            true,
          ),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'arrayMatchItems',
            },
          ]),
        },
      );
    },
  },
  Unique: {
    name: 'Unique',
    before,
    query(value, options, state) {
      return q.Let(
        {
          FALSE_EXPR: q.Select('FALSE_EXPR', constants.constants.Strings.response(), null),
          hasUniqueItems: q.Contains('unique', options),
          unique: q.Select('unique', options, q.Var('FALSE_EXPR')),
          isValidUniqueItems: q.Not(q.Equals(q.Var('unique'), q.Var('FALSE_EXPR'))),
          // ↓
          valid: q.If(
            q.And(q.Var('hasUniqueItems'), q.Var('isValidUniqueItems')),
            q.Equals(q.Count(q.Distinct(value)), q.Count(value)),
            true,
          ),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'array_uniqueItems',
            },
          ]),
        },
      );
    },
  },
  Enum: {
    name: 'Enum',
    before,
    query(value, options, state) {
      return q.Let(
        {
          hasEnumItems: q.Contains('enum', options),
          enum: q.Select('enum', options, []),
          isValidEnumItems: q.IsNonEmpty(q.IsArray(q.Var('enum'))),
          // ↓
          valid: q.If(
            q.And(q.Var('hasEnumItems'), q.Var('isValidEnumItems')),
            q.IsEmpty(q.Difference(q.Distinct(q.Var('enum')), value)),
            true,
          ),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'array_enum',
            },
          ]),
        },
      );
    },
  },
  Distinct: {
    name: 'Distinct',
    before,
    query(value, options, state) {
      return q.Let(
        {
          hasDistinct: q.Select('distinct', options, false),
          // ↓
          updatedValue: q.If(q.Var('hasDistinct'), q.Distinct(value), value),
        },
        {
          value: q.Var('updatedValue'),
          valid: true,
          sanitized: q.Var('hasDistinct'),
        },
      );
    },
  },
  Items: {
    name: 'Items',
    before,
    query(value, options, state) {
      return q.Let(
        {
          hasItems: q.Contains('items', options),
          items: constructors.FormatDefinition.response(q.Select('items', options, null)),
          //isValidItems: q.Or(q.IsObject(q.Var('items')), q.IsArray(q.Var('items'))),
          // wrappedItems: q.If(
          //   q.IsObject(q.Var('items')),
          //   { validate: q.Var('items') },
          //   q.If(q.IsArray(q.Var('items')), q.Map(q.Var('items'), q.Lambda('item', { validate: q.Var('item') })), null),
          // ),
          //ab: q.Abort(q.Format('%@', { items: q.Var('items') })),
          // ↓
          result: q.If(
            // q.And(q.Var('hasItems'), q.Var('isValidItems')),
            q.Var('hasItems'),
            constructors.ArrayComposeResolver.response(
              helpers.ArrayIndexed.response(value),
              q.Var('items'),
              state,
            ),
            { valid: true },
          ),
          //ab: q.Abort(q.Format('%@', { result: q.Var('result') })),
          valid: q.Select('valid', q.Var('result'), false),
          errors: q.Select('errors', q.Var('result'), []),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: q.Append(
            constructors.FormatErrors.response(state, [
              {
                wrong: q.Not(q.Var('valid')),
                type: 'array_items',
              },
            ]),
            q.Var('errors'),
          ),
        },
      );
    },
  },
});
