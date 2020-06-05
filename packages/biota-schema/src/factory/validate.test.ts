import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from '../__test__/values';
import { validate } from './validate';

describe('Validate', () => {
  const isItValid = isItValidAndNotSanitized(validate);

  isItValid(`validate a simple`, values.string, { Validate: { type: 'string' } });
  isItValid(
    `validate all of rules`,
    values.string,
    { Validate: { allOf: [{ type: 'string' }, { type: 'number' }] } },
    false,
  );
});
