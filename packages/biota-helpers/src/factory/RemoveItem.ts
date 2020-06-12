import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const RemoveItem: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'RemoveItem',
  params: ['list', 'removedItem'],
  defaults: [[], null],
  query(list, removedItem) {
    return q.Difference(list, [removedItem]);
  },
});
