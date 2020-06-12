const { deploy } = require('@biota/core');
import { query as q } from 'faunadb';
import { database } from '../__test__/client';
import { collection } from './collection';

describe('collection', () => {
  let global = {
    ref: null,
    db: null,
    drop: null,
  };

  beforeAll(async (done) => {
    const { db, drop, secret } = await database();
    await deploy(secret, { createOnly: true });
    global.db = db;
    global.drop = drop;
    done();
  }, 300000);

  test('Insert', async () => {
    try {
      const response = await global.db.query(
        q.Let(
          {
            ref: q.Select('ref', collection.Insert.callResponse(q.NewId()), null),
          },
          {
            ref: q.Var('ref'),
            isRef: q.IsRef(q.Var('ref')),
          },
        ),
      );
      expect(response.isRef).toEqual(true);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, 10000);

  // test('Get', async () => {
  //   try {
  //     const response = await global.db.query(
  //       q.Let(
  //         {
  //           name: q.NewId(),
  //           createdRef: q.Select('ref', q.CreateCollection({ name: q.Var('name') }), null),
  //           ref: q.Select('ref', collection.Get.callResponse(q.Var('name')), null),
  //         },
  //         {
  //           isRef: q.IsRef(q.Var('ref')),
  //         },
  //       ),
  //     );
  //     expect(response.isRef).toBe(true);
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // }, 10000);

  afterAll(async () => {
    // await global.drop();
  });
});
