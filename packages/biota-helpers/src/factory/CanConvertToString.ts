import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const CanConvertToString: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'CanConvertToString',
  params: ['value'],
  query(value) {
    return q.Let(
      {
        isString: q.IsString(value),
        isNumber: q.IsNumber(value),
        isBoolean: q.IsBoolean(value),
        isNull: q.IsNull(value),
        isTime: q.IsTimestamp(value),
        isDate: q.IsDate(value),
      },
      q.Or(q.Var('isString'), q.Var('isNull'), q.Var('isNumber'), q.Var('isBoolean'), q.Var('isTime'), q.Var('isDate')),
    );
  },
});
