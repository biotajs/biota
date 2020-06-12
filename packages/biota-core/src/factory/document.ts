import { Builder, types } from '@biota/builder';
import { codes } from '@biota/error';
import { factory as schema } from '@biota/schema';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';
import { data as dataFactory } from './data';
import { Pagination } from '../wrappers/pagination';

const build = new Builder({ lib: 'biota.core', path: 'document', version: packagejson.version });

// #improve check the defaults!

const checkIfCollectionIsString = (collection) => {
  return {
    collection: q.Select(
      'value',
      schema.validate.ValidateThrow.response(codes.data_validation_failed.name, collection, {
        type: 'string',
      }),
      collection,
    ),
  };
};

const checkIfIdIsStringOrConvertible = (id) => {
  return {
    id: q.Select(
      'value',
      schema.validate.ValidateThrow.response(codes.data_validation_failed.name, id, {
        type: 'string|convert|numeric',
      }),
      id,
    ),
  };
};

const checkRefExists = (collection, id) => {
  return {
    ...checkIfCollectionIsString(collection),
    ...checkIfIdIsStringOrConvertible(id),
    ref: q.Ref(q.Collection(collection), id),
    valid: schema.validate.ValidateThrow.response(codes.instance_not_found.name, q.Var('ref'), {
      type: 'document',
    }),
  };
};

const checkRefDoesntExists = (collection, id) => {
  return {
    ...checkIfCollectionIsString(collection),
    ...checkIfIdIsStringOrConvertible(id),
    ref: q.Ref(q.Collection(collection), id),
    valid: schema.validate.ValidateThrow.response(codes.instance_already_exists.name, q.Var('ref'), {
      type: 'reference',
      notExists: true,
    }),
  };
};

const checkSchema = (_, __, data) => ({
  schema: schema.validate.ValidateThrow.response(codes.data_validation_failed.name, data, {
    type: 'schema',
    schema: schema.document.Schema.udfName(),
    options: {},
  }),
});

const checkSchemaOptionals = (_, __, data) => ({
  schema: schema.validate.ValidateThrow.response(codes.data_validation_failed.name, data, {
    type: 'schema',
    schema: schema.document.Schema.udfName(),
    options: { optionals: '*' },
  }),
});

const beforeSimple = (collection, id, data) => ({
  ...checkIfCollectionIsString(collection),
  ...checkIfIdIsStringOrConvertible(id),
  ...checkSchemaOptionals(collection, id, data),
});

const beforeExists = (collection, id) => ({
  ...checkRefExists(collection, id),
});

const beforeDoesntExists = (collection, id, data) => ({
  ...checkRefDoesntExists(collection, id),
  ...checkSchema(collection, id, data),
});

