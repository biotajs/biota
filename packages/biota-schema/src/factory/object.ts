import { Builder, types } from '@biota/builder';
import { factory as helpers } from '@biota/helpers';
import { query as q } from 'faunadb';
import packagejson from './../../package.json';
import { constructors } from './constructors';
import { default_ } from './default';

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
        ['allowAdditionals'],
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
          propertiesDefinition: q.If(
            q.IsObject(q.Var('properties')),
            q.Reduce(
              q.Lambda(
                ['reduced', 'keyValue'],
                q.Merge(
                  q.Var('reduced'),
                  q.ToObject([
                    [
                      q.Select(0, q.Var('keyValue')),
                      { validate: constructors.FormatDefinition.response(q.Select(1, q.Var('keyValue'))) },
                    ],
                  ]),
                ),
              ),
              {},
              q.ToArray(q.Var('properties')),
            ),
            q.Var('properties'),
          ),
          hasProperties: q.IsObject(q.Var('propertiesDefinition')),
          // ↓
          allowAdditionals: q.Select('allowAdditionals', options, false),
          // ↓
          requiredFields: q.Select('required', options, null),
          hasRequiredFields: q.IsArray(q.Var('requiredFields')),
          // ↓
          // generalDefinition: q.IsString(q.Var('properties')),
          // ↓
          newState: q.Merge(state, {
            method: 'properties',
            // generalDefinition: q.Var('generalDefinition'),
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
            // q.And(IsTrue(q.Var('generalDefinition')), IsTrue(q.Var('hasProperties'))),
            q.Var('hasProperties'),
            q.Map(q.ToArray(q.Var('propertiesDefinition')), q.Lambda(['key', 'value'], q.Var('key'))),
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
              q.Not(q.Select([q.Var('missingKey'), 'validate', 'optional'], q.Var('propertiesDefinition'), false)),
            ),
          ),
          hasRequiredMissingKeys: q.IsNonEmpty(q.Var('requiredMissingKeys')),
          // ↓
          result: q.If(
            q.And(
              q.Equals(q.Var('hasProperties'), true),
              q.Not(q.Var('hasForbiddenKeys')),
              q.Not(q.Var('hasRequiredMissingKeys')),
            ),
            constructors.ArrayComposeResolver.response(
              q.Var('checkedObjectArray'),
              q.Var('propertiesDefinition'),
              q.Merge(state, { object: true }),
              {
                validate: `biota.schema@${packagejson.version}+Validate`,
              },
              ['validate'],
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
              state,
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
