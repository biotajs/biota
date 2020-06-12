import { any } from './any';
import { values } from './../__test__/values';
import { isItValidAndNotSanitized } from '../__test__/wrapper';

describe('any', () => {
  const isItValid = isItValidAndNotSanitized(any);
  isItValid(`[null] is any`, values.null, {}, true, true);
  Object.entries(values)
    .filter((v) => !['null'].includes(v[0]))
    .forEach(([key, value]) => {
      isItValid(`[${key}] is any`, value);
    });
});
