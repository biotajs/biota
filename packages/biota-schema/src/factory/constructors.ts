import { Builder, types } from '@biota/builder';
import { factory as constants } from '@biota/constants';
import { factory as helpers } from '@biota/helpers';
import { query as q } from 'faunadb';
import packagejson from './../../package.json';
import { templates } from './templates';

const build = new Builder({ lib: 'biota.schema', version: packagejson.version, path: 'constructors' });
export const constructors: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  FormatDefinition: {
    name: 'FormatDefinition',
    params: ['definition'],
    defaults: [{}],
    query(definition) {
      return q.Let(
        {
          definition,
        },
        q.If(
          q.IsObject(q.Var('definition')),
          q.Var('definition'),
          q.If(
            q.IsArray(q.Var('definition')),
            q.Map(q.Var('definition'), q.Lambda('def', constructors.FormatDefinition.response(q.Var('def')))),
            q.If(
              q.IsString(q.Var('definition')),
              q.If(
                q.GT(q.Length(q.Var('definition')), 0),
                q.Let(
                  {
                    splitted: helpers.StringSplit.response(q.Trim(q.Var('definition')), '|'),
                    firstItem: q.Select(0, q.Var('splitted'), ''),
                    Types: q.Map(
                      q.ToArray(constants.constants.Types.response()),
                      q.Lambda(['key', 'v'], q.Var('key')),
                    ),
                    firstItemIsType: helpers.ArrayContains.response(q.Var('Types'), q.Var('firstItem')),
                    type: q.If(q.Var('firstItemIsType'), q.Var('firstItem'), null),
                    keyValues: q.Map(
                      q.If(
                        q.IsNull(q.Var('type')),
                        q.Var('splitted'),
                        helpers.Slice.response(q.Var('splitted'), 1),
                      ),
                      q.Lambda(
                        'item',
                        // q.Abort(q.Format('%@', { item: StringSplit(q.Var('item'), ':') })),
                        q.Let(
                          { keyValue: helpers.StringSplit.response(q.Var('item'), ':') },
                          q.If(
                            q.LT(q.Count(q.Var('keyValue')), 2),
                            [q.Select(0, q.Var('keyValue')), true],
                            [
                              q.Select(0, q.Var('keyValue')),
                              q.Let(
                                {
                                  value: q.Select(1, q.Var('keyValue'), null),
                                  // a: q.Abort(q.Format('%@', { value: q.Var('value') })),
                                  numberCast: helpers.ConvertToNumber.response(q.Var('value')),
                                },
                                q.If(q.Not(q.IsNull(q.Var('numberCast'))), q.Var('numberCast'), q.Var('value')),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    //ab: q.Abort(q.Format('%@', { definition, type: q.Var('type'), firstItemIsType: q.Var('firstItemIsType') })),
                    // ab: q.Abort(q.Format('%@', { keyValues: q.If(q.IsNull(q.Var('type')), q.Var('splitted'), Slice(q.Var('splitted'), 1)) })),
                  },
                  q.Reduce(
                    q.Lambda(
                      ['objectDefinition', 'keyValue'],
                      q.Merge(q.Var('objectDefinition'), q.ToObject([q.Var('keyValue')])),
                    ),
                    { type: q.Var('type') },
                    q.Var('keyValues'),
                  ),
                ),
                q.If(q.IsBoolean(q.Var('definition')), q.If(q.Var('definition'), {}, false), {}),
              ),
              q.If(q.IsBoolean(q.Var('definition')), q.If(q.Var('definition'), {}, false), {}),
            ),
          ),
        ),
      );
    },
  },
  FormatErrors: {
    name: 'FormatErrors',
    params: ['state', 'errors'],
    defaults: [{}, []],
    query(state, errors) {
      return q.Let(
        {
          state,
        },
        q.Reduce(
          q.Lambda(
            ['errors', 'error'],
            q.If(
              q.Select('wrong', q.Var('error'), false),
              q.Let(
                {
                  FALSE_EXPR: q.Select('FALSE_EXPR', constants.constants.Strings.response(), null),
                  type: q.Select('type', q.Var('error'), ''),
                  expected: q.Select('expected', q.Var('error'), q.Var('FALSE_EXPR')),
                  actual: q.Select('actual', q.Var('error'), q.Var('FALSE_EXPR')),
                  field: q.Select('field', q.Var('state'), ''),
                  language: q.Select('language', q.Var('state'), 'en'),
                  identifier: q.If(
                    q.GT(q.FindStr(q.Var('field'), '.'), -1),
                    q.ReplaceStr(
                      templates.Messages.response('_field_identifier', { language: q.Var('language') }),
                      '{field}',
                      q.Var('field'),
                    ),
                    templates.Messages.response('_default_identifier', { language: q.Var('language') }),
                  ),
                  filledMessage: templates.Messages.response(
                    q.Var('type'),
                    { language: q.Var('language') },
                    {
                      '{field}': q.Var('field'),
                      '{identifier}': q.Var('identifier'),
                      '{expected}': q.Var('expected'),
                      '{actual}': q.Var('actual'),
                    },
                  ),
                },
                q.Append(
                  [
                    {
                      type: q.Var('type'),
                      expected: q.If(q.Not(helpers.IsFalse.response(q.Var('expected'))), q.Var('expected'), null),
                      actual: q.If(q.Not(helpers.IsFalse.response(q.Var('actual'))), q.Var('actual'), null),
                      field: q.If(q.Not(helpers.IsFalse.response(q.Var('field'))), q.Var('field'), null),
                      message: q.Var('filledMessage'),
                    },
                  ],
                  q.Var('errors'),
                ),
              ),
              q.Var('errors'),
            ),
          ),
          [],
          errors,
        ),
      );
    },
  },
  ArrayComposeResolver: {
    name: 'ArrayComposeResolver',
    params: ['keyValues', 'itemsOptions', 'state', 'UDFsNameMapping', 'firstTests', 'filteredProperties'],
    defaults: [null, {}, {}, {}, [], []],
    query(keyValues, itemsOptions, state, UDFsNameMapping, firstTests, filteredProperties) {
      return q.Reduce(
        q.Lambda(['reduced', 'step'], {
          value: q.Let(
            {
              key: q.Select(['state', 'key'], q.Var('step'), null),
            },
            q.If(
              q.And(q.IsNumber(q.Var('key')), q.IsArray(q.Select('value', q.Var('reduced'), []))),
              q.Append([q.Select('value', q.Var('step'), null)], q.Select('value', q.Var('reduced'), [])),
              q.If(
                q.And(q.IsString(q.Var('key')), q.IsObject(q.Select('value', q.Var('reduced'), {}))),
                q.Merge(
                  q.Select('value', q.Var('reduced'), {}),
                  q.ToObject([[q.Var('key'), q.Select('value', q.Var('step'), null)]]),
                ),
                q.Select('value', q.Var('reduced'), {}),
              ),
            ),
          ),
          valid: q.And(q.Select('valid', q.Var('step'), false), q.Select('valid', q.Var('reduced'), false)),
          sanitized: q.Or(q.Select('sanitized', q.Var('step'), false), q.Select('sanitized', q.Var('reduced'), false)),
          errors: q.Append(q.Select('errors', q.Var('step'), []), q.Select('errors', q.Var('reduced'), [])),
        }),
        {
          value: q.If(q.Select('object', state, false), {}, []),
          valid: true,
          sanitized: false,
          errors: [],
        },
        q.Map(
          helpers.ArrayIndexed.response(keyValues),
          q.Lambda(
            ['index', 'keyItem'],
            q.Let(
              {
                key: q.Select(0, q.Var('keyItem'), null),
                item: q.Select(1, q.Var('keyItem'), null),
              },
              constructors.ComposeResolver.response(
                q.Var('item'),
                q.Let(
                  { state, itemsOptions },
                  constructors.FormatDefinition.response(
                    q.If(
                      q.Not(q.Select('object', q.Var('state'), false)),
                      q.If(
                        q.IsArray(q.Var('itemsOptions')),
                        q.Select(q.Var('index'), q.Var('itemsOptions'), {}),
                        q.Var('itemsOptions'),
                      ),
                      q.Select(q.Var('key'), q.Var('itemsOptions'), {}),
                    ),
                  ),
                ),
                q.Merge(state, {
                  key: q.Var('key'),
                  field: q.Concat([q.Select('field', q.Var('state'), 'Value'), q.ToString(q.Var('key'))], '.'),
                }),
                UDFsNameMapping,
                firstTests,
                filteredProperties,
              ),
            ),
          ),
        ),
      );
    },
  },
  ComposeResolver: {
    name: 'ComposeResolver',
    params: ['value', 'options', 'state', 'UDFsNameMapping', 'firstTests', 'filteredProperties'],
    defaults: [null, {}, {}, {}, [], []],
    query(value, options, state, UDFsNameMapping, firstTests, filteredProperties) {
      return q.Let(
        {
          // ab: q.If(q.Equals(value, 1), q.Abort(q.Format('%@', { value, options, UDFsNameMapping })), null),
          UDFsNameMapping,
          tests: q.Filter(
            q.Distinct(q.Prepend(firstTests, q.Map(q.ToArray(options), q.Lambda(['key', 'value'], q.Var('key'))))),
            q.Lambda(
              'test',
              q.Equals(
                helpers.ArrayContains.response(
                  q.Distinct(q.Append(filteredProperties, ['description'])),
                  q.Var('test'),
                ),
                false,
              ),
            ),
          ),
        },
        q.Reduce(
          q.Lambda(
            ['reduced', 'test'],
            q.If(
              // q.And(
              q.Equals(q.Not(q.Select(['state', 'stop'], q.Var('reduced'), false)), true),
              // q.Equals(helpers.ArrayContains.response(filteredProperties, q.Var('test')), false),
              // ),
              q.Let(
                {
                  UDFName: q.Select(q.Var('test'), q.Var('UDFsNameMapping'), null),
                  hasValidName: q.IsString(q.Var('UDFName')),
                  UDFExists: q.If(q.Var('hasValidName'), q.Exists(q.Function(q.Var('UDFName'))), false),
                },
                q.If(
                  q.Var('UDFExists'),
                  q.Let(
                    {
                      result: q.Select(
                        'response',
                        q.Call(q.Var('UDFName'), q.Var('ctx'), {
                          value: q.Select('value', q.Var('reduced'), null),
                          options: q.Select('options', q.Var('reduced'), {}),
                          state: q.Select('state', q.Var('reduced'), {}),
                        }),
                        {},
                      ),

                      valid: q.And(
                        q.Select('valid', q.Var('result'), false),
                        q.Select('valid', q.Var('reduced'), false),
                      ),
                    },
                    {
                      value: q.Select('value', q.Var('result'), null),
                      valid: q.Var('valid'),
                      sanitized: q.Or(
                        q.Select('sanitized', q.Var('result'), false),
                        q.Select('sanitized', q.Var('reduced'), false),
                      ),
                      errors: q.Append(
                        q.Select('errors', q.Var('result'), []),
                        q.Select('errors', q.Var('reduced'), []),
                      ),
                      options: q.Select('options', q.Var('reduced'), {}),
                      state: q.Merge(q.Select('state', q.Var('reduced'), {}), {
                        stop: q.Let(
                          {
                            full: q.Select(['state', 'full'], q.Var('reduced'), true),
                            stop: q.Select('stop', q.Var('result'), false),
                          },
                          // Stop if in full mode when test isn't valid
                          q.If(q.Var('stop'), true, q.And(q.Not(q.Var('valid')), q.Not(q.Var('full')))),
                        ),
                      }),
                    },
                  ),
                  q.Merge(q.Var('reduced'), {
                    valid: false,
                    errors: q.Append(
                      constructors.FormatErrors.response(q.Select('state', q.Var('reduced'), {}), [
                        {
                          wrong: true,
                          type: 'udfunction_missing_for_test',
                          expected: q.Var('test'),
                        },
                      ]),
                      q.Select('errors', q.Var('reduced'), []),
                    ),
                  }),
                ),
              ),
              q.Var('reduced'),
            ),
          ),
          {
            value,
            options,
            state: q.Merge({ stop: false }, state),
            valid: true,
            sanitized: false,
            errors: [],
          },
          q.Var('tests'),
        ),
      );
    },
  },
  AllOf: {
    name: 'AllOf',
    params: ['results', 'state'],
    defaults: [[], {}],
    query(results, state) {
      return q.Let(
        {
          results,
          invalidResult: q.Filter(
            q.Var('results'),
            q.Lambda('result', q.Equals(q.Select('valid', q.Var('result'), false), false)),
          ),
          hasInvalidResults: q.Not(q.IsEmpty(q.Var('invalidResult'))),
        },
        q.Reduce(
          q.Lambda(['reduced', 'result'], {
            value: q.Select('value', q.Var('result'), q.Select('value', q.Var('reduced'), null)),
            valid: false,
            sanitized: q.Or(
              q.Select('sanitized', q.Var('result'), false),
              q.Select('sanitized', q.Var('reduced'), false),
            ),
            errors: q.Append(q.Select('errors', q.Var('result'), []), q.Select('errors', q.Var('reduced'), [])),
          }),
          {
            value: null,
            valid: false,
            sanitized: false,
            errors: q.If(
              q.Not(q.Var('hasInvalidResults')),
              constructors.FormatErrors.response(state, [
                {
                  wrong: true,
                  type: 'allof_none',
                },
              ]),
              [],
            ),
          },
          q.Var('results'),
        ),
      );
    },
  },
  AnyOf: {
    name: 'AnyOf',
    params: ['results', 'state'],
    defaults: [[], {}],
    query(results, state) {
      return q.Let(
        {
          results,
          validResult: q.Select(
            0,
            q.Filter(q.Var('results'), q.Lambda('result', q.Select('valid', q.Var('result'), false))),
            null,
          ),
          hasValidResult: q.Not(q.IsNull(q.Var('validResult'))),
        },
        q.If(
          q.Var('hasValidResult'),
          q.Var('validResult'),
          q.Reduce(
            q.Lambda(['reduced', 'result'], {
              value: q.Select('value', q.Var('result'), q.Select('value', q.Var('reduced'), null)),
              valid: false,
              sanitized: q.Or(
                q.Select('sanitized', q.Var('result'), false),
                q.Select('sanitized', q.Var('reduced'), false),
              ),
              errors: q.Append(q.Select('errors', q.Var('result'), []), q.Select('errors', q.Var('reduced'), [])),
            }),
            {
              value: null,
              valid: false,
              sanitized: false,
              errors: constructors.FormatErrors.response(state, [
                {
                  wrong: true,
                  type: 'anyof_none',
                },
              ]),
            },
            q.Var('results'),
          ),
        ),
      );
    },
  },
  OneOf: {
    name: 'OneOf',
    params: ['results', 'state'],
    defaults: [[], {}],
    query(results, state) {
      return q.Let(
        {
          results,
          validResults: q.Filter(q.Var('results'), q.Lambda('result', q.Select('valid', q.Var('result'), false))),
          validResult: q.Select(0, q.Var('validResults'), null),
          hasOnlyOneValidResult: q.Equals(q.Count(q.Var('validResults')), 1),
          hasMoreThanOneValidResult: q.GT(q.Count(q.Var('validResults')), 1),
        },
        q.If(
          q.Var('hasOnlyOneValidResult'),
          q.Var('validResult'),
          q.Reduce(
            q.Lambda(['reduced', 'result'], {
              value: q.Select('value', q.Var('result'), q.Select('value', q.Var('reduced'), null)),
              valid: false,
              sanitized: q.Or(
                q.Select('sanitized', q.Var('result'), false),
                q.Select('sanitized', q.Var('reduced'), false),
              ),
              errors: q.Append(q.Select('errors', q.Var('result'), []), q.Select('errors', q.Var('reduced'), [])),
            }),
            {
              value: null,
              valid: false,
              sanitized: false,
              errors: constructors.FormatErrors.response(state, [
                {
                  wrong: true,
                  type: q.If(q.Var('hasMoreThanOneValidResult'), 'oneof_too_many', 'oneof_none'),
                },
              ]),
            },
            q.Var('results'),
          ),
        ),
      );
    },
  },
});
