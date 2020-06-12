import { values } from '../__test__/values';
import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { boolean } from './boolean';

describe('BooleanValidat', () => {
  const isItValid = isItValidAndNotSanitized(boolean);

  isItValid(`[boolean_true] is boolean`, values.boolean_true);
  isItValid(`[boolean_false] is boolean`, values.boolean_false);
  isItValid(`[null] is any`, values.null, {}, false, true);

  Object.entries(values)
    .filter(([key]) => !key.startsWith('boolean') && !['null'].includes(key))
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not boolean`, value, {}, false);
    });
});
