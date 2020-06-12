import { query as q } from 'faunadb';
import { collection } from '../../../factory/collection';

export const Insert = (global) => {
  return () => {
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
        global.ref = response.ref;
        expect(response.isRef).toEqual(true);
      } catch (error) {
        console.error(error);
      }
    }, 10000);
  };
};
