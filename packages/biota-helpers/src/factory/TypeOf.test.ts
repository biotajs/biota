import { client } from '@biota/test';
import { Expr, query as q } from 'faunadb';
import { values } from '../__test__/values';
import { TypeOf } from './TypeOf';

const testWrapper = (action: string, value: any, type: string) => {
  return test(`[${action}] type has been identified as [${type}]`, () => {
    return client()
      .query(TypeOf.response(value) as Expr)
      .then((response: any) => {
        expect(response).toEqual(type);
      });
  }, 10000);
};

describe('TypeOf', () => {
  beforeAll(() => {
    return client()
      .query(
        q.Do(
          q.If(q.Exists(q.Database('child_db')), null, q.CreateDatabase({ name: 'child_db' })),
          q.If(q.Exists(q.Collection('letters')), null, q.CreateCollection({ name: 'letters' })),
        ),
      )
      .then(() =>
        client().query(
          q.Do(
            q.If(
              q.Exists(q.Ref(q.Collection('letters'), '123')),
              null,
              q.Create(q.Ref(q.Collection('letters'), '123'), { data: {} }),
            ),
            q.If(q.Exists(q.Role('employees')), null, q.CreateRole({ name: 'employees', privileges: [] })),
            q.If(
              q.Exists(q.Index('all_letters')),
              null,
              q.CreateIndex({ name: 'all_letters', source: q.Collection('letters') }),
            ),
          ),
        ),
      )
      .then(() => console.log('beforeAll done!'))
      .catch(console.error);
  });

  testWrapper('array', values.array, 'array');
  testWrapper('boolean_false', values.boolean_false, 'boolean');
  testWrapper('bytes', values.bytes_uint8array, 'bytes');
  testWrapper('collection', values.collection, 'collection');
  // testWrapper('credentials', values.credentials, 'credentials');
  testWrapper('database', values.database, 'database');
  testWrapper('date', values.date, 'date');
  testWrapper('document', values.document, 'document');
  testWrapper('function', q.Function(TypeOf.udfName()), 'function');
  testWrapper('index', values.index, 'index');
  testWrapper('key', values.key, 'key');
  // testWrapper('lambda', values.lambda, 'lambda');
  testWrapper('null', values.null, 'null');
  testWrapper('number', values.number_float, 'number');
  testWrapper('object', values.object, 'object');
  testWrapper('reference', values.reference, 'reference');
  testWrapper('role', values.role, 'role');
  testWrapper('string', values.string, 'string');
  testWrapper('time', values.time_now, 'time');
  testWrapper('token', values.token, 'token');
});
