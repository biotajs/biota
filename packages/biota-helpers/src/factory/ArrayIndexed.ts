import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const ArrayIndexed: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'ArrayIndexed',
  params: ['array'],
  query(array) {
    return q.Reduce(
      q.Lambda(['acc', 'val'], q.Append([[q.Count(q.Var('acc')), q.Var('val')]], q.Var('acc'))),
      [],
      array,
    );
  },
});
