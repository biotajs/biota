import { Builder, types } from '@biota/builder';
import { ExprArg, query as q } from 'faunadb';
import packagejson from './../../package.json';

const build = new Builder({
  lib: 'biota.schema',
  version: packagejson.version,
  path: 'schema',
});

export const schemaName = (name: string) => name + '.schema';
export const schemaNameFQL = (name: ExprArg) => q.Concat([name, '.schema'], '');

export const schema: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Upsert: {
    name: 'Upsert',
    params: ['name', 'definition', 'version'],
    defaults: [null, {}, null],
    query(name, definition, version) {
      return q.Let(
        {
          ref: q.Function(schemaNameFQL(name)),
          updatedDefinition: q.Merge(definition, { $id: schemaNameFQL(name) }),
        },
        q.If(
          q.Exists(q.Var('ref')),
          q.Let(
            {
              fn: q.Get(q.Var('ref')),
              currentVersion: q.Select('version', q.Var('fn'), null),
              version: q.If(q.IsString(version), version, q.Var('currentVersion')),
            },
            q.Replace(q.Var('ref'), {
              body: q.Query(
                q.Lambda('x', {
                  definition,
                  version: q.Var('version'),
                }),
              ),
            }),
          ),
          q.CreateFunction({
            name: schemaNameFQL(name),
            body: q.Query(
              q.Lambda('x', {
                definition,
                version: q.Var('version'),
              }),
            ),
          }),
        ),
      );
    },
  },
  Delete: {
    name: 'Delete',
    params: ['name'],
    query(name) {
      return q.Let(
        {
          ref: q.Function(schemaNameFQL(name)),
        },
        q.If(q.Exists(q.Var('ref')), q.Delete(q.Var('ref')), null),
      );
    },
  },
});
