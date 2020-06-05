import { client } from '@biota/test';
import { CanConvertToString } from './CanConvertToString';
import { values } from '../__test__/values';
import { ExprArg, Expr } from 'faunadb';

const testWrapper = (action: string, value: any, valid: boolean = true) => {
  return test(`[${action}] can${!valid ? ' not' : ''} be converted to string`, () => {
    return client()
      .query(CanConvertToString.response(value) as Expr)
      .then((response: any) => {
        expect(response).toBe(valid);
      });
  }, 10000);
};

describe('CanConvertToString', () => {
  testWrapper('number_float', values.number_float, true);
  testWrapper('number_integer', values.number_integer, true);
  testWrapper('boolean_true', values.boolean_true, true);
  testWrapper('boolean_false', values.boolean_false, true);
  testWrapper('null', values.null, true);
  testWrapper('time_now', values.time_now, true);
  testWrapper('date', values.date, true);
});
