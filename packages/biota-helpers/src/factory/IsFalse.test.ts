import { client } from '@biota/test';
import { Expr } from 'faunadb';
import { values } from '../__test__/values';
import { IsFalse } from './IsFalse';

const testWrapper = (action: string, value: any, valid: boolean = true) => {
  return test(`[${action}] is false`, () => {
    return client()
      .query(IsFalse.response(value) as Expr)
      .then((response: any) => {
        expect(response).toBe(valid);
      });
  }, 10000);
};

describe('IsFalse', () => {
  testWrapper('BIOTA.FALSE', 'BIOTA.FALSE', true);
  testWrapper('array', values.array, false);
  testWrapper('boolean_true', values.boolean_true, false);
  testWrapper('boolean_false', values.boolean_false, false);
  testWrapper('boolean_from_string_true', values.boolean_from_string_true, false);
  testWrapper('boolean_from_string_false', values.boolean_from_string_false, false);
});
