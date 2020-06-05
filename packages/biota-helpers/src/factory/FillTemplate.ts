import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const FillTemplate: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'FillTemplate',
  params: ['template', 'keyValues'],
  defaults: ['', {}],
  query(template, keyValues) {
    return q.If(
      q.And(q.IsString(template), q.IsObject(keyValues)),
      q.Reduce(
        q.Lambda(
          ['processed', 'keyValue'],
          q.Let(
            {
              key: q.Select(0, q.Var('keyValue'), null),
              value: q.Select(1, q.Var('keyValue'), null),
            },
            q.If(
              q.IsString(q.Var('value')),
              q.ReplaceStr(q.Var('processed'), q.Var('key'), q.Var('value')),
              q.Var('processed'),
            ),
          ),
        ),
        template,
        q.ToArray(keyValues),
      ),
      template,
    );
  },
});
