import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from '../__test__/values';
import { key } from './key';

describe('KeyValidate', () => {
  const isItValid = isItValidAndNotSanitized(key);

  isItValid(`[key] is key`, values.key);

  Object.entries(values)
    .filter(([key]) => !key.startsWith('key'))
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not key`, value, {}, false);
    });
});
