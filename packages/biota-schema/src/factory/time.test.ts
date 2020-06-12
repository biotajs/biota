import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from '../__test__/values';
import { time } from './time';

describe('TimeValidate', () => {
  const isItValid = isItValidAndNotSanitized(time);

  isItValid(`[time_now] is time`, values.time_now);
  isItValid(`[null] is any`, values.null, {}, false, true);

  Object.entries(values)
    .filter(([key]) => !key.startsWith('time') && !['null'].includes(key))
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not time`, value, {}, false);
    });
});
