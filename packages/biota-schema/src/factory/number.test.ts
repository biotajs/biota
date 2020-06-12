import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from '../__test__/values';
import { number } from './number';

describe('ObjectValidate', () => {
  const isItValid = isItValidAndNotSanitized(number);

  isItValid(`[number_float] is number`, values.number_float);
  isItValid(`[number_integer] is number`, values.number_integer);
  isItValid(`[null] is any`, values.null, {}, false, true);

  Object.entries(values)
    .filter(
      ([key]) =>
        !key.startsWith('number_') &&
        !['boolean_from_number_1', 'boolean_from_number_0'].includes(key) &&
        !['null'].includes(key),
    )
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not number`, value, {}, false);
    });
});
