import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from '../__test__/values';
import { string } from './string';

describe('StringValidate', () => {
  const isItValid = isItValidAndNotSanitized(string);

  isItValid(`[string] is string`, values.string);
  isItValid(`[string_numeric] is string`, values.string_numeric);

  Object.entries(values)
    .filter(
      ([key]) =>
        !key.startsWith('string') &&
        ![
          'array_from_string',
          'array_from_string_path',
          'array_of_strings',
          'boolean_from_string_true',
          'boolean_from_string_false',
          'boolean_from_string_on',
          'boolean_from_string_off',
          'number_integer_from_string',
          'number_float_from_string',
        ].includes(key),
    )
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not string`, value, {}, false);
    });
});