export const document: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  History: {
    name: 'History',
    params: ['collection', 'id', 'pagination'],
    defaults: [null, null, {}],
    before: beforeExists,
    query(collection, id, pagination) {
      return Pagination(q.Events(q.Ref(q.Collection(collection), id)), pagination);
    },
  },
  Snapshot: {
    name: 'Snapshot',
    params: ['collection', 'id', 'at'],
    defaults: [null, null, q.Now()],
    before: beforeExists,
    query(collection, id, at) {
      return q.Get(q.Ref(q.Collection(collection), id), at);
    },
  },
  Get: {
    name: 'Get',
    params: ['collection', 'id'],
    defaults: [null, null],
    before: beforeExists,
    query(collection, id) {
      return q.Get(q.Ref(q.Collection(collection), id));
    },
  },
  Insert: {
    name: 'Insert',
    params: ['collection', 'data', 'id'],
    defaults: [null, {}, null],
    before: beforeDoesntExists,
    annotate: 'insert',
    query(collection, data, id) {
      return q.If(
        q.IsString(id),
        q.Create(q.Ref(q.Collection(collection), id), data),
        q.Create(q.Collection(collection), data),
      );
    },
    action: 'insert',
  },
  Update: {
    name: 'Update',
    params: ['collection', 'id', 'data'],
    defaults: [null, null, {}],
    before: beforeSimple,
    annotate: 'update',
    query(collection, id, data) {
      return q.Update(q.Ref(q.Collection(collection), id), { data });
    },
    action: 'update',
  },
  Upsert: {
    name: 'Upsert',
    params: ['collection', 'id', 'data'],
    defaults: [null, null, {}],
    before: beforeSimple,
    query(collection, id, data) {
      return q.If(
        q.Select(
          'valid',
          schema.validate.Validate.response(q.Ref(q.Collection(collection), id), { type: 'document' }),
          false,
        ),
        document.Update.response(collection, id, data),
        document.Insert.response(collection, id, data),
      );
    },
  },
  Replace: {
    name: 'Replace',
    params: ['collection', 'id', 'data'],
    defaults: [null, null, {}],
    before(collection, id, data) {
      return {
        ...checkRefExists(collection, id),
        doc: document.Get.response(collection, id),
        data: q.Select('data', q.Var('doc'), {}),
      };
    },
    annotate: 'replace',
    query(collection, id, data) {
      return q.Replace(q.Ref(q.Collection(collection), id), { data });
    },
    action: 'replace',
  },
  Repsert: {
    name: 'Repsert',
    params: ['collection', 'id', 'data'],
    defaults: [null, null, {}],
    before: beforeSimple,
    query(collection, id, data) {
      return q.If(
        q.Select(
          'valid',
          schema.validate.Validate.response(q.Ref(q.Collection(collection), id), { type: 'document' }),
          false,
        ),
        document.Replace.response(collection, id, data),
        document.Insert.response(collection, id, data),
      );
    },
  },
  Delete: {
    name: 'Delete',
    params: ['collection', 'id'],
    defaults: [null, null],
    before: beforeExists,
    annotate: 'delete',
    query(collection, id) {
      return document.Upsert.response(collection, id, q.Var('data'));
    },
    action: 'delete',
  },
  Restore: {
    name: 'Restore',
    params: ['collection', 'id'],
    defaults: [null, null],
    before(collection, id) {
      return {
        ...checkRefExists(collection, id),
        doc: document.Get.response(collection, id),
        data: q.Select('data', q.Var('doc'), {}),
        isDeleted: dataFactory.IsDeleted.response(q.Var('data')),
        isExpired: dataFactory.IsExpired.response(q.Var('data')),
      };
    },
    annotate: 'restore',
    query(collection, id) {
      return document.Upsert.response(collection, id, q.Var('data'));
    },
    action: 'restore',
  },
  Forget: {
    name: 'Forget',
    params: ['collection', 'id'],
    defaults: [null, null],
    before: beforeExists,
    annotate: 'forget',
    query(collection, id) {
      return document.Upsert.response(collection, id, q.Var('data'));
    },
    action: 'forget',
    after(collection, id) {
      return {
        response: q.Delete(q.Ref(q.Collection(collection), id)),
      };
    },
  },
  Drop: {
    name: 'Drop',
    params: ['collection', 'id'],
    defaults: [null, null],
    before: beforeExists,
    query(collection, id) {
      return q.If(
        q.Select(
          'valid',
          schema.validate.Validate.response(q.Var('ref'), {
            type: 'document',
          }),
          false,
        ),
        document.Forget.response(collection, id),
        {}, // do nothing, be friendly!
      );
    },
  },
  Expire: {
    name: 'Expire',
    params: ['collection', 'id', 'at'],
    defaults: [null, null, q.Now()],
    before(collection, id, at) {
      return {
        isTime: schema.validate.ValidateThrow.response(codes.data_validation_failed.name, at, { type: 'time' }),
        ...checkRefExists(collection, id),
        annotate: {
          at,
        },
      };
    },
    annotate: 'expire',
    query(collection, id) {
      return document.Upsert.response(collection, id, q.Var('data'));
    },
    action: 'expire',
  },
  ExpireIn: {
    name: 'ExpireIn',
    params: ['collection', 'id', 'delay'],
    defaults: [null, null, 0],
    query(collection, id, delay) {
      return document.Expire.response(collection, id, q.TimeAdd(q.Now(), q.ToNumber(delay), 'milliseconds'));
    },
  },
  ExpireNow: {
    name: 'ExpireNow',
    params: ['collection', 'id'],
    defaults: [null, null],
    query(collection, id) {
      return document.Expire.response(collection, id);
    },
  },
});
