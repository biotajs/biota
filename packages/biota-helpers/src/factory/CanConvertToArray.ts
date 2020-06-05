import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const CanConvertToArray: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'CanConvertToArray',
  params: ['value'],
  query(value) {
    return q.Let(
      {
        isString: q.IsString(value), // by splitting on semi-comas ;
        isObject: q.IsObject(value),
      },
      q.Or(q.Var('isString'), q.Var('isObject')),
    );
  },
});
