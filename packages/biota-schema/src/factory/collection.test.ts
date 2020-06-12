import { query as q } from 'faunadb';
import { client } from '../__test__/client';
import { values } from '../__test__/values';
import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { collection } from './collection';

describe('CollectionValidate', () => {
  const state = {
    db: client(),
    drop: null,
  };

  beforeAll(() => {
    return state.db
      .query(
        q.If(
          q.Exists(q.Collection('letters')),
          null,
          q.CreateCollection({
            name: 'letters',
          }),
        ),
      )
      .catch(console.error);
  });

  const isItValid = isItValidAndNotSanitized(collection, state);

  isItValid(`[collection] is collection`, values.collection);
  isItValid(`[null] is any`, values.null, {}, false, true);

  Object.entries(values)
    .filter(([key]) => !key.startsWith('collection') && !['null'].includes(key))
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not collection`, value, {}, false);
    });
});
