import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from '../__test__/values';
import { object } from './object';

describe('ObjectValidate', () => {
  const isItValid = isItValidAndNotSanitized(object);

  isItValid(`[object] is object`, values.object);
  isItValid(`[object_deep] is object`, values.object_deep);
  isItValid(`[object_numbers] is object`, values.object_numbers);
  isItValid(`[null] is any`, values.null, {}, false, true);

  Object.entries(values)
    .filter(([key]) => !key.startsWith('object') && !['array_from_object'].includes(key) && !['null'].includes(key))
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not object`, value, {}, false);
    });
});
