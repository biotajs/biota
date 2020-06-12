import { query as q } from 'faunadb';
import { collection } from '../../../factory/collection';

export const Get = (global) => {
  return () => {
    test('Get', async () => {
      try {
        const response = await global.db.query(
          q.Let(
            {
              ref: q.Select('ref', collection.Get.callResponse(global.ref), null),
            },
            {
              ref: q.Var('ref'),
            },
          ),
        );
        expect(response.ref).toMatchObject(global.ref);
      } catch (error) {
        console.error(error);
      }
    }, 10000);
  };
};
