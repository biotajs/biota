import { query as q } from 'faunadb';
import { Builder, types } from '@biota/builder';
import { factory as error, codes } from '@biota/error';
import { factory as schema } from '@biota/schema';
import packagejson from '../../package.json';

const build = new Builder({ lib: 'biota.core', path: 'collection', version: packagejson.version });

export const collection: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  FindAll: {
    name: 'FindAll',
    params: ['name', 'pagination'],
    defaults: [null, {}],
    query(name, pagination) {
      return q.Map(
        q.Paginate(q.Documents(q.Collection(name)), {}), // pagination as Object
        // q.Paginate(q.Documents(q.Var('name')), wrappersPagination(q.Var('pagination'))),
        q.Lambda('x', q.Get(q.Var('x'))),
      );
    },
  },
  Get: {
    name: 'Get',
    params: ['name'],
    defaults: [null],
    before(name) {
      return {
        ref: q.Collection(name),
        validation: schema.validate.Validate.response(q.Var('ref'), { type: 'collection' }),
        valid: q.If(
          q.Select('valid', q.Var('validation'), false),
          true,
          error.error.Throw.response(codes.instance_not_found.name, { ref: q.Var('ref') }),
        ),
      };
    },
    query(name) {
      return q.Get(q.Collection(name));
    },
  },
});
