import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const Slice: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'Slice',
  params: ['array', 'start', 'end'],
  defaults: [[], null, null],
  query(array, start, end) {
    return q.Let(
      {
        // start: q.If(q.And(q.IsNull(start), q.If(q.IsNumber(end), q.LT(end, 0), false)), '', ''),
        endCalc: q.Subtract(q.Add(1, q.If(q.IsNull(end), q.Count(array), end)), start),
      },
      q.Take(q.Var('endCalc'), q.Drop(start, array)),
    );
  },
});
