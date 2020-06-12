import { Builder, types } from '@biota/builder';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';
import { Pagination } from '../wrappers/pagination';

const build = new Builder({ lib: 'biota.core', path: 'credentials', version: packagejson.version });

export const credentials: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  FindByInstance: {
    name: 'FindByInstance',
    params: ['instance', 'pagination'],
    defaults: [null, {}],
    query(instance, pagination) {
      return Pagination(q.Match(q.Index('biota.credentials__by__instance'), instance), pagination);
    },
  },
  FindAll: {
    name: 'FindAll',
    params: ['pagination'],
    defaults: [{}],
    query(pagination) {
      return q.Map(Pagination(q.Documents(q.Credentials()), pagination), q.Lambda('x', q.Get(q.Var('x'))));
    },
  },
});
