import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from '../__test__/values';
import { index } from './index';

describe('IndexValidate', () => {
  const isItValid = isItValidAndNotSanitized(index);

  isItValid(`[index] is index`, values.index);
  isItValid(`[null] is any`, values.null, {}, false, true);

  Object.entries(values)
    .filter(([key]) => !key.startsWith('index') && !['null'].includes(key))
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not index`, value, {}, false);
    });
});
