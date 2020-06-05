import { Builder, types } from '@biota/builder';
import { factory as helpers } from '@biota/helpers';
import { query as q } from 'faunadb';
import packagejson from './../../package.json';
import { constructors } from './constructors';
import { default_ } from './default';

const build = new Builder({
  lib: 'biota.schema',
  version: packagejson.version,
  path: 'number',
  defaults: { params: ['value', 'options', 'state'], defaults: [null, {}, {}] },
});
const before = (_, options, __) => ({
  options: q.Merge(constructors.FormatDefinition.response(options), { type: 'number' }),
});
export const number: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Validate: {
    name: 'Validate',
    before,
    query(value, options, state) {
      return constructors.ComposeResolver.response(
        value,
        options,
        state,
        {
          type: number.Type.udfName(),
          default: default_.Default.udfName(),
          convert: number.Convert.udfName(),
          min: number.Min.udfName(),
          max: number.Max.udfName(),
          equal: number.Equal.udfName(),
          nonEqual: number.NonEqual.udfName(),
          integer: number.Integer.udfName(),
          double: number.Double.udfName(),
          positive: number.Positive.udfName(),
          negative: number.Negative.udfName(),
          trunc: number.Trunc.udfName(),
        },
        ['convert', 'default', 'type'],
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
          // ↓
          convertedToNumber: helpers.ConvertToNumber.response(value),
          canConvertToNumber: q.IsNumber(q.Var('convertedToNumber')),
          // ↓
          updatedValue: q.If(
            q.And(q.Var('hasConvert'), q.Var('canConvertToNumber')),
            q.Var('convertedToNumber'),
            value,
          ),
          valid: q.If(q.Var('hasConvert'), q.Var('canConvertToNumber'), true),
        },
        {
          value: q.Var('updatedValue'),
          valid: q.Var('valid'),
          sanitized: q.Var('hasConvert'),
          stop: q.Not(q.Var('valid')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'number_convert',
            },
          ]),
        },
      );
    },
  },
  Type: {
    name: 'Type',
    before,
    query(value, _, state) {
      return q.Let(
        {
          isNumber: q.IsNumber(value),
        },
        {
          value: value,
          valid: q.Var('isNumber'),
          sanitized: false,
          stop: q.Not(q.Var('isNumber')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('isNumber')),
              type: 'number',
              actual: helpers.TypeOf.response(value),
              expected: 'number',
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
          min: q.Select('min', options, null),
          hasMin: q.IsNumber(q.Var('min')),
          // ↓
          valid: q.If(q.Var('hasMin'), q.GTE(value, q.Var('min')), true),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'number_min',
              expected: q.Var('min'),
              actual: value,
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
          max: q.Select('max', options, null),
          hasMax: q.IsNumber(q.Var('max')),
          // ↓
          valid: q.If(q.Var('hasMax'), q.LTE(value, q.Var('max')), true),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'number_max',
              expected: q.Var('max'),
              actual: value,
            },
          ]),
        },
      );
    },
  },
  Equal: {
    name: 'Equal',
    before,
    query(value, options, state) {
      return q.Let(
        {
          optionsDefinition: options,
          hasEqual: q.Contains('equal', q.Var('optionsDefinition')),
          equal: q.Select('equal', q.Var('optionsDefinition'), null),
          // ↓
          valid: q.If(q.Var('hasEqual'), q.Equals(value, q.Var('equal')), true),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'number_equal',
              expected: q.Var('equal'),
              actual: value,
            },
          ]),
        },
      );
    },
  },
  NonEqual: {
    name: 'NonEqual',
    before,
    query(value, options, state) {
      return q.Let(
        {
          optionsDefinition: options,
          hasEqual: q.Contains('nonEqual', q.Var('optionsDefinition')),
          nonEqual: q.Select('nonEqual', q.Var('optionsDefinition'), null),
          // ↓
          valid: q.If(q.Var('hasEqual'), q.Not(q.Equals(value, q.Var('nonEqual'))), true),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'number_non_equal',
              expected: q.Var('nonEqual'),
              actual: value,
            },
          ]),
        },
      );
    },
  },
  Integer: {
    name: 'Integer',
    before,
    query(value, _, state) {
      return q.Let(
        {
          isInteger: q.IsInteger(value),
        },
        {
          value: value,
          valid: q.Var('isInteger'),
          sanitized: false,
          stop: q.Not(q.Var('isInteger')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('isInteger')),
              type: 'number_integer',
              actual: helpers.TypeOf.response(value),
              expected: 'integer',
            },
          ]),
        },
      );
    },
  },
  Double: {
    name: 'Double',
    before,
    query(value, _, state) {
      return q.Let(
        {
          isDouble: q.IsDouble(value),
        },
        {
          value: value,
          valid: q.Var('isDouble'),
          sanitized: false,
          stop: q.Not(q.Var('isDouble')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('isDouble')),
              type: 'number_double',
              actual: helpers.TypeOf.response(value),
              expected: 'double',
            },
          ]),
        },
      );
    },
  },
  Positive: {
    name: 'Positive',
    before,
    query(value, options, state) {
      return q.Let(
        {
          positive: q.Select('positive', options, null),
          hasPositive: q.IsNumber(q.Var('positive')),
          // ↓
          valid: q.If(q.Var('hasPositive'), q.GTE(value, 0), true),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'number_positive',
              expected: q.Var('positive'),
              actual: value,
            },
          ]),
        },
      );
    },
  },
  Negative: {
    name: 'Negative',
    before,
    query(value, options, state) {
      return q.Let(
        {
          negative: q.Select('negative', options, null),
          hasNegative: q.IsNumber(q.Var('negative')),
          // ↓
          valid: q.If(q.Var('hasNegative'), q.LT(value, 0), true),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'number_negative',
              expected: q.Var('negative'),
              actual: value,
            },
          ]),
        },
      );
    },
  },
  Trunc: {
    name: 'Trunc',
    before,
    query(value, options, state) {
      return q.Let(
        {
          optionsDefinition: options,
          trunc: q.Select('trunc', q.Var('optionsDefinition'), 0),
          hasTrunc: q.And(q.Contains('trunc', q.Var('optionsDefinition')), q.IsNumber(q.Var('trunc'))),
          // ↓
          updatedValue: q.If(q.Var('hasTrunc'), q.Trunc(value, q.Var('trunc')), value),
        },
        {
          value: q.Var('updatedValue'),
          valid: true,
          sanitized: q.Var('hasTrunc'),
        },
      );
    },
  },
});
