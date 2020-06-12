import { Builder, types } from '@biota/builder';
import { factory as helpers } from '@biota/helpers';
import { ExprArg, query as q } from 'faunadb';
import packagejson from './../../package.json';

import { constructors } from './constructors';
import { function_ } from './function';

const build = new Builder({
  lib: 'biota.schema',
  version: packagejson.version,
  path: 'schema',
});

export const schemaName = (name: string) => name + '.schema';
export const schemaNameFQL = (name: ExprArg, version: ExprArg) =>
  q.Concat([name, '.schema', q.If(q.IsString(version), q.Concat(['@', version], ''), '')], '');

const before = (_, options, __) => ({
  options: constructors.FormatDefinition.response(options),
});
export const schema: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Validate: {
    name: 'Validate',
    before,
    params: ['value', 'options', 'state'],
    defaults: [null, {}, {}],
    query(value, options, state) {
      return q.Let(
        {
          schema: q.Select('schema', options, null),
          schemaOptions: q.Select('options', options, {}),
          hasSchema: q.If(
            q.IsString(q.Var('schema')),
            q.Select('valid', function_.Validate.response(q.Function(q.Var('schema'))), false),
            false,
          ),
          schemaDefinition: q.If(
            q.Var('hasSchema'),
            q.Select(
              ['response', 'definition'],
              q.Call(q.Var('schema'), q.Var('ctx'), {
                options: q.Var('schemaOptions'),
              }),
              {},
            ),
            {},
          ),
          // ab: q.Abort(q.Format('%@', { hasSchema: q.Var('hasSchema'), options: q.Var('options') })),
          // ab: q.Abort(q.Format('%@', { hasSchema: q.Var('hasSchema'), schemaOptions: q.Var('schemaOptions'), schemaDefinition: q.Var('schemaDefinition') })),
        },
        q.If(
          q.Var('hasSchema'),
          q.Select(
            'response',
            q.Call(`biota.schema@${packagejson.version}+Validate`, q.Var('ctx'), {
              value,
              options: q.Var('schemaDefinition'),
              state,
            }),
            {},
          ),
          '',
        ),
      );
    },
  },
  // Remove the above and replace with the @biota/core!
  Upsert: {
    name: 'Upsert',
    params: ['name', 'body', 'version'],
    defaults: [null, {}, null],
    query(name, body, version) {
      return q.Let(
        {
          ref: q.Function(schemaNameFQL(name, version)),
        },
        q.If(
          q.Exists(q.Var('ref')),
          q.Replace(q.Var('ref'), { body }),
          q.CreateFunction({ name: schemaNameFQL(name, version), body }),
        ),
      );
    },
  },
  Delete: {
    name: 'Delete',
    params: ['name', 'version'],
    defaults: [null, null],
    query(name, version) {
      return q.Let(
        {
          ref: q.Function(schemaNameFQL(name, version)),
        },
        q.If(q.Exists(q.Var('ref')), q.Delete(q.Var('ref')), null),
      );
    },
  },
});
