import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const AddUniqueItem: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'AddUniqueItem',
  params: ['list', 'newItem'],
  defaults: [[], null],
  query(list, newItem) {
    return q.Distinct(q.Union(list, [newItem]));
  },
});
