import { query as q } from 'faunadb';
import { database } from '../__test__/client';
import { action } from './action';

describe('annotate', () => {
  let global = {
    ref: null,
    db: null,
    drop: null,
  };

  const testAction = (name: string) => {
    test(
      name,
      async (done) => {
        let { response } = await global.db.query(action.log.query(name, global.ref));
        expect(response).toHaveProperty(['data', 'name']);
        expect(response?.data?.name).toBe(name);
        expect(response?.data?.instance).toMatchObject(global.ref);
        done();
      },
      10000,
    );
  };

  beforeAll(async () => {
    const { db, drop } = await database();
    global.db = db;
    global.drop = drop;

    await db.query({
      actions: q.CreateCollection({ name: 'biota.actions' }),
      todos: q.CreateCollection({ name: 'todos' }),
    });

    let res: any = await db.query(q.Create(q.Collection('todos'), { data: { note: 'doing some tests' } }));

    global.ref = res.ref;
  }, 10000);

  testAction('insert');
  testAction('update');
  testAction('replace');
  testAction('delete');
  testAction('forget');
  testAction('restore');
  testAction('remember');
  testAction('expire');
  testAction('credentials_change');
  testAction('auth_email_change');
  testAction('auth_accounts_change');
  testAction('public_change');
  testAction('roles_change');
  testAction('owner_change');
  testAction('assignees_change');

  afterAll(async () => {
    await global.drop();
  });
});
