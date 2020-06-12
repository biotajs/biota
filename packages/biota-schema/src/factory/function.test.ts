import { query as q } from 'faunadb';
import { client } from '../__test__/client';
import { isItValidAndNotSanitized } from '../__test__/wrapper';
import { values } from '../__test__/values';
import { function_ } from './function';

describe('FunctionValidate', () => {
  const isItValid = isItValidAndNotSanitized(function_);

  isItValid(`[function] is function`, q.Function(function_.Validate.udfName()));
  isItValid(`[null] is any`, values.null, {}, false, true);

  Object.entries(values)
    .filter(([key]) => !key.startsWith('function') && !['null'].includes(key))
    .forEach(([key, value]) => {
      isItValid(`[${key}] is not function`, value, {}, false);
    });
});
