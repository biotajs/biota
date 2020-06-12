import { Builder, types } from '@biota/builder';
import { codes } from '@biota/error';
import { factory as schema } from '@biota/schema';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';
import { data as dataFactory } from './data';

const build = new Builder({ lib: 'biota.core', path: 'key', version: packagejson.version });

const checkRefExists = (id) => {
  return {
    ref: q.Ref(q.Keys(), id),
    valid: schema.validate.ValidateThrow.response(codes.instance_not_found.name, q.Var('ref'), {
      type: 'key',
    }),
  };
};

const setData = (options) => ({
  data: q.Select('data', options, {}),
});

const checkSchema = (options) => ({
  schema: schema.validate.ValidateThrow.response(codes.data_validation_failed.name, options, {
    type: 'schema',
    schema: schema.key.Schema.udfName(),
    options: {},
  }),
});

const checkSchemaOptionals = (options) => ({
  schema: schema.validate.ValidateThrow.response(codes.data_validation_failed.name, options, {
    type: 'schema',
    schema: schema.key.Schema.udfName(),
    options: { optionals: '*' },
  }),
});

const beforeSimple = (options) => ({
  ...setData(options),
  ...checkSchemaOptionals(options),
});

const beforeExists = (id) => ({
  ...checkRefExists(id),
});

const beforeInsert = (options) => ({
  ...setData(options),
  ...checkSchema(options),
});

export const key: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Get: {
    name: 'Get',
    params: ['id'],
    defaults: [null],
    before: beforeExists,
    query(id) {
      return q.Get(q.Ref(q.Keys(), id));
    },
  },
  Insert: {
    name: 'Insert',
    params: ['options'],
    defaults: [null, {}],
    before: beforeInsert,
    annotate: 'insert',
    query(options) {
      return q.CreateKey(q.Merge(options, { data: q.Var('data') }));
    },
    action: 'insert',
  },
  Update: {
    name: 'Update',
    params: ['id', 'options'],
    defaults: [null, {}],
    before: beforeSimple,
    annotate: 'update',
    query(id, options) {
      return q.Update(q.Ref(q.Keys(), id), q.Merge(options, { data: q.Var('data') }));
    },
    action: 'update',
  },
  Upsert: {
    name: 'Upsert',
    params: ['id', 'options'],
    defaults: [null, {}],
    before: beforeSimple,
    query(id, options) {
      return q.If(
        q.Select('valid', schema.validate.Validate.response(q.Ref(q.Keys(), id), { type: 'key' }), false),
        key.Update.response(id, options),
        key.Insert.response(options),
      );
    },
  },
  Replace: {
    name: 'Replace',
    params: ['id', 'options'],
    defaults: [null, {}],
    before(id, options) {
      return {
        ...checkRefExists(id),
        doc: key.Get.response(id),
        data: q.Select('data', q.Var('doc'), {}),
      };
    },
    annotate: 'replace',
    query(id, options) {
      return q.Replace(q.Ref(q.Keys(), id), q.Merge(options, { data: q.Var('data') }));
    },
    action: 'replace',
  },
  Repsert: {
    name: 'Repsert',
    params: ['id', 'options'],
    defaults: [null, {}],
    before: beforeSimple,
    query(id, options) {
      return q.If(
        q.Select('valid', schema.validate.Validate.response(q.Ref(q.Keys(), id), { type: 'key' }), false),
        key.Replace.response(id, options),
        key.Insert.response(options),
      );
    },
  },
  Delete: {
    name: 'Delete',
    params: ['id'],
    defaults: [null],
    before: beforeExists,
    annotate: 'delete',
    query(id) {
      return key.Upsert.response(id, { data: q.Var('data') });
    },
    action: 'delete',
  },
  Restore: {
    name: 'Restore',
    params: ['id'],
    defaults: [null],
    before(id) {
      return {
        ...checkRefExists(id),
        doc: key.Get.response(id),
        data: q.Select('data', q.Var('doc'), {}),
        isDeleted: dataFactory.IsDeleted.response(q.Var('data')),
        isExpired: dataFactory.IsExpired.response(q.Var('data')),
      };
    },
    annotate: 'restore',
    query(id) {
      return key.Upsert.response(id, { data: q.Var('data') });
    },
    action: 'restore',
  },
  Forget: {
    name: 'Forget',
    params: ['id'],
    defaults: [null],
    before: beforeExists,
    annotate: 'forget',
    query(id) {
      return key.Upsert.response(id, { data: q.Var('data') });
    },
    action: 'forget',
    after(id) {
      return {
        response: q.Delete(q.Ref(q.Keys(), id)),
      };
    },
  },
  Drop: {
    name: 'Drop',
    params: ['id'],
    defaults: [null],
    before: beforeExists,
    query(id) {
      return q.If(
        q.Select(
          'valid',
          schema.validate.Validate.response(q.Var('ref'), {
            type: 'key',
          }),
          false,
        ),
        key.Forget.response(id),
        {}, // do nothing, be friendly!
      );
    },
  },
  Expire: {
    name: 'Expire',
    params: ['id', 'at'],
    defaults: [null, q.Now()],
    before(id, at) {
      return {
        isTime: schema.validate.ValidateThrow.response(codes.data_validation_failed.name, at, { type: 'time' }),
        ...checkRefExists(id),
        annotate: {
          at,
        },
      };
    },
    annotate: 'expire',
    query(id) {
      return key.Upsert.response(id, { data: q.Var('data') });
    },
    action: 'expire',
  },
  ExpireIn: {
    name: 'ExpireIn',
    params: ['id', 'delay'],
    defaults: [null, 0],
    query(id, delay) {
      return key.Expire.response(id, q.TimeAdd(q.Now(), q.ToNumber(delay), 'milliseconds'));
    },
  },
  ExpireNow: {
    name: 'ExpireNow',
    params: ['id'],
    defaults: [null],
    query(id) {
      return key.Expire.response(id);
    },
  },
});
