import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from '../__test__/values';
import { validate } from './validate';

describe('Validate', () => {
  const isItValid = isItValidAndNotSanitized(validate);

  isItValid(`validate a simple`, values.string, { type: 'string' });
  isItValid(`validate all of rules`, values.string, { allOf: [{ type: 'string' }, { type: 'number' }] }, false);
});
