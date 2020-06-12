import { query as q } from 'faunadb';
import { client } from '../__test__/client';
import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from '../__test__/values';
import { set } from './set';

describe('SetValidate', () => {
  beforeAll(() => {
    return client()
      .query(
        q.If(
          q.Exists(q.Index('all_letters')),
          null,
          q.CreateIndex({
            name: 'all_letters',
            source: q.Collection('letters'),
          }),
        ),
      )
      .catch(console.error);
  });

  const isItValid = isItValidAndNotSanitized(set);

  isItValid(`[set] is set`, q.Match(q.Index('all_letters')));
  isItValid(`[null] is any`, values.null, {}, false, true);

  Object.entries(values)
    .filter(([key]) => !key.startsWith('set') && !['null'].includes(key))
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not set`, value, {}, false);
    });
});
