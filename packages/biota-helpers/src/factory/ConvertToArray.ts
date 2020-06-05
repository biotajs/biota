import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

import { StringSplit } from './StringSplit';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const ConvertToArray: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'ConvertToArray',
  params: ['value', 'delimiter'],
  defaults: [null, ';'],
  query(value, delimiter) {
    return q.Let(
      [
        {
          value,
        },
        {
          converted: null,
        },
        {
          converted: q.If(q.IsString(q.Var('value')), StringSplit.response(q.Var('value'), delimiter), q.Var('converted')),
        },
        {
          converted: q.If(q.IsObject(q.Var('value')), q.ToArray(q.Var('value')), q.Var('converted')),
        },
      ],
      q.Var('converted'),
    );
  },
});
