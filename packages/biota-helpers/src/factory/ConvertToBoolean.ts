import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

import { ArrayContains } from './ArrayContains';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const ConvertToBoolean: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'ConvertToBoolean',
  params: ['value'],
  query(value) {
    return q.Let(
      [
        {
          value,
        },
        {
          converted: null,
        },
        {
          converted: q.If(q.IsBoolean(value), value, q.Var('converted')),
        },
        {
          converted: q.If(
            q.And(q.IsString(q.Var('value')), ArrayContains.response(['1', 'on', 'true'], q.Var('value'))),
            true,
            q.Var('converted'),
          ),
        },
        {
          converted: q.If(
            q.And(q.IsString(q.Var('value')), ArrayContains.response(['0', 'off', 'false'], q.Var('value'))),
            false,
            q.Var('converted'),
          ),
        },
        {
          converted: q.If(q.And(q.IsNumber(q.Var('value')), q.Equals(1, q.Var('value'))), true, q.Var('converted')),
        },
        {
          converted: q.If(q.And(q.IsNumber(q.Var('value')), q.Equals(0, q.Var('value'))), false, q.Var('converted')),
        },
      ],
      q.Var('converted'),
    );
  },
});
