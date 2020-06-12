import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const Switch: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'Switch',
  params: ['value', 'cases', 'defaultValue'],
  defaults: [null, {}, null],
  query(value, cases, defaultValue) {
    return q.Let(
      {
        result: q.Reduce(
          q.Lambda(
            ['switch', 'case'],
            q.If(q.Equals(value, q.Select(0, q.Var('case'))), q.Select(1, q.Var('case')), q.Var('switch')),
          ),
          '$$SWITCH_DEFAULT',
          q.ToArray(cases),
        ),
      },
      q.If(q.Equals(q.Var('result'), '$$SWITCH_DEFAULT'), defaultValue, q.Var('result')),
    );
  },
});
