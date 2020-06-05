import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

import { factory } from '@biota/constants';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const ConvertToNumber: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'ConvertToNumber',
  params: ['value'],
  query(value) {
    return q.Let(
      [
        {
          patterns: factory.constants.Patterns.response(),
        },
        {
          SOME_NUM: q.Select('SOME_NUM', q.Var('patterns'), null),
        },
        {
          value,
        },
        {
          converted: null,
        },
        {
          converted: q.If(
            q.IsString(q.Var('value')),
            q.If(
              q.IsString(q.Var('SOME_NUM')),
              q.If(
                q.IsNonEmpty(q.FindStrRegex(q.Var('value'), q.Var('SOME_NUM'))),
                q.ToNumber(q.Var('value')),
                q.Var('converted'),
              ),
              q.Var('converted'),
            ),
            q.Var('converted'),
          ),
        },
        {
          converted: q.If(q.IsNumber(q.Var('value')), q.Var('value'), q.Var('converted')),
        },
      ],
      q.Var('converted'),
    );
  },
});
