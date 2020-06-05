import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const DeepMerge: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'DeepMerge',
  params: ['obj1', 'obj2'],
  query(obj1, obj2) {
    return q.Merge(
      obj1,
      obj2,
      q.Lambda(
        ['_', 'sub1', 'sub2'],
        q.If(
          q.And(q.IsObject(q.Var('sub1')), q.IsObject(q.Var('sub2'))),
          DeepMerge.response(q.Var('sub1'), q.Var('sub2')),
          q.Var('sub2'),
        ),
      ),
    );
  },
});
