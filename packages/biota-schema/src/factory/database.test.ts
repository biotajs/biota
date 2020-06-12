import { query as q } from 'faunadb';
import { client } from '../__test__/client';
import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from '../__test__/values';
import { database } from './database';

describe('DatabaseValidate', () => {
  beforeAll(() => {
    return client()
      .query(
        q.If(
          q.Exists(q.Database('child_db')),
          null,
          q.CreateDatabase({
            name: 'child_db',
          }),
        ),
      )
      .catch(console.error);
  });

  const isItValid = isItValidAndNotSanitized(database);

  isItValid(`[database] is database`, values.database);
  isItValid(`[null] is any`, values.null, {}, false, true);

  Object.entries(values)
    .filter(([key]) => !key.startsWith('database') && !['null'].includes(key))
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not database`, value, {}, false);
    });
});
