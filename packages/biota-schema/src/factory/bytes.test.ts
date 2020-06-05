import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from './../__test__/values';
import { bytes } from './bytes';

describe('BytesValidate', () => {
  const isItValid = isItValidAndNotSanitized(bytes);

  isItValid(`[bytes] is bytes`, values.bytes);
  isItValid(`[bytes_uint8array] is bytes`, values.bytes_uint8array);

  Object.entries(values)
    .filter(([key]) => !key.startsWith('bytes'))
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not bytes`, value, {}, false);
    });
});
