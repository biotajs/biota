import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from '../__test__/values';
import { null_ } from './null';

describe('NullValidate', () => {
  const isItValid = isItValidAndNotSanitized(null_);

  isItValid(`[null] is null`, values.null, {}, true, false);

  Object.entries(values)
    .filter(([key]) => !key.startsWith('null'))
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not null`, value, {}, false);
    });
});
