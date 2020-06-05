import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import { factory } from '@biota/constants';
import packagejson from '../../package.json';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const IsFalse: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'IsFalse',
  params: ['value'],
  query(value) {
    return q.Let(
      {
        strings: factory.constants.Strings.response(),
        FALSE_EXPR: q.If(q.Contains('FALSE_EXPR', q.Var('strings')), q.Select('FALSE_EXPR', q.Var('strings')), false),
      },
      q.If(q.IsString(q.Var('FALSE_EXPR')), q.Equals(value, q.Var('FALSE_EXPR')), false),
    );
  },
});
