import { Builder, types } from '@biota/builder';
import { factory as helpers } from '@biota/helpers';
import { factory as error } from '@biota/error';
import { query as q } from 'faunadb';
import packagejson from './../../package.json';
import { any as anyFactory } from './any';
import { array as arrayFactory } from './array';
import { boolean as booleanFactory } from './boolean';
import { bytes as bytesFactory } from './bytes';
import { collection as collectionFactory } from './collection';
import { constructors } from './constructors';
import { credentials as credentialsFactory } from './credentials';
import { database as databaseFactory } from './database';
import { date as dateFactory } from './date';
import { document as documentFactory } from './document';
import { function_ as functionFactory } from './function';
import { index as indexFactory } from './index';
import { key as keyFactory } from './key';
import { lambda as lambdaFactory } from './lambda';
import { null_ as nullFactory } from './null';
import { number as numberFactory } from './number';
import { object as objectFactory } from './object';
import { reference as referenceFactory } from './reference';
import { role as roleFactory } from './role';
import { set as setFactory } from './set';
import { string as stringFactory } from './string';
import { time as timeFactory } from './time';
import { token as tokenFactory } from './token';
import { schema as schemaFactory } from './schema';

const build = new Builder({
  lib: 'biota.schema',
  version: packagejson.version,
  defaults: { params: ['value', 'options', 'state'], defaults: [null, {}, {}] },
});
export const validate: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Validate: {
    name: 'Validate',
    query(value, options, state) {
      return q.Let(
        {
          // hasValidate: q.Contains('validate', options),
          // stopIfNoValidateProp: q.Abort(hasValidate),
          // definition: constructors.FormatDefinition.response(q.Select('validate', options, null)),
          definition: constructors.FormatDefinition.response(options),
          hasValidDefinition: q.Not(q.IsNull(q.Var('definition'))),
          hasSchema: q.Contains('schema', q.Var('definition')),
          hasAnyOf: q.IsArray(q.Select('anyOf', q.Var('definition'), null)),
          anyOf: q.If(
            q.Var('hasAnyOf'),
            q.Map(
              q.Select('anyOf', q.Var('definition')),
              q.Lambda('def', constructors.FormatDefinition.response(q.Var('def'))),
            ),
            null,
          ),
          hasOneOf: q.IsArray(q.Select('oneOf', q.Var('definition'), null)),
          oneOf: q.If(
            q.Var('hasOneOf'),
            q.Map(
              q.Select('oneOf', q.Var('definition')),
              q.Lambda('def', constructors.FormatDefinition.response(q.Var('def'))),
            ),
            null,
          ),
          hasAllOf: q.IsArray(q.Select('allOf', q.Var('definition'), null)),
          allOf: q.If(
            q.Var('hasAllOf'),
            q.Map(
              q.Select('allOf', q.Var('definition')),
              q.Lambda('def', constructors.FormatDefinition.response(q.Var('def'))),
            ),
            null,
          ),
          // ↓
          definitions: q.Distinct(
            q.If(
              q.Var('hasAnyOf'),
              q.Var('anyOf'),
              q.If(q.Var('hasOneOf'), q.Var('oneOf'), q.If(q.Var('hasAllOf'), q.Var('allOf'), [])),
            ),
          ),
          // ↓
          result: q.If(
            q.IsEmpty(q.Var('definitions')),
            q.If(
              q.Var('hasValidDefinition'),
              q.If(
                q.Var('hasSchema'),
                validate.ValidateSingle.response(
                  value,
                  q.Merge(q.Var('definition'), {
                    type: 'schema',
                    schema: q.Select('schema', q.Var('definition'), {}),
                  }),
                  state,
                ),
                validate.ValidateSingle.response(value, q.Var('definition'), state),
              ),
              '//error',
            ),
            q.Let(
              {
                results: q.Map(
                  q.Var('definitions'),
                  q.Lambda(
                    'definitionIteration',
                    validate.ValidateSingle.response(value, q.Var('definitionIteration'), state),
                  ),
                ),
              },
              q.If(
                q.Var('hasAnyOf'),
                constructors.AnyOf.response(q.Var('results'), state),
                q.If(
                  q.Var('hasOneOf'),
                  constructors.OneOf.response(q.Var('results'), state),
                  q.If(q.Var('hasAllOf'), constructors.AllOf.response(q.Var('results'), state), null),
                ),
              ),
            ),
          ),
        },
        q.Var('result'),
      );
    },
  },
  ValidateThrow: {
    name: 'ValidateThrow',
    params: ['code', 'value', 'options', 'state'],
    defaults: [null, null, {}, {}],
    query(code, value, options, state) {
      return q.Let(
        {
          validation: validate.Validate.response(value, options, state),
          valid: q.If(
            q.Select('valid', q.Var('validation'), false),
            true,
            error.error.Throw.response(code, { value, options, validation: q.Var('validation') }),
          ),
        },
        true,
      );
    },
  },
  ValidateSingle: {
    name: 'ValidateSingle',
    query(value, options, state) {
      return q.Let(
        {
          definition: constructors.FormatDefinition.response(options),
          // ↓
          type: q.Select('type', q.Var('definition'), null),
          // ↓
          newState: q.Merge(state, {
            field: q.Select('field', state, null),
            // field: q.If(q.IsNull(q.Select('field', state, null)), 'Value', q.Select('field', state)),
          }),
          default: {
            value,
            valid: false,
            sanitized: false,
            errors: [],
          },
          result: q.If(
            q.IsString(q.Var('type')),
            q.If(
              q.Equals(q.Var('type'), 'schema'),
              schemaFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
              q.If(
                q.Equals(q.Var('type'), 'any'),
                anyFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
                q.If(
                  q.Equals(q.Var('type'), 'array'),
                  arrayFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
                  q.If(
                    q.Equals(q.Var('type'), 'boolean'),
                    booleanFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
                    q.If(
                      q.Equals(q.Var('type'), 'bytes'),
                      bytesFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
                      q.If(
                        q.Equals(q.Var('type'), 'collection'),
                        collectionFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
                        q.If(
                          q.Equals(q.Var('type'), 'credentials'),
                          credentialsFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
                          q.If(
                            q.Equals(q.Var('type'), 'database'),
                            databaseFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
                            q.If(
                              q.Equals(q.Var('type'), 'date'),
                              dateFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
                              q.If(
                                q.Equals(q.Var('type'), 'document'),
                                documentFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
                                q.If(
                                  q.Equals(q.Var('type'), 'function'),
                                  functionFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
                                  q.If(
                                    q.Equals(q.Var('type'), 'index'),
                                    indexFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
                                    q.If(
                                      q.Equals(q.Var('type'), 'key'),
                                      keyFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
                                      q.If(
                                        q.Equals(q.Var('type'), 'lambda'),
                                        lambdaFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
                                        q.If(
                                          q.Equals(q.Var('type'), 'null'),
                                          nullFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
                                          q.If(
                                            q.Equals(q.Var('type'), 'number'),
                                            numberFactory.Validate.response(
                                              value,
                                              q.Var('definition'),
                                              q.Var('newState'),
                                            ),
                                            q.If(
                                              q.Equals(q.Var('type'), 'object'),
                                              objectFactory.Validate.response(
                                                value,
                                                q.Var('definition'),
                                                q.Var('newState'),
                                              ),
                                              q.If(
                                                q.Equals(q.Var('type'), 'reference'),
                                                referenceFactory.Validate.response(
                                                  value,
                                                  q.Var('definition'),
                                                  q.Var('newState'),
                                                ),
                                                q.If(
                                                  q.Equals(q.Var('type'), 'role'),
                                                  roleFactory.Validate.response(
                                                    value,
                                                    q.Var('definition'),
                                                    q.Var('newState'),
                                                  ),
                                                  q.If(
                                                    q.Equals(q.Var('type'), 'set'),
                                                    setFactory.Validate.response(
                                                      value,
                                                      q.Var('definition'),
                                                      q.Var('newState'),
                                                    ),
                                                    q.If(
                                                      q.Equals(q.Var('type'), 'string'),
                                                      stringFactory.Validate.response(
                                                        value,
                                                        q.Var('definition'),
                                                        q.Var('newState'),
                                                      ),
                                                      q.If(
                                                        q.Equals(q.Var('type'), 'time'),
                                                        timeFactory.Validate.response(
                                                          value,
                                                          q.Var('definition'),
                                                          q.Var('newState'),
                                                        ),
                                                        q.If(
                                                          q.Equals(q.Var('type'), 'token'),
                                                          tokenFactory.Validate.response(
                                                            value,
                                                            q.Var('definition'),
                                                            q.Var('newState'),
                                                          ),
                                                          q.Var('default'),
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            // helpers.Switch.response(
            //   q.Var('type'),
            //   {
            //     schema: schemaFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     any: anyFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     array: arrayFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     boolean: booleanFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     bytes: bytesFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     collection: collectionFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     credentials: credentialsFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     database: databaseFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     date: dateFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     document: documentFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     function: functionFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     index: indexFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     key: keyFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     lambda: lambdaFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     null: nullFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     number: numberFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     object: objectFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     reference: referenceFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     role: roleFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     set: setFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     string: stringFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     time: timeFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //     token: tokenFactory.Validate.response(value, q.Var('definition'), q.Var('newState')),
            //   },
            //   {
            //     value,
            //     valid: false,
            //     sanitized: false,
            //     errors: [],
            //   },
            // ),
            q.Var('default'),
          ),
        },
        q.Var('result'),
      );
    },
  },
});
