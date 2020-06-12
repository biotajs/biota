import { Builder, types } from '@biota/builder';
import { codes } from '@biota/error';
import { factory as schema } from '@biota/schema';
import { query as q } from 'faunadb';
import packagejson from '../../package.json';
import { data as dataFactory } from './data';

const build = new Builder({ lib: 'biota.core', path: 'role', version: packagejson.version });

const checkRefExists = (name) => {
  return {
    ref: q.Role(name),
    valid: schema.validate.ValidateThrow.response(codes.instance_not_found.name, q.Var('ref'), {
      type: 'role',
    }),
  };
};

const checkRefDoesntExists = (name) => {
  return {
    ref: q.Role(name),
    valid: schema.validate.ValidateThrow.response(codes.instance_already_exists.name, q.Var('ref'), {
      type: 'reference',
      notExists: true,
    }),
  };
};

const updateInputs = (name, options) => ({
  options: q.Merge({ name }, options),
  name: q.Select('name', options, null),
});

const setData = (_, options) => ({
  data: q.Select('data', options, {}),
});

const checkSchema = (_, options) => ({
  schema: schema.validate.ValidateThrow.response(codes.data_validation_failed.name, options, {
    type: 'schema',
    schema: schema.role.Schema.udfName(),
    options: {},
  }),
});

const checkSchemaOptionals = (_, options) => ({
  schema: schema.validate.ValidateThrow.response(codes.data_validation_failed.name, options, {
    type: 'schema',
    schema: schema.role.Schema.udfName(),
    options: { optionals: '*' },
  }),
});

const beforeSimple = (name, options) => ({
  ...updateInputs(name, options),
  ...setData(name, options),
  ...checkSchemaOptionals(name, options),
});

const beforeExists = (name) => ({
  ...checkRefExists(name),
});

const beforeDoesntExists = (name, options) => ({
  ...updateInputs(name, options),
  ...checkRefDoesntExists(name),
  ...setData(name, options),
  ...checkSchema(name, options),
});

export const role: types.BiotaBuilderMethodOutputAPIKeyed = build.methods({
  Get: {
    name: 'Get',
    params: ['name'],
    defaults: [null],
    before: beforeExists,
    query(name) {
      return q.Get(q.Role(name));
    },
  },
  Insert: {
    name: 'Insert',
    params: ['name', 'options'],
    defaults: [null, {}],
    before: beforeDoesntExists,
    annotate: 'insert',
    query(_, options) {
      return q.CreateRole(q.Merge(options, { data: q.Var('data') }));
    },
    action: 'insert',
  },
  Update: {
    name: 'Update',
    params: ['name', 'options'],
    defaults: [null, {}],
    before: beforeSimple,
    annotate: 'update',
    query(name, options) {
      return q.Update(q.Role(name), q.Merge(options, { data: q.Var('data') }));
    },
    action: 'update',
  },
  Upsert: {
    name: 'Upsert',
    params: ['name', 'options'],
    defaults: [null, {}],
    before: beforeSimple,
    query(name, options) {
      return q.If(
        q.Select('valid', schema.validate.Validate.response(q.Role(name), { type: 'role' }), false),
        role.Update.response(name, options),
        role.Insert.response(name, options),
      );
    },
  },
  Replace: {
    name: 'Replace',
    params: ['name', 'options'],
    defaults: [null, {}],
    before(name, options) {
      return {
        ...updateInputs(name, options),
        ...checkRefExists(name),
        doc: role.Get.response(name),
        data: q.Select('data', q.Var('doc'), {}),
      };
    },
    annotate: 'replace',
    query(name, options) {
      return q.Replace(q.Role(name), q.Merge(q.Merge({ name }, options), { data: q.Var('data') }));
    },
    action: 'replace',
  },
  Repsert: {
    name: 'Repsert',
    params: ['name', 'options'],
    defaults: [null, {}],
    before: beforeSimple,
    query(name, options) {
      return q.If(
        q.Select('valid', schema.validate.Validate.response(q.Role(name), { type: 'role' }), false),
        role.Replace.response(name, options),
        role.Insert.response(name, options),
      );
    },
  },
  Delete: {
    name: 'Delete',
    params: ['name'],
    defaults: [null],
    before: beforeExists,
    annotate: 'delete',
    query(name) {
      return role.Upsert.response(name, { data: q.Var('data') });
    },
    action: 'delete',
  },
  Restore: {
    name: 'Restore',
    params: ['name'],
    defaults: [null],
    before(name) {
      return {
        ...checkRefExists(name),
        doc: role.Get.response(name),
        data: q.Select('data', q.Var('doc'), {}),
        isDeleted: dataFactory.IsDeleted.response(q.Var('data')),
        isExpired: dataFactory.IsExpired.response(q.Var('data')),
      };
    },
    annotate: 'restore',
    query(name) {
      return role.Upsert.response(name, { data: q.Var('data') });
    },
    action: 'restore',
  },
  Forget: {
    name: 'Forget',
    params: ['name'],
    defaults: [null],
    before: beforeExists,
    annotate: 'forget',
    query(name) {
      return role.Upsert.response(name, { data: q.Var('data') });
    },
    action: 'forget',
    after(name) {
      return {
        response: q.Delete(q.Role(name)),
      };
    },
  },
  Drop: {
    name: 'Drop',
    params: ['name'],
    defaults: [null],
    before: beforeExists,
    query(name) {
      return q.If(
        q.Select(
          'valid',
          schema.validate.Validate.response(q.Var('ref'), {
            type: 'role',
          }),
          false,
        ),
        role.Forget.response(name),
        {}, // do nothing, be friendly!
      );
    },
  },
  Expire: {
    name: 'Expire',
    params: ['name', 'at'],
    defaults: [null, q.Now()],
    before(name, at) {
      return {
        isTime: schema.validate.ValidateThrow.response(codes.data_validation_failed.name, at, { type: 'time' }),
        ...checkRefExists(name),
        annotate: {
          at,
        },
      };
    },
    annotate: 'expire',
    query(name) {
      return role.Upsert.response(name, { data: q.Var('data') });
    },
    action: 'expire',
  },
  ExpireIn: {
    name: 'ExpireIn',
    params: ['name', 'delay'],
    defaults: [null, 0],
    query(name, delay) {
      return role.Expire.response(name, q.TimeAdd(q.Now(), q.ToNumber(delay), 'milliseconds'));
    },
  },
  ExpireNow: {
    name: 'ExpireNow',
    params: ['name'],
    defaults: [null],
    query(name) {
      return role.Expire.response(name);
    },
  },
});
