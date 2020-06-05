import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const Merge: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'Merge',
  params: ['obj1', 'obj2'],
  query(obj1, obj2) {
    return q.ToObject(q.Append(q.ToArray(obj2), q.ToArray(obj1)));
  },
});
