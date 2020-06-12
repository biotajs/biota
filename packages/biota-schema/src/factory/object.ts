import { Builder, types } from '@biota/builder';
import { factory as helpers } from '@biota/helpers';
import { query as q } from 'faunadb';
import packagejson from './../../package.json';
import { constructors } from './constructors';
import { default_ } from './default';

const filteredProperties = ['optional', 'optionals', 'allowAdditionals', 'allOptionals', 'allDeepOptionals'];

const build = new Builder({
  lib: 'biota.schema',
  version: packagejson.version,
  path: 'object',
  defaults: { params: ['value', 'options', 'state'], defaults: [null, {}, {}] },
});
const before = (_, options, __) => ({
  options: q.Merge(constructors.FormatDefinition.response(options), { type: 'object' }),
});
export const object: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
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
          type: object.Type.udfName(),
          properties: object.Properties.udfName(),
        },
        ['default', 'type'],
        filteredProperties,
      );
    },
  },
  Type: {
    name: 'Type',
    before,
    query(value, _, state) {
      return q.Let(
        {
          isObject: q.IsObject(value),
        },
        {
          value: value,
          valid: q.Var('isObject'),
          sanitized: false,
          stop: q.Not(q.Var('isObject')),
          errors: constructors.FormatErrors.response(state, [
            {
              wrong: q.Not(q.Var('isObject')),
              type: 'object',
              actual: helpers.TypeOf.response(value),
              expected: 'object',
            },
          ]),
        },
      );
    },
  },
  Properties: {
    name: 'Properties',
    before,
    query(value, options, state) {
      return q.Let(
        {
          properties: q.Select('properties', options, {}),
          // ↓
          hasProperties: q.IsObject(q.Var('properties')),
          // ↓
          allowAdditionals: q.Select('allowAdditionals', options, false),
          optionals: q.Select('optionals', options, false),
          deepOptionals: q.Equals(q.Var('optionals'), '*/**'),
          allOptionals: q.Or(
            q.Select('optionals', state, false),
            q.Var('deepOptionals'),
            q.Equals(q.Var('optionals'), '*'),
          ),
          // ↓
          requiredFields: q.Select('required', options, null),
          hasRequiredFields: q.IsArray(q.Var('requiredFields')),
          // ↓
          newState: q.Merge(state, {
            object: true,
            optionals: q.Var('deepOptionals'),
          }),
          // ↓
          // ab: q.Abort(
          //   q.Format('%@', {
          //     hasProperties: q.Var('hasProperties'),
          //     generalDefinition: q.Var('generalDefinition'),
          //     propertiesDefinition: q.Var('propertiesDefinition'),
          //   }),
          // ),
          propertiesKeys: q.If(
            q.Var('hasProperties'),
            q.Map(q.ToArray(q.Var('properties')), q.Lambda(['key', 'value'], q.Var('key'))),
            [],
          ),
          // ↓
          objectArray: q.ToArray(value),
          objectKeys: q.Map(q.Var('objectArray'), q.Lambda(['key', 'value'], q.Var('key'))),
          // ↓
          checkedObjectArray: q.If(
            q.Var('hasProperties'),
            q.Filter(
              q.Var('objectArray'),
              q.Lambda(
                ['key', 'value'],
                q.Let(
                  {
                    keyIsntDefined: q.Not(helpers.ArrayContains.response(q.Var('objectKeys'), q.Var('key'))),
                  },
                  q.If(
                    q.And(q.Equals(q.Var('allowAdditionals'), 'remove'), q.Var('keyIsntDefined')),
                    // remove
                    false,
                    q.If(
                      q.And(q.Equals(q.Var('allowAdditionals'), true), q.Var('keyIsntDefined')),
                      // throw errors
                      false,
                      // do nothing
                      true,
                    ),
                  ),
                ),
              ),
            ),
            q.Var('objectArray'),
          ),
          // ↓
          forbiddenKeys: q.If(
            q.Var('hasProperties'),
            q.Map(
              q.Filter(
                q.Var('checkedObjectArray'),
                q.Lambda(
                  ['key', 'value'],
                  q.And(
                    q.Equals(q.Var('allowAdditionals'), false),
                    q.Not(helpers.ArrayContains.response(q.Var('propertiesKeys'), q.Var('key'))),
                  ),
                ),
              ),
              q.Lambda(['key', 'value'], q.Var('key')),
            ),
            [],
          ),
          hasForbiddenKeys: q.IsNonEmpty(q.Var('forbiddenKeys')),
          // ↓
          missingKeys: q.If(q.Var('hasProperties'), q.Difference(q.Var('propertiesKeys'), q.Var('objectKeys')), []),
          requiredMissingKeys: q.Filter(
            q.Var('missingKeys'),
            q.Lambda(
              'missingKey',
              q.Not(
                q.Or(q.Var('allOptionals'), q.Select([q.Var('missingKey'), 'optional'], q.Var('properties'), false)),
              ),
            ),
          ),
          // ab: q.Abort(
          //   q.Format('%@', { properties: q.Var('properties'), missingKeys: q.Var('missingKeys'), requiredMissingKeys: q.Var('requiredMissingKeys') }),
          // ),
          missingOptionalKeys: q.Difference(q.Var('missingKeys'), q.Var('requiredMissingKeys')),
          hasRequiredMissingKeys: q.IsNonEmpty(q.Var('requiredMissingKeys')),
          // ↓
          /**
           * {Optional}
           * Make sure that we keep the optional value when a field isn't there
           */
          defaultObjectFromMissingOptionalKeys: q.Reduce(
            q.Lambda(
              ['reduced', 'key'],
              q.If(
                q.Contains([q.Var('key'), 'default'], q.Var('properties')),
                q.Merge(
                  q.Var('reduced'),
                  q.ToObject([[q.Var('key'), q.Select([q.Var('key'), 'default'], q.Var('properties'))]]),
                ),
                q.Var('reduced'),
              ),
            ),
            {},
            q.Var('missingOptionalKeys'),
          ),
          // ↓
          // propertiesForValidation: q.ToObject(
          //   q.Map(
          //     q.ToArray(q.Var('properties')),
          //     q.Lambda(
          //       ['key', 'value'],
          //       [
          //         q.Var('key'),
          //         q.If(q.Contains('validate', q.Var('value')), q.Var('value'), { validate: q.Var('value') }),
          //       ],
          //     ),
          //   ),
          // ),
          // ↓
          checkedObjectArrayWithDefaults: q.Prepend(
            q.Var('checkedObjectArray'),
            q.ToArray(q.Var('defaultObjectFromMissingOptionalKeys')),
          ),
          // ab: q.Abort(q.Format('%@', { checkedObjectArrayWithDefaults: q.Var('checkedObjectArrayWithDefaults') })),
          // ↓
          result: q.If(
            q.And(
              q.Equals(q.Var('hasProperties'), true),
              q.Not(q.Var('hasForbiddenKeys')),
              q.Not(q.Var('hasRequiredMissingKeys')),
            ),
            constructors.ArrayComposeResolver.response(
              q.Var('checkedObjectArrayWithDefaults'),
              q.Var('properties'),
              q.Var('newState'),
              filteredProperties,
            ),
            {
              valid: q.And(
                q.Var('hasProperties'),
                q.Not(q.Var('hasForbiddenKeys')),
                q.Not(q.Var('hasRequiredMissingKeys')),
              ),
            },
          ),
          // ab: q.Abort(
          //   q.Format('%@', {
          //     objectKeys: q.Var('objectKeys'),
          //     checkedObjectArray: q.Var('checkedObjectArray'),
          //     propertiesDefinition: q.Var('propertiesDefinition'),
          //     hasProperties: q.Var('hasProperties'),
          //     hasForbiddenKeys: q.Var('hasForbiddenKeys'),
          //     hasRequiredMissingKeys: q.Var('hasRequiredMissingKeys'),
          //   }),
          // ),
          // ab: q.Abort(q.Format('%@', { result: q.Var('result') })),
          valid: q.Select('valid', q.Var('result'), false),
          errors: q.Select('errors', q.Var('result'), []),
        },
        {
          value: q.Select('value', q.Var('result'), q.Var('value')),
          valid: q.Var('valid'),
          sanitized: false,
          errors: q.Append(
            constructors.FormatErrors.response(
              q.Var('newState'),
              q.Append(
                q.Append(
                  q.Map(
                    q.Var('forbiddenKeys'),
                    q.Lambda('forbiddenKey', {
                      wrong: true,
                      type: 'object_forbidden_key',
                      actual: q.Var('forbiddenKey'),
                    }),
                  ),
                  q.Map(
                    q.Var('requiredMissingKeys'),
                    q.Lambda('requiredMissingKey', {
                      wrong: true,
                      type: 'object_missing_key',
                      actual: q.Var('requiredMissingKey'),
                    }),
                  ),
                ),
                [
                  {
                    wrong: q.Not(q.Var('hasProperties')),
                    type: 'object_properties',
                  },
                ],
              ),
            ),
            q.Var('errors'),
          ),
        },
      );
    },
  },
});
