import { client } from '@biota/test';
import { Expr } from 'faunadb';
import { values } from '../__test__/values';
import { ConvertToBoolean } from './ConvertToBoolean';

const testWrapper = (action: string, value: any, result: boolean) => {
  return test(`[${action}] has been converted to boolean`, () => {
    return client()
      .query(ConvertToBoolean.response(value) as Expr)
      .then((response: any) => {
        expect(response).toBe(result);
      });
  }, 10000);
};

describe('ConvertToBoolean', () => {
  testWrapper('boolean_true', values.boolean_true, true);
  testWrapper('boolean_false', values.boolean_false, false);
  testWrapper('boolean_from_number_1', values.boolean_from_number_1, true);
  testWrapper('boolean_from_number_0', values.boolean_from_number_0, false);
  testWrapper('boolean_from_string_true', values.boolean_from_string_true, true);
  testWrapper('boolean_from_string_false', values.boolean_from_string_false, false);
  testWrapper('boolean_from_string_on', values.boolean_from_string_on, true);
  testWrapper('boolean_from_string_off', values.boolean_from_string_off, false);
});
