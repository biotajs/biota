import { BiotaBuilderActionApi } from './../types';
import { ExprArg, query as q } from 'faunadb';
import { Builder } from '../builder';
import packagejson from './../../package.json';

const build = new Builder({ lib: 'biota.builder', version: packagejson.version, path: 'action' });
export const action: BiotaBuilderActionApi = (build.methods({
  log: {
    name: 'log',
    params: ['name', 'instance'],
    before: () => ({
      collection: q.Collection(build.actionOptions.collection as ExprArg),
      exists: q.Exists(q.Var('collection')),
    }),
    query(name, instance) {
      return q.If(
        q.And(q.IsString(name), q.IsRef(instance)),
        q.Create(q.Var('collection'), {
          data: {
            name,
            instance,
            ts: q.Now(),
            user: build.identity(q.Var('ctx')),
          },
        }),
        null,
      );
    },
  },
}) as unknown) as BiotaBuilderActionApi;
