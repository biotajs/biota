import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from '../__test__/values';
import { key } from './key';

describe('KeyValidate', () => {
  const isItValid = isItValidAndNotSanitized(key);

  isItValid(`[key] is key`, values.key);
  isItValid(`[null] is any`, values.null, {}, false, true);

  Object.entries(values)
    .filter(([key]) => !key.startsWith('key') && !['null'].includes(key))
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not key`, value, {}, false);
    });
});
