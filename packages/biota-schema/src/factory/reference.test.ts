import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from '../__test__/values';
import { reference } from './reference';

describe('ReferenceValidate', () => {
  const isItValid = isItValidAndNotSanitized(reference);

  isItValid(`[reference] is reference`, values.reference);
  ['collection', 'database', 'function', 'index', 'key', 'role', 'token', 'document'].forEach((key) => {
    isItValid(`[${key}] is reference`, values[key]);
  });
  isItValid(`[null] is any`, values.null, {}, false, true);

  Object.entries(values)
    .filter(
      ([key]) =>
        !key.startsWith('reference') &&
        !['collection', 'database', 'function', 'index', 'key', 'role', 'token', 'document'].includes(key) &&
        !['null'].includes(key),
    )
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not reference`, value, {}, false);
    });
});
