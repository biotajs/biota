import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const ArrayContains: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'ArrayContains',
  params: ['array', 'item'],
  query(array, item) {
    return q.GT(q.Count(q.Filter(array, q.Lambda('elem', q.Equals(q.Var('elem'), item)))), 0);
  },
});
