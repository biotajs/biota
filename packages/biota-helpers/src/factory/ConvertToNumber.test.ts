import { client } from '@biota/test';
import { Expr } from 'faunadb';
import { values } from '../__test__/values';
import { ConvertToNumber } from './ConvertToNumber';

const testWrapper = (action: string, value: any, result: number) => {
  return test(`[${action}] has been converted to number`, () => {
    return client()
      .query(ConvertToNumber.response(value) as Expr)
      .then((response: any) => {
        expect(response).toEqual(result);
      });
  }, 10000);
};

describe('ConvertToNumber', () => {
  testWrapper('number_float', values.number_float, values.number_float);
  testWrapper('number_integer', values.number_integer, values.number_integer);
  testWrapper('number_from_string', values.number_integer_from_string, 10);
  testWrapper('number_float_from_string', values.number_float_from_string, 10.1);
});
