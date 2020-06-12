import { Builder, types } from '@biota/builder';
import { factory as constants } from '@biota/constants';
import { factory as helpers } from '@biota/helpers';
import { query as q } from 'faunadb';
import { constructors } from './constructors';
import packagejson from './../../package.json';
import { default_ } from './default';

const build = new Builder({
  lib: 'biota.schema',
  version: packagejson.version,
  path: 'string',
  defaults: { params: ['value', 'options', 'state'], defaults: [null, {}, {}] },
});
const before = (_, options, __) => ({
  options: q.Merge(constructors.FormatDefinition.response(options), { type: 'string' }),
});
export const string: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Validate: {
    name: 'Validate',
    before,
    query(value, options, state) {
      return constructors.ComposeResolver.response(
        value,
        options,
        state,
        {
          default: default_.Default.udfName(),
          convert: string.Convert.udfName(),
          type: string.Type.udfName(),
          // tests
          empty: string.Empty.udfName(),
          min: string.Min.udfName(),
          max: string.Max.udfName(),
          length: string.Length.udfName(),
          pattern: string.Pattern.udfName(),
          contains: string.Contains.udfName(),
          enum: string.Enum.udfName(),
          notEnum: string.NotEnum.udfName(),
          numeric: string.Numeric.udfName(),
          alpha: string.Alpha.udfName(),
          alphanum: string.Alphanum.udfName(),
          alphadash: string.Alphadash.udfName(),
          startsWith: string.StartsWith.udfName(),
          endsWith: string.EndsWith.udfName(),

          // sanitizers
          trim: string.Trim.udfName(),
          trimStart: string.TrimStart.udfName(),
          trimEnd: string.TrimEnd.udfName(),
          padStart: string.PadStart.udfName(),
          padEnd: string.PadEnd.udfName(),
          lowercase: string.LowerCase.udfName(),
          uppercase: string.UpperCase.udfName(),
          capitalize: string.Capitalize.udfName(),
        },
        ['convert', 'default', 'type'],
      );
    },
  },
  Type: {
    name: 'Type',
    before,
    query(value, options, state) {
      return q.Let(
        {
          isString: q.IsString(value),
        },
        {
          value: value,
          valid: q.Var('isString'),
          stop: q.Not(q.Var('isString')),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('isString')),
              type: 'string',
              actual: helpers.TypeOf.response(value),
              expected: 'string',
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
          // ↓
          canConvertToString: helpers.CanConvertToString.response(value),
          // ↓
          updatedValue: q.If(q.And(q.Var('hasConvert'), q.Var('canConvertToString')), q.ToString(value), value),
          valid: q.If(q.Var('hasConvert'), q.Var('canConvertToString'), true),
        },
        {
          value: q.Var('updatedValue'),
          valid: q.Var('valid'),
          sanitized: q.Var('hasConvert'),
          stop: q.Not(q.Var('valid')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'string_convert',
            },
          ]),
        },
      );
    },
  },
  StartsWith: {
    name: 'StartsWith',
    before,
    query(value, options, state) {
      return q.Let(
        {
          startsWith: q.Select('startsWith', options, null),
          hasStartsWith: q.IsString(q.Var('startsWith')),
          // ↓
          valid: q.If(q.Var('hasStartsWith'), q.StartsWith(value, q.Var('startsWith')), true),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'string_starts_with',
              expected: q.Var('startsWith'),
            },
          ]),
        },
      );
    },
  },
  EndsWith: {
    name: 'EndsWith',
    before,
    query(value, options, state) {
      return q.Let(
        {
          endsWith: q.Select('endsWith', options, null),
          hasEndsWith: q.IsString(q.Var('endsWith')),
          // ↓
          valid: q.If(q.Var('hasEndsWith'), q.EndsWith(value, q.Var('endsWith')), true),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'string_ends_with',
              expected: q.Var('endsWith'),
            },
          ]),
        },
      );
    },
  },
  Trim: {
    name: 'Trim',
    before,
    query(value, options, state) {
      return q.Let(
        {
          hasTrim: q.Select('trim', options, false),
          // ↓
          updatedValue: q.If(q.Var('hasTrim'), q.Trim(value), value),
        },
        {
          value: q.Var('updatedValue'),
          valid: true,
          sanitized: q.Var('hasTrim'),
        },
      );
    },
  },
  TrimStart: {
    name: 'TrimStart',
    before,
    query(value, options, state) {
      return q.Let(
        {
          TRIM_LEFT: q.Select('TRIM_LEFT', constants.constants.Patterns.response(), null),
          hasTrimStart: q.Select('trimStart', options, false),
          // ↓
          updatedValue: q.If(q.Var('hasTrimStart'), q.ReplaceStrRegex(value, q.Var('TRIM_LEFT'), ''), value),
        },
        {
          value: q.Var('updatedValue'),
          valid: true,
          sanitized: q.Var('hasTrimStart'),
        },
      );
    },
  },
  TrimEnd: {
    name: 'TrimEnd',
    before,
    query(value, options, state) {
      return q.Let(
        {
          TRIM_RIGHT: q.Select('TRIM_RIGHT', constants.constants.Patterns.response(), null),
          hasTrimEnd: q.Select('trimEnd', options, false),
          // ↓
          updatedValue: q.If(q.Var('hasTrimEnd'), q.ReplaceStrRegex(value, q.Var('TRIM_RIGHT'), ''), value),
        },
        {
          value: q.Var('updatedValue'),
          valid: true,
          sanitized: q.Var('hasTrimEnd'),
        },
      );
    },
  },
  PadStart: {
    name: 'PadStart',
    before,
    query(value, options, state) {
      return q.Let(
        {
          padStart: q.Select('padStart', options, null),
          padChar: q.Select('padChar', options, ' '),
          hasPadStart: q.IsNumber(q.Var('padStart')),
          // ↓
          updatedValue: q.If(
            q.Var('hasPadStart'),
            q.Concat([q.Repeat(q.Var('padChar'), q.Var('padStart')), value], ''),
            value,
          ),
        },
        {
          value: q.Var('updatedValue'),
          valid: true,
          sanitized: q.Var('hasPadStart'),
        },
      );
    },
  },
  PadEnd: {
    name: 'PadEnd',
    before,
    query(value, options, state) {
      return q.Let(
        {
          padEnd: q.Select('padEnd', options, null),
          padChar: q.Select('padChar', options, ' '),
          hasPadEnd: q.IsNumber(q.Var('padEnd')),
          // ↓
          updatedValue: q.If(
            q.Var('hasPadEnd'),
            q.Concat([q.Repeat(q.Var('padChar'), q.Var('padEnd')), value], ''),
            value,
          ),
        },
        {
          value: q.Var('updatedValue'),
          valid: true,
          sanitized: q.Var('hasPadEnd'),
        },
      );
    },
  },
  LowerCase: {
    name: 'LowerCase',
    before,
    query(value, options, state) {
      return q.Let(
        {
          hasLowercase: q.Select('lowercase', options, false),
          // ↓
          updatedValue: q.If(q.Var('hasLowercase'), q.LowerCase(value), value),
        },
        {
          value: q.Var('updatedValue'),
          valid: true,
          sanitized: q.Var('hasLowercase'),
        },
      );
    },
  },
  UpperCase: {
    name: 'UpperCase',
    before,
    query(value, options, state) {
      return q.Let(
        {
          hasUppercase: q.Select('uppercase', options, false),
          // ↓
          updatedValue: q.If(q.Var('hasUppercase'), q.UpperCase(value), value),
        },
        {
          value: q.Var('updatedValue'),
          valid: true,
          sanitized: q.Var('hasUppercase'),
        },
      );
    },
  },
  Capitalize: {
    name: 'Capitalize',
    before,
    query(value, options, state) {
      return q.Let(
        {
          hasCapitalize: q.Select('capitalize', options, false),
          // ↓
          updatedValue: q.If(q.Var('hasCapitalize'), q.TitleCase(value), value),
        },
        {
          value: q.Var('updatedValue'),
          valid: true,
          sanitized: q.Var('hasCapitalize'),
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
          hasEmpty: q.Contains('empty', options),
          empty: q.Select('empty', options, false),
          // ↓
          valid: q.If(
            q.Var('hasEmpty'),
            q.If(q.Var('empty'), q.Equals(q.Length(value), 0), q.GT(q.Length(value), 0)),
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
              type: q.If(q.Var('empty'), 'string_empty', 'string_non_empty'),
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
          valid: q.If(q.Var('hasMin'), q.GTE(q.Length(value), q.Var('min')), true),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'string_min',
              expected: q.Var('min'),
              actual: q.Length(value),
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
          hasMaxChars: q.IsNumber(q.Var('max')),
          // ↓
          valid: q.If(q.Var('hasMaxChars'), q.LTE(q.Length(value), q.Var('max')), true),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'string_max',
              expected: q.Var('max'),
              actual: q.Length(value),
            },
          ]),
        },
      );
    },
  },
  Length: {
    name: 'Length',
    before,
    query(value, options, state) {
      return q.Let(
        {
          length: q.Select('length', options, null),
          hasLength: q.IsNumber(q.Var('length')),
          // ↓
          isOfLength: q.If(q.Var('hasLength'), q.Equals(q.Length(value), q.Var('length')), true),
          // ↓
          valid: q.Var('isOfLength'),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('isOfLength')),
              type: 'string_length',
              expected: q.Var('length'),
              actual: q.Length(value),
            },
          ]),
        },
      );
    },
  },
  Pattern: {
    name: 'Pattern',
    before,
    query(value, options, state) {
      return q.Let(
        {
          pattern: q.Select('pattern', options, null),
          // ↓
          hasPattern: q.IsString(q.Var('pattern')),
          // ↓
          valid: q.If(q.Var('hasPattern'), q.GT(q.Count(q.FindStrRegex(value, q.Var('pattern'))), 0), true),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'string_pattern',
            },
          ]),
        },
      );
    },
  },
  Contains: {
    name: 'Contains',
    before,
    query(value, options, state) {
      return q.Let(
        {
          contains: q.Select('contains', options, null),
          hasContains: q.IsString(q.Var('contains')),
          // ↓
          valid: q.If(q.Var('hasContains'), q.GT(q.FindStr(value, q.Var('contains')), -1), true),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'string_contains',
              expected: q.Var('contains'),
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
          enum: q.Select('enum', options, null),
          hasEnum: q.If(
            q.IsArray(q.Var('enum')),
            q.All(q.Map(q.Var('enum'), q.Lambda('item', q.IsString(q.Var('item'))))),
            false,
          ),
          // ↓
          valid: q.If(q.Var('hasEnum'), helpers.ArrayContains.response(q.Var('enum'), value), true),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'string_enum',
              expected: q.Var('enum'),
              actual: value,
            },
          ]),
        },
      );
    },
  },
  NotEnum: {
    name: 'NotEnum',
    before,
    query(value, options, state) {
      return q.Let(
        {
          notEnum: q.Select('notEnum', options, null),
          hasEnum: q.If(
            q.IsArray(q.Var('notEnum')),
            q.All(q.Map(q.Var('notEnum'), q.Lambda('item', q.IsString(q.Var('item'))))),
            false,
          ),
          // ↓
          valid: q.If(q.Var('hasEnum'), q.Not(helpers.ArrayContains.response(q.Var('notEnum'), value)), true),
        },
        {
          value: value,
          valid: q.Var('valid'),
          sanitized: false,
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('valid')),
              type: 'string_not_enum',
              expected: q.Var('notEnum'),
              actual: value,
            },
          ]),
        },
      );
    },
  },
  Numeric: {
    name: 'Numeric',
    before,
    query(value, options, state) {
      return q.Let(
        {
          hasNumeric: q.Contains('numeric', options),
          numeric: q.Select('numeric', options, false),
          // ↓
          valid: q.If(
            q.Var('hasNumeric'),
            q.Let(
              {
                matches: q.Length(q.ToString(q.ToNumber(value))),
              },
              q.If(q.Var('numeric'), q.GT(q.Var('matches'), 0), q.Equals(q.Var('matches'), 0)),
            ),
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
              type: 'string_numeric',
            },
          ]),
        },
      );
    },
  },
  Alpha: {
    name: 'Alpha',
    before,
    query(value, options, state) {
      return q.Let(
        {
          ALPHA: q.Select('ALPHA', constants.constants.Patterns.response(), null),
          hasAlpha: q.Contains('alpha', options),
          alpha: q.Select('alpha', options, false),
          // ↓
          valid: q.If(
            q.Var('hasAlpha'),
            q.Let(
              {
                matches: q.Count(q.FindStrRegex(value, q.Var('ALPHA'))),
              },
              q.If(q.Var('alpha'), q.GT(q.Var('matches'), 0), q.Equals(q.Var('matches'), 0)),
            ),
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
              type: 'string_alpha',
            },
          ]),
        },
      );
    },
  },
  Alphanum: {
    name: 'Alphanum',
    before,
    query(value, options, state) {
      return q.Let(
        {
          ALPHANUM: q.Select('ALPHANUM', constants.constants.Patterns.response(), null),
          hasAlphanum: q.Contains('alphanum', options),
          alphanum: q.Select('alphanum', options, false),
          // ↓
          valid: q.If(
            q.Var('hasAlphanum'),
            q.Let(
              {
                matches: q.Count(q.FindStrRegex(value, q.Var('ALPHANUM'))),
              },
              q.If(q.Var('alphanum'), q.GT(q.Var('matches'), 0), q.Equals(q.Var('matches'), 0)),
            ),
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
              type: 'string_alphanum',
            },
          ]),
        },
      );
    },
  },
  Alphadash: {
    name: 'Alphadash',
    before,
    query(value, options, state) {
      return q.Let(
        {
          ALPHADASH: q.Select('ALPHADASH', constants.constants.Patterns.response(), null),
          hasAlphadash: q.Contains('alphadash', options),
          alphadash: q.Select('alphadash', options, false),
          // ↓
          valid: q.If(
            q.Var('hasAlphadash'),
            q.Let(
              {
                matches: q.Count(q.FindStrRegex(value, q.Var('ALPHADASH'))),
              },
              q.If(q.Var('alphadash'), q.GT(q.Var('matches'), 0), q.Equals(q.Var('matches'), 0)),
            ),
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
              type: 'string_alphadash',
            },
          ]),
        },
      );
    },
  },
});
