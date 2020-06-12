import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from '../__test__/values';
import { date } from './date';

describe('DateValidate', () => {
  const isItValid = isItValidAndNotSanitized(date);

  isItValid(`[date] is date`, values.date);
  isItValid(`[null] is any`, values.null, {}, false, true);

  Object.entries(values)
    .filter(([key]) => !key.startsWith('date') && !['null'].includes(key),)
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not date`, value, {}, false);
    });
});
