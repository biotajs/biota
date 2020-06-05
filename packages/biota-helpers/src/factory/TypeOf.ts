import { Builder, types } from '@biota/builder';
import { factory } from '@biota/constants';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

import { Switch } from './Switch';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const TypeOf: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'TypeOf',
  params: ['value'],
  query(value) {
    return q.Let(
      {
        value,
        types: factory.constants.Types.response(),
        tests: [
          q.If(q.IsArray(q.Var('value')), q.Select('array', q.Var('types'), null), null),
          q.If(q.IsBoolean(q.Var('value')), q.Select('boolean', q.Var('types'), null), null),
          q.If(q.IsBytes(q.Var('value')), q.Select('bytes', q.Var('types'), null), null),
          q.If(q.IsCollection(q.Var('value')), q.Select('collection', q.Var('types'), null), null),
          q.If(q.IsCredentials(q.Var('value')), q.Select('credentials', q.Var('types'), null), null),
          q.If(q.IsDatabase(q.Var('value')), q.Select('database', q.Var('types'), null), null),
          q.If(q.IsDate(q.Var('value')), q.Select('date', q.Var('types'), null), null),
          q.If(q.IsFunction(q.Var('value')), q.Select('function', q.Var('types'), null), null),
          q.If(q.IsIndex(q.Var('value')), q.Select('index', q.Var('types'), null), null),
          q.If(q.IsKey(q.Var('value')), q.Select('key', q.Var('types'), null), null),
          q.If(q.IsLambda(q.Var('value')), q.Select('lambda', q.Var('types'), null), null),
          q.If(q.IsNull(q.Var('value')), q.Select('null', q.Var('types'), null), null),
          q.If(q.IsNumber(q.Var('value')), q.Select('number', q.Var('types'), null), null),
          q.If(q.IsObject(q.Var('value')), q.Select('object', q.Var('types'), null), null),
          q.If(q.IsRole(q.Var('value')), q.Select('role', q.Var('types'), null), null),
          q.If(q.IsSet(q.Var('value')), q.Select('set', q.Var('types'), null), null),
          q.If(q.IsString(q.Var('value')), q.Select('string', q.Var('types'), null), null),
          q.If(q.IsTimestamp(q.Var('value')), q.Select('time', q.Var('types'), null), null),
          q.If(q.IsToken(q.Var('value')), q.Select('token', q.Var('types'), null), null),
          q.If(
            q.IsDoc(q.Var('value')),
            q.If(q.Exists(q.Var('value')), q.Select('document', q.Var('types'), null), null),
            null,
          ),
          q.If(q.IsRef(q.Var('value')), q.Select('reference', q.Var('types'), null), null),
        ],
        matches: q.Filter(q.Var('tests'), q.Lambda('test', q.Not(q.IsNull(q.Var('test'))))),
        type: q.Select(0, q.Var('matches'), null),
      },
      q.Var('type'),
    );
  },
});
