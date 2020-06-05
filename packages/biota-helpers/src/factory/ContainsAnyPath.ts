import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';

import { StringSplit } from './StringSplit';

const build = new Builder({ lib: 'biota.helpers', version: packagejson.version });
export const ContainsAnyPath: types.BiotaBuilderMethodOutputAPI = build.method({
  name: 'ContainsAnyPath',
  params: ['value', 'paths'],
  query(value, paths) {
    return q.Any(q.Map(paths, q.Lambda(['path'], q.Contains(StringSplit.response(q.Var('path')), value))));
  },
});
