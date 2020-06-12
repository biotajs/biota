import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

const build = new Builder({ lib: 'biota.core', path: 'history', version: packagejson.version });

export const history: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  At: {
    name: 'At',
    params: ['ts', 'expression'],
    defaults: [q.Now(), null],
    query(ts, expression) {
      return q.At(ts, expression);
    },
  },
  Events: {
    name: 'Events',
    params: ['ref'],
    defaults: [null],
    query(ref) {
      return q.Events(ref);
    },
  },
});
