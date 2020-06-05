import { any } from './any';
import { values } from './../__test__/values';
import { isItValidAndNotSanitized } from '../__test__/wrapper';

describe('any', () => {
  const isItValid = isItValidAndNotSanitized(any);
  Object.entries(values).forEach(([key, value]) => {
    isItValid(`[${key}] is any`, value);
  });
});
