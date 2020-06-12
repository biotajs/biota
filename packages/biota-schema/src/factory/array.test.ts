import { values } from '../__test__/values';
import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { array } from './array';

describe('ArrayValidate', () => {
  const isItValid = isItValidAndNotSanitized(array);

  // types
  isItValid(`[array] is array`, values.array);
  isItValid(`[array_tuple] is array`, values.array_tuple, { items: ['string', 'number'] });
  isItValid(`[array_of_strings] is array`, values.array_of_strings, {
    items: { type: 'string' },
  });
  isItValid(`[array_of_numbers] is array`, values.array_of_numbers, {
    items: { type: 'number' },
  });
  isItValid(`[array_of_objects] is array`, values.array_of_objects, {
    items: { type: 'object' },
  });

  // sanitized
  isItValid(
    `[array_from_string] is array`,
    values.array_from_string,
    {
      convert: true,
      delimiter: ';',
      items: { type: 'string' },
    },
    true,
    true,
  );

  isItValid(
    `[array_from_object] is an array of given tuples`,
    values.array_from_object,
    {
      convert: true,
      items: {
        type: 'array',
        items: [
          {
            type: 'string',
          },
          {
            type: 'number',
          },
        ],
      },
    },
    true,
    true,
  );

  isItValid(
    `[array_from_object] is not the given array of tuples`,
    values.array_from_object,
    {
      convert: true,
      items: {
        type: 'array',
        items: [
          {
            type: 'string',
          },
          {
            type: 'string',
          },
        ],
      },
    },
    false,
    true,
  );

  isItValid(`[null] is any`, values.null, {}, false, true);

  Object.entries(values)
    .filter(([key]) => !key.startsWith('array') && !['bytes_uint8array'].includes(key) && !['null'].includes(key))
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not array`, value, {}, false);
    });
});
